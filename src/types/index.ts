export type RoleMode = 'student' | 'counselor';

export type StudentTab =
  | 'overview'
  | 'assessments'
  | 'mood'
  | 'wellness'
  | 'booking'
  | 'privacy';

export type CounselorTab = 'queue' | 'analytics';

export type AssessmentType = 'PHQ-9' | 'GAD-7' | 'PSS-10';

export type TriageLevel = 'low' | 'moderate' | 'high';

export type InfluencingFactor =
  | 'Academics/Exams'
  | 'Sleep'
  | 'Social Life'
  | 'Exercise'
  | 'Nutrition'
  | 'Finance'
  | 'Relationships';

export interface PrivacySettings {
  aliasMode: boolean;
  shareAssessments: boolean;
  shareMoodTrends: boolean;
  shareTriggers: boolean;
}

export interface StudentProfile {
  realName: string;
  alias: string;
  department: string;
  yearLabel: string;
  studentId: string;
  email: string;
  privacy: PrivacySettings;
}

export interface AssessmentRecord {
  id: string;
  type: AssessmentType;
  date: string; // YYYY-MM-DD
  timestamp: string;
  score: number;
  maxScore: number;
  severityLabel: string;
  triageLevel: TriageLevel;
  itemResponses: number[];
  flaggedSelfHarmItem?: boolean;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  moodScore: number; // 1–10
  sleepQuality: number; // 1–5
  sleepHours: number; // e.g., 6.5
  factors: InfluencingFactor[];
  journal: string;
}

export type ResourceFormat =
  | 'Articles'
  | 'Guided Exercises'
  | 'Audio'
  | 'Productivity Tools';

export type ResourceStressor =
  | 'Exam Anxiety'
  | 'Burnout'
  | 'Sleep Hygiene'
  | 'Grounding';

export interface WellnessResource {
  id: string;
  title: string;
  format: ResourceFormat;
  stressor: ResourceStressor;
  duration: string;
  summary: string;
  author: string;
  interactiveTool?: 'breathing-478' | 'grounding-54321';
  sections?: { heading: string; body: string }[];
  actionSteps?: string[];
}

export interface Counselor {
  id: string;
  name: string;
  credentials: string;
  role: string;
  specializations: string[];
  languages: string[];
  location: string;
  bio: string;
  avatar: string;
  nextAvailableLabel: string;
  dailySlots: string[];
}

export type AppointmentMode = 'In-Person Campus Center' | 'Virtual Tele-Counseling';

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface PeerPreSessionSnapshot {
  consentedAssessments: boolean;
  consentedMoodTrends: boolean;
  consentedTriggers: boolean;
  latestPhq9?: { score: number; severity: string; date: string };
  latestGad7?: { score: number; severity: string; date: string };
  latestPss10?: { score: number; severity: string; date: string };
  avgMood14d?: number;
  avgSleep14d?: number;
  topTriggers?: InfluencingFactor[];
}

export interface Appointment {
  id: string;
  referenceId: string; // e.g., CONF-APT-702
  studentAlias: string;
  isCurrentStudent: boolean;
  counselorId: string;
  counselorName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "11:00 AM"
  mode: AppointmentMode;
  status: AppointmentStatus;
  triagePriority: TriageLevel;
  concernNote: string;
  createdAt: string;
  peerSnapshot?: PeerPreSessionSnapshot;
}

export interface CounselorSessionNote {
  id: string;
  referenceId: string;
  studentAlias: string;
  counselorName: string;
  date: string;
  presentingTheme: string;
  observations: string;
  followUpPlan: string;
  riskStatus: 'Routine' | 'Monitor Closely' | 'Escalated';
}

export interface AppState {
  profile: StudentProfile;
  assessments: AssessmentRecord[];
  moodLogs: MoodLog[];
  appointments: Appointment[];
  sessionNotes: CounselorSessionNote[];
}
