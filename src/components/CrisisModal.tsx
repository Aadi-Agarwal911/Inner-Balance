import { useEffect, useState } from 'react';
import { PhoneCall, X, Copy, Check, ShieldAlert, MapPin } from 'lucide-react';
import { CRISIS_HELPLINES } from '../data/seedData';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookPriority?: () => void;
}

export function CrisisModal({ isOpen, onClose, onBookPriority }: CrisisModalProps) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num).catch(() => {});
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E292B]/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-[#E4E2DC] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#E4E2DC] bg-[#FEF6F5]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B42318] text-white">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="crisis-modal-title"
                className="text-lg font-semibold text-[#1E292B]"
              >
                Immediate Support & 24/7 Crisis Helplines
              </h2>
              <p className="mt-1 text-sm text-[#546266]">
                If you or someone near you is experiencing an immediate crisis or thoughts of self-harm, please connect with a trained human responder now.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close crisis helplines dialog"
            className="rounded-lg p-2 text-[#546266] hover:bg-[#F3E3E1] hover:text-[#1E292B] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campus Emergency Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#1E292B] mb-3">
              Campus Counseling Emergency Contacts
            </h3>
            <div className="divide-y divide-[#E4E2DC] rounded-lg border border-[#E4E2DC] bg-[#F8F7F4]">
              {CRISIS_HELPLINES.campus.map((item) => (
                <div
                  key={item.name}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E292B]">{item.name}</p>
                    <p className="text-xs text-[#546266] mt-0.5">{item.availability}</p>
                    <p className="text-xs text-[#546266] mt-1">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-semibold text-[#B42318] tabular-nums">
                      {item.number}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.number)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E2DC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1E292B] hover:bg-[#EFF3EF] transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedNumber === item.number ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#2E6B52]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-[#546266]" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 National Helplines */}
          <div>
            <h3 className="text-sm font-semibold text-[#1E292B] mb-3">
              24/7 National Mental Health Helplines
            </h3>
            <div className="divide-y divide-[#E4E2DC] rounded-lg border border-[#E4E2DC] bg-white">
              {CRISIS_HELPLINES.national.map((line) => (
                <div
                  key={line.name}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold text-[#1E292B]">{line.name}</p>
                      <span className="text-xs text-[#546266]">· {line.availability}</span>
                    </div>
                    <p className="text-xs text-[#546266] mt-1">{line.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${line.number.replace(/[^+\d]/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6B59] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0 tabular-nums"
                    >
                      <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                      {line.number}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(line.number)}
                      aria-label={`Copy ${line.name} number`}
                      className="rounded-lg border border-[#E4E2DC] bg-[#F8F7F4] p-2 text-[#546266] hover:text-[#1E292B] hover:bg-[#EFF3EF] transition-colors shrink-0"
                    >
                      {copiedNumber === line.number ? (
                        <Check className="h-4 w-4 text-[#2E6B52]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg bg-[#EFF3EF] px-4 py-3.5">
            <div className="flex items-start gap-2.5 text-xs text-[#2F4741]">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#3D6B59]" aria-hidden="true" />
              <span>
                You may also request an expedited human counselor appointment directly through the Campus Wellness Desk.
              </span>
            </div>
            {onBookPriority && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookPriority();
                }}
                className="rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
              >
                Book Priority Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
