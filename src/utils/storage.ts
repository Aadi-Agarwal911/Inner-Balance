import { AppState, MoodLog } from '../types';
import { createSeedState } from '../data/seedData';

const STORAGE_KEY = 'inner_balance_campus_state_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.profile || !Array.isArray(parsed.moodLogs)) {
      const seed = createSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota exceptions gracefully
  }
}

export function resetAppState(): AppState {
  const seed = createSeedState();
  saveAppState(seed);
  return seed;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function computeMoodStreak(logs: MoodLog[]): number {
  if (logs.length === 0) return 0;
  const uniqueDates = new Set(logs.map((l) => l.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Allow streak to start from today or yesterday so users don't lose streak before evening check-in
  const cursor = new Date(today);
  if (!uniqueDates.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!uniqueDates.has(toKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (uniqueDates.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function generateReferenceId(existingRefs: string[]): string {
  const used = new Set(existingRefs);
  let attempt = 705 + existingRefs.length * 7;
  while (used.has(`CONF-APT-${attempt}`)) {
    attempt += 1;
  }
  return `CONF-APT-${attempt}`;
}
