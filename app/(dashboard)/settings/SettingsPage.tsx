'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Database, Download, CheckCircle, AlertCircle, Info, Mail, FileText, X, Send, Bell } from 'lucide-react';
import { useLetters } from '@/app/providers';

export default function SettingsPage() {
  const { letters } = useLetters();
  const [displayName, setDisplayName] = useState('Anonymous');
  const [email, setEmail] = useState('scribe@windup.app');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Modal states for Terms, Privacy, or Support
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'support' | null>(null);

  // Support form state
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('windup_display_name');
    if (savedName) setDisplayName(savedName);

    const savedEmail = localStorage.getItem('windup_user_email');
    if (savedEmail) setEmail(savedEmail);

    const savedNotifications = localStorage.getItem('windup_email_notifications');
    if (savedNotifications !== null) {
      setEmailNotifications(savedNotifications === 'true');
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = displayName.trim();

    // Validate single display name without spaces
    if (trimmedName.includes(' ') || trimmedName === '') {
      setErrorMsg('Display name must be a single name only (no spaces).');
      return;
    }

    const trimmedEmail = email.trim();

    // Save profile settings to localStorage
    localStorage.setItem('windup_display_name', trimmedName);
    localStorage.setItem('windup_user_email', trimmedEmail);
    localStorage.setItem('windup_email_notifications', emailNotifications.toString());
    
    setDisplayName(trimmedName);
    setEmail(trimmedEmail);

    // Notify other components of profile updates
    window.dispatchEvent(new Event('windup_profile_updated'));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      profile: { displayName, email, emailNotifications },
      letters: letters,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `windup_sanctuary_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportSentSuccess(true);
    setTimeout(() => {
      setSupportSentSuccess(false);
      setSupportMessage('');
      setActiveModal(null);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6 relative">
      
      {/* Settings Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold tracking-wide uppercase">
            <Settings className="w-3.5 h-3.5" />
            Preferences
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Settings & Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your personal profile, email notifications, and data exports.
          </p>
        </div>
      </div>

      {/* 1. Profile Details Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Profile & Communication
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Display Name</span>
                <span className="text-[10px] text-slate-400 font-normal">Single name only</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value.replace(/\s+/g, ''));
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Michelle"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
              />
              {errorMsg && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errorMsg}
                </p>
              )}
            </div>

            {/* Email Input with Purpose Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scribe@windup.app"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
                Used for support responses, account security, and paper plane notifications.
              </p>
            </div>
          </div>

          {/* Email Notification Toggle */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-sky-500" />
                Email Notifications
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive email alerts for support replies, paper plane updates, and community news.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailNotifications ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Save Button & Status */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {savedSuccess && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" /> Changes saved!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Sanctuary Data Export Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Sanctuary Data
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Export All Letters & Notes
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download a JSON backup copy of all your private notes and sent paper planes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {exportSuccess && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" /> Downloaded successfully!
              </span>
            )}
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* 3. About & Support Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Info className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            About & Support
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* About App Info */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Windup Sanctuary <span className="text-[10px] font-normal text-slate-400">v1.0.0</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              A private digital sanctuary designed for your thoughts, reflections, and letting go through paper planes.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold">
              <button 
                type="button" 
                onClick={() => setActiveModal('terms')}
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" /> Terms
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => setActiveModal('privacy')}
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" /> Privacy Policy
              </button>
            </div>
          </div>

          {/* Contact Support Button */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3 relative z-10">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Need Help or Feedback?
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Have questions or encountered an issue? Our support team is ready to assist you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('support')}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              Contact Support
            </button>
          </div>

        </div>
      </div>

      {/* Universal Modal Popup (Terms, Privacy, & In-App Support) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'support' && 'Contact Support'}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            {activeModal === 'support' ? (
              <form onSubmit={handleSendSupportMessage} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Send a direct message to the Windup team. We will review your inquiry and get back to your registered email address soon.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Your Message / Issue
                  </label>
                  <textarea
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Type your message, suggestion, or feedback here..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  {supportSentSuccess && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle className="w-3.5 h-3.5" /> Message sent successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed max-h-72 overflow-y-auto pr-2">
                  {activeModal === 'terms' ? (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Last updated: October 2026</p>
                      <p>Welcome to Windup. By accessing or utilizing our digital platform, you agree to comply with and be bound by the following professional terms and conditions of use.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">1. Acceptance of Terms:</strong> By engaging with Windup, you acknowledge that you have read, understood, and agreed to maintain a respectful and lawful environment.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">2. User-Generated Content:</strong> All personal letters, notes, and reflections created within the application remain your sole responsibility. Ensure that your entries adhere to applicable ethical standards.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">3. Intellectual Property:</strong> All interface layout designs, branding assets, and application features are protected under proprietary rights belonging exclusively to Windup.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">4. Limitation of Liability:</strong> The service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind, whether express or implied.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Last updated: October 2026</p>
                      <p>At Windup, safeguarding your privacy and confidentiality is our highest institutional priority. This Privacy Policy details how your information is handled.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">1. Data Sovereignty and Storage:</strong> Your private notes, letters, and configuration states are primarily stored securely within your local device environment (browser storage). We do not harvest or permanently archive your personal journals on external servers.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">2. Data Exports:</strong> Any backup files generated via the data export feature are entirely under your custody and control.</p>
                      <p><strong className="text-slate-800 dark:text-slate-200">3. Communications:</strong> When contacting our support desk via email, your correspondence details are utilized strictly for resolving technical inquiries and are never shared with third-party vendors.</p>
                    </>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Acknowledge & Close
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}