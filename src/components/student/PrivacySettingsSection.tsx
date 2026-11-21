import { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { PrivacySettings, StudentProfile } from '../../types';

interface PrivacySettingsSectionProps {
  profile: StudentProfile;
  onUpdatePrivacy: (updated: PrivacySettings) => void;
  onUpdateAlias: (newAlias: string) => void;
}

export function PrivacySettingsSection({
  profile,
  onUpdatePrivacy,
  onUpdateAlias,
}: PrivacySettingsSectionProps) {
  const [aliasInput, setAliasInput] = useState(profile.alias);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const toggleSetting = (key: keyof PrivacySettings) => {
    onUpdatePrivacy({
      ...profile.privacy,
      [key]: !profile.privacy[key],
    });
  };

  const handleAliasSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = aliasInput.trim();
    if (!trimmed) return;
    onUpdateAlias(trimmed);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2200);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E2DC]">
          <div>
            <h1 className="text-xl font-semibold text-[#1E292B]">
              Privacy-First Onboarding & Consent Controls
            </h1>
            <p className="mt-1 text-sm text-[#546266]">
              Control how your identity and wellness records appear across self-help modules and campus counseling sessions. Changes take effect immediately across both portals.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#2E6B52] whitespace-nowrap shrink-0">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Student-Controlled Data Sharing
          </div>
        </div>

        {/* Profile & Alias Identity */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#1E292B]">
              Student Identity & Pseudonymized Alias
            </h2>
            <div className="rounded-lg border border-[#E4E2DC] bg-[#F8F7F4] p-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#546266]">Registered Student</span>
                <span className="font-medium text-[#1E292B]">{profile.realName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#546266]">Department</span>
                <span className="text-[#1E292B] text-right">{profile.department}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#546266]">Academic Standing</span>
                <span className="text-[#1E292B]">{profile.yearLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#546266]">Campus Roll ID</span>
                <span className="font-mono text-xs text-[#1E292B]">{profile.studentId}</span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#E4E2DC]">
                <span className="text-[#546266]">Active Pseudonymized Alias</span>
                <span className="font-mono text-xs font-semibold text-[#3D6B59]">
                  {profile.alias}
                </span>
              </div>
            </div>

            <form onSubmit={handleAliasSave} className="space-y-2">
              <label
                htmlFor="alias-input"
                className="block text-xs font-medium text-[#546266]"
              >
                Customize Pseudonymized Alias
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="alias-input"
                  type="text"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  maxLength={28}
                  className="flex-1 rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm font-mono text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
                  placeholder="e.g. User_Alpha_8"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
                >
                  Save Alias
                </button>
              </div>
              {savedFeedback && (
                <p className="text-xs font-medium text-[#2E6B52]">
                  Pseudonymized alias updated.
                </p>
              )}
            </form>
          </div>

          {/* Alias Mode Toggle Card */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#1E292B]">
              Alias Mode for Self-Help Modules
            </h2>
            <div className="rounded-lg border border-[#E4E2DC] bg-[#F8F7F4] p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {profile.privacy.aliasMode ? (
                      <EyeOff className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#4B6B8A]" aria-hidden="true" />
                    )}
                    <p className="text-sm font-semibold text-[#1E292B]">
                      Enable Alias Mode
                    </p>
                  </div>
                  <p className="text-xs text-[#546266] leading-relaxed">
                    Hides your legal name across the Student Portal header, mood tracker, self-assessments, and wellness modules behind <span className="font-mono font-medium text-[#1E292B]">{profile.alias}</span>. Campus analytics never display student names regardless of this setting.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={profile.privacy.aliasMode}
                  aria-label="Toggle Alias Mode"
                  onClick={() => toggleSetting('aliasMode')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    profile.privacy.aliasMode ? 'bg-[#3D6B59]' : 'bg-[#C8CFCB]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profile.privacy.aliasMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 border-t border-[#E4E2DC] text-xs text-[#546266]">
                Currently displaying as:{' '}
                <span className="font-semibold text-[#1E292B]">
                  {profile.privacy.aliasMode ? profile.alias : profile.realName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Counselor Consent Toggles */}
      <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="pb-4 border-b border-[#E4E2DC]">
          <h2 className="text-lg font-semibold text-[#1E292B]">
            Granular Counselor Consent Toggles
          </h2>
          <p className="mt-1 text-sm text-[#546266]">
            Choose what your assigned campus counselor can review in your Pre-Session Clinical Summary prior to booked appointments. Private reflective journal entries are never shared automatically.
          </p>
        </div>

        <div className="divide-y divide-[#EFECE6] mt-2">
          <div className="py-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#1E292B]">
                Share PHQ-9, GAD-7 & PSS-10 Scores Before Sessions
              </p>
              <p className="mt-1 text-xs text-[#546266] max-w-2xl">
                Allows your assigned counselor to see your most recent standardized clinical screening scores and deterministic severity tiers under your pseudonymized alias.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.privacy.shareAssessments}
              aria-label="Allow counselor to view assessment scores"
              onClick={() => toggleSetting('shareAssessments')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                profile.privacy.shareAssessments ? 'bg-[#3D6B59]' : 'bg-[#C8CFCB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.privacy.shareAssessments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#1E292B]">
                Share 14-Day Mood & Sleep Trends
              </p>
              <p className="mt-1 text-xs text-[#546266] max-w-2xl">
                Shares aggregated 14-day emotional valence and sleep duration averages so your counselor can prepare context without requiring you to repeat your entire week.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.privacy.shareMoodTrends}
              aria-label="Allow counselor to view 14-day mood trends"
              onClick={() => toggleSetting('shareMoodTrends')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                profile.privacy.shareMoodTrends ? 'bg-[#3D6B59]' : 'bg-[#C8CFCB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.privacy.shareMoodTrends ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#1E292B]">
                Share Top Reported Stress Triggers
              </p>
              <p className="mt-1 text-xs text-[#546266] max-w-2xl">
                Displays recurring influencing factor categories (such as Academics/Exams or Sleep) from your recent daily check-ins.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.privacy.shareTriggers}
              aria-label="Allow counselor to view stress triggers"
              onClick={() => toggleSetting('shareTriggers')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                profile.privacy.shareTriggers ? 'bg-[#3D6B59]' : 'bg-[#C8CFCB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.privacy.shareTriggers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[#1E292B]">
                Private Reflective Journal Entries
              </p>
              <p className="mt-1 text-xs text-[#546266] max-w-2xl">
                Always stored locally for personal reflection only. Never exposed to counselors or university administration.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#546266] whitespace-nowrap shrink-0">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Always Private
            </span>
          </div>
        </div>

        {/* Live Transparency Preview */}
        <div className="mt-5 rounded-lg bg-[#EFF3EF] p-4 flex items-start gap-3">
          <UserCheck className="h-4 w-4 text-[#3D6B59] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#2F4741] leading-relaxed">
            <span className="font-semibold">Live Counselor View Preview: </span>
            {profile.privacy.shareAssessments ||
            profile.privacy.shareMoodTrends ||
            profile.privacy.shareTriggers ? (
              <>
                In the Counselor Dashboard, your appointment under{' '}
                <span className="font-mono font-semibold">{profile.alias}</span> will display:{' '}
                {[
                  profile.privacy.shareAssessments && 'Clinical Screening Scores',
                  profile.privacy.shareMoodTrends && '14-Day Mood & Sleep Averages',
                  profile.privacy.shareTriggers && 'Top Stress Triggers',
                ]
                  .filter(Boolean)
                  .join(' · ')}
                . Switch to Counselor View in the top bar anytime to verify.
              </>
            ) : (
              <>
                All pre-session clinical sharing is disabled. Your counselor will see{' '}
                <span className="font-semibold">
                  &ldquo;Protected by Student Privacy Settings&rdquo;
                </span>{' '}
                until you choose to share in person.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
