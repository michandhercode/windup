import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { sendSealedLetterUnlockedEmail } from '@/lib/email';

/**
 * Scheduled job (vercel.json): emails the owner of every sealed letter whose date has arrived, once.
 * A reminder and a link only; the letter's contents never go in an email.
 *
 * It needs the SERVICE ROLE key because it looks across all accounts. That key bypasses Row Level Security,
 * so it is used only here, on the server, and the route refuses any call that lacks the CRON_SECRET.
 *
 * Run supabase/email_notifications.sql first (it creates the table that makes sure nobody is emailed twice).
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Letters handled per run. Brevo's free plan allows 300 emails a day. */
const BATCH_SIZE = 50;

interface DueLetter {
  thought_id: string;
  user_id: string;
  title: string | null;
  seal_until: string;
}

const secretsMatch = (given: string, expected: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

async function run(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cronSecret || !supabaseUrl || !serviceKey) {
    console.error('[cron] CRON_SECRET, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
    return NextResponse.json({ error: 'The reminder job is not configured.' }, { status: 503 });
  }

  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"
  const authorization = request.headers.get('authorization') ?? '';
  if (!secretsMatch(authorization, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data, error } = await admin.rpc('sealed_letters_due', { p_limit: BATCH_SIZE });
  if (error) {
    console.error('[cron] sealed_letters_due failed', { code: error.code, message: error.message });
    return NextResponse.json(
      { error: 'Could not look up sealed letters. Has supabase/email_notifications.sql been run?' },
      { status: 500 }
    );
  }

  const letters = (data ?? []) as DueLetter[];
  const summary = { due: letters.length, sent: 0, skipped: 0, failed: 0 };

  for (const letter of letters) {
    // 1. Claim the letter first. The table's key makes this atomic: if another run already claimed it, this fails
    //    with 23505 and we skip, so two overlapping runs can never email the same letter twice.
    const { error: claimError } = await admin.from('sealed_letter_notifications').insert({
      thought_id: letter.thought_id,
      user_id: letter.user_id,
      seal_until: letter.seal_until,
    });
    if (claimError) {
      if (claimError.code === '23505') summary.skipped += 1;
      else {
        console.error('[cron] could not claim letter', { code: claimError.code, message: claimError.message });
        summary.failed += 1;
      }
      continue;
    }

    // 2. Find where to send it
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(letter.user_id);
    const email = userData?.user?.email;
    if (userError || !email) {
      // No address to write to: the claim stays, so this letter is not retried forever
      summary.skipped += 1;
      continue;
    }
    const metadataName = userData.user.user_metadata?.display_name;

    // 3. Send. If it fails, release the claim so the next run tries again.
    const result = await sendSealedLetterUnlockedEmail({
      to: email,
      name: typeof metadataName === 'string' ? metadataName : null,
      letterTitle: letter.title,
    });

    if (result.success) {
      summary.sent += 1;
    } else {
      summary.failed += 1;
      await admin
        .from('sealed_letter_notifications')
        .delete()
        .eq('thought_id', letter.thought_id)
        .eq('seal_until', letter.seal_until);
    }
  }

  return NextResponse.json(summary);
}

// Vercel Cron calls GET; POST is there for running it by hand
export const GET = run;
export const POST = run;