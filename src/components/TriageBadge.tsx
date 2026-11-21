import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { TriageLevel } from '../types';

interface TriageIndicatorProps {
  level: TriageLevel;
  customLabel?: string;
}

export function TriageIndicator({ level, customLabel }: TriageIndicatorProps) {
  if (level === 'high') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318] whitespace-nowrap shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {customLabel ?? 'High / Urgent Risk'}
      </span>
    );
  }

  if (level === 'moderate') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A5B13] whitespace-nowrap shrink-0">
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {customLabel ?? 'Moderate Support'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6B52] whitespace-nowrap shrink-0">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {customLabel ?? 'Low / Manageable'}
    </span>
  );
}
