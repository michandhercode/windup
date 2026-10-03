import type { Letter } from '@/types/letter';

// Shared by The Sky page and the Landing page so both always show the same total.

export const DEFAULT_PLANE_LIKES = 5;

type PlaneLikeInput = Partial<Letter> & { likes?: number; resonated?: number };

export const getPlaneLikes = (letter?: PlaneLikeInput | null): number => {
  if (!letter) return DEFAULT_PLANE_LIKES;
  return letter.likes ?? letter.resonated ?? DEFAULT_PLANE_LIKES;
};

/** A letter counts as a sent paper plane once it is public or released. */
export const isPublicPlane = (l: Letter) =>
  l.visibility === 'anonymous_public' || l.status === 'released';

export const ALL_MOCK_POOL = [
  { id: 'm1', title: 'The morning sun...', content: 'Waking up early to watch the sunrise changed my entire mood today. Simple things matter.', mood: 'hopeful', likes: 12, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm2', title: 'A quiet reminder...', content: 'It is okay to rest when you are tired. You do not have to earn your right to breathe.', mood: 'peaceful', likes: 25, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm3', title: 'Midnight thoughts...', content: 'Wondering if someone on the other side of the world is looking at the same moon right now.', mood: 'reflective', likes: 19, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm4', title: 'Warm coffee cup...', content: 'Holding a warm mug on a chilly afternoon is a tiny piece of heaven.', mood: 'nostalgic', likes: 31, createdAt: new Date(Date.now() - 86400000).toISOString(), isUserOwner: false },
  { id: 'm5', title: 'To anyone lost...', content: 'Even the longest nights eventually lead to a bright morning. Keep going.', mood: 'hopeful', likes: 44, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm6', title: 'Little victories...', content: 'Today I managed to cook a good meal and finish my book. Celebrate small wins.', mood: 'peaceful', likes: 15, createdAt: new Date(Date.now() - 86400000).toISOString(), isUserOwner: false },
  { id: 'm7', title: 'Stargazing notes...', content: 'The universe is vast, and your presence in it matters more than you realize.', mood: 'reflective', likes: 27, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm8', title: 'Rainy afternoon...', content: 'Listening to the heavy rain while wrapped in a thick blanket. Pure comfort.', mood: 'heavy', likes: 38, createdAt: new Date().toISOString(), isUserOwner: false },
];