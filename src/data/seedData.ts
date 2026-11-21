import {
  AppState,
  Counselor,
  InfluencingFactor,
  WellnessResource,
} from '../types';

export const INFLUENCING_FACTORS: InfluencingFactor[] = [
  'Academics/Exams',
  'Sleep',
  'Social Life',
  'Exercise',
  'Nutrition',
  'Finance',
  'Relationships',
];

export const CRISIS_HELPLINES = {
  campus: [
    {
      name: 'Campus 24/7 Psychological Crisis Line',
      number: '+91 22 2576 9111',
      availability: '24/7 Immediate Response',
      detail: 'Direct line to on-call university clinical psychologist and emergency dispatch.',
    },
    {
      name: 'Student Wellness Center — Walk-In Desk',
      number: 'Ext. 4410 · Academic Block C, Room 204',
      availability: 'Mon–Sat · 8:30 AM – 8:00 PM',
      detail: 'Same-day confidential urgent triage slots reserved daily for students in acute distress.',
    },
  ],
  national: [
    {
      name: 'Tele-MANAS (Govt. of India National Helpline)',
      number: '14416 / 1-800-891-4416',
      availability: '24/7 · Free · 20+ Languages',
      detail: 'Ministry of Health & Family Welfare toll-free mental health counseling and crisis support.',
    },
    {
      name: 'Vandrevala Foundation Mental Health Helpline',
      number: '+91 9999 666 555',
      availability: '24/7 · Call & WhatsApp',
      detail: 'Free, confidential psychological crisis intervention by trained counselors.',
    },
    {
      name: 'iCall — TISS Psychosocial Helpline',
      number: '9152987821',
      availability: 'Mon–Sat · 10:00 AM – 8:00 PM',
      detail: 'Confidential telephone and email counseling run by Tata Institute of Social Sciences.',
    },
    {
      name: 'National Emergency Response',
      number: '112',
      availability: '24/7 Medical & Crisis Emergency',
      detail: 'Call immediately if you or someone near you is in immediate physical danger.',
    },
  ],
};

export const COUNSELORS: Counselor[] = [
  {
    id: 'c-ananya',
    name: 'Dr. Ananya Deshmukh',
    credentials: 'PhD, Clinical Psychology (RCI Licensed)',
    role: 'Senior Campus Clinical Psychologist',
    specializations: ['Academic Stress', 'Anxiety & Panic', 'Perfectionism'],
    languages: ['English', 'Hindi', 'Marathi'],
    location: 'Wellness Center, Room 206',
    bio: 'Over 11 years working with undergraduate and postgraduate engineering and science students navigating exam pressure, imposter feelings, and anxiety.',
    avatar: '/src/assets/images/counselor_ananya_1795157548769.jpg',
    nextAvailableLabel: 'Tomorrow · 10:00 AM',
    dailySlots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
  },
  {
    id: 'c-rohan',
    name: 'Dr. Rohan Kulkarni',
    credentials: 'M.Phil, Counseling Psychology',
    role: 'Student Burnout & Sleep Specialist',
    specializations: ['Burnout', 'Sleep Hygiene', 'Depression & Low Mood'],
    languages: ['English', 'Hindi', 'Kannada'],
    location: 'Wellness Center, Room 209',
    bio: 'Focuses on sustainable workload pacing, cognitive behavioral approaches for chronic exhaustion, disrupted sleep cycles, and low motivation.',
    avatar: '/src/assets/images/counselor_rohan_1795157549457.jpg',
    nextAvailableLabel: 'Tomorrow · 11:30 AM',
    dailySlots: ['10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM'],
  },
  {
    id: 'c-meera',
    name: 'Ms. Meera Nair',
    credentials: 'M.Sc., Clinical & Trauma Counseling',
    role: 'Trauma-Informed Campus Counselor',
    specializations: ['Anxiety & PTSD', 'Hostel Adjustment', 'Emotional Regulation'],
    languages: ['English', 'Malayalam', 'Tamil', 'Hindi'],
    location: 'Wellness Center, Room 211',
    bio: 'Provides compassionate, somatic-informed support for students coping with past trauma, sudden life transitions, homesickness, and heightened stress responses.',
    avatar: '/src/assets/images/counselor_meera_1795157554746.jpg',
    nextAvailableLabel: 'Tomorrow · 09:30 AM',
    dailySlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
  },
  {
    id: 'c-david',
    name: 'Dr. David Thomas',
    credentials: 'PsyD, Counseling Psychology',
    role: 'Student Wellness & Transitions Counselor',
    specializations: ['Relationships', 'Career Uncertainty', 'Burnout'],
    languages: ['English', 'Hindi'],
    location: 'Wellness Center, Room 214',
    bio: 'Works collaboratively with final-year students and research scholars on interpersonal conflict, family expectations, placement stress, and identity transitions.',
    avatar: '/src/assets/images/counselor_david_1795157549300.jpg',
    nextAvailableLabel: 'Tomorrow · 01:00 PM',
    dailySlots: ['10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
  },
];

export const WELLNESS_RESOURCES: WellnessResource[] = [
  {
    id: 'res-breathing-478',
    title: '4-7-8 Guided Paced Breathing',
    format: 'Guided Exercises',
    stressor: 'Exam Anxiety',
    duration: '3 min interactive',
    summary:
      'A parasympathetic breathing cadence (inhale 4s, hold 7s, exhale 8s) that reduces acute heart-rate spikes before exams or presentations.',
    author: 'Campus Wellness Clinical Team',
    interactiveTool: 'breathing-478',
  },
  {
    id: 'res-grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding Walkthrough',
    format: 'Guided Exercises',
    stressor: 'Grounding',
    duration: '4 min interactive',
    summary:
      'Step-by-step sensory anchoring method to interrupt spiraling thoughts, restlessness, or panic sensations and return focus to the present room.',
    author: 'Ms. Meera Nair, Campus Counseling',
    interactiveTool: 'grounding-54321',
  },
  {
    id: 'res-exam-cognitive-reset',
    title: 'Breaking the Pre-Exam Catastrophizing Loop',
    format: 'Articles',
    stressor: 'Exam Anxiety',
    duration: '5 min read',
    summary:
      'Practical cognitive reframing techniques tailored for university midterms, viva examinations, and timed coding or lab assessments.',
    author: 'Dr. Ananya Deshmukh',
    sections: [
      {
        heading: 'Why exam pressure triggers all-or-nothing thinking',
        body: 'Under sleep deprivation and grading pressure, the brain narrows its threat window and equates one difficult paper with permanent failure. Recognizing this cognitive distortion as a stress signal—not a factual forecast—creates space to act calmly.',
      },
      {
        heading: 'The 3-column evidence check',
        body: 'Write the anxious thought verbatim ("I will blank out and fail this course"). Next to it, list two factual counter-examples from previous semesters where you prepared imperfectly yet passed or recovered. Finish with one concrete 25-minute review action.',
      },
      {
        heading: 'Before entering the exam hall',
        body: 'Stop rapid last-minute cramming 15 minutes before the paper begins. Cramming elevates cortisol and impairs working-memory retrieval. Complete two slow cycles of 4-7-8 breathing instead.',
      },
    ],
    actionSteps: [
      'Identify one specific syllabus chapter causing the loudest worry.',
      'Review active recall notes for 25 minutes, then take a 5-minute away-from-screen break.',
      'Close notebooks 15 minutes prior to entering the examination hall.',
    ],
  },
  {
    id: 'res-sleep-circadian',
    title: 'Resetting a Drifted Hostel Sleep Schedule',
    format: 'Articles',
    stressor: 'Sleep Hygiene',
    duration: '6 min read',
    summary:
      'Evidence-based circadian anchors for students pulling late-night lab sessions and struggling to fall asleep before 2:00 AM.',
    author: 'Dr. Rohan Kulkarni',
    sections: [
      {
        heading: 'Anchor wake time before bedtime',
        body: 'Forcing yourself into bed at 10:30 PM when your biological clock expects 2:00 AM leads to frustrating wakefulness. Instead, lock a consistent wake time within a 30-minute window and get 10 minutes of natural morning daylight.',
      },
      {
        heading: 'The 45-minute digital sunset',
        body: 'High-arousal tasks—debugging code, checking assignment portals, or scrolling peer comparison feeds—delay melatonin onset even with blue-light filters. Shift the final 45 minutes to low-stimulation habits: warm shower, tidy desk, or quiet audio.',
      },
      {
        heading: 'Caffeine cutoff discipline',
        body: 'Caffeine has an average half-life of 5–7 hours. An evening chai or iced coffee at 6:00 PM still leaves half its stimulant load active past midnight, fragmenting deep slow-wave sleep.',
      },
    ],
    actionSteps: [
      'Set a consistent wake alarm for the next 7 days.',
      'Avoid caffeine after 2:30 PM on weekdays.',
      'Keep study devices off the mattress so your bed signals rest.',
    ],
  },
  {
    id: 'res-burnout-audit',
    title: 'Semester Burnout & Energy Budget Planner',
    format: 'Productivity Tools',
    stressor: 'Burnout',
    duration: '7 min worksheet',
    summary:
      'Distinguish normal academic fatigue from early burnout, and rebalance weekly credit hours, lab work, and mandatory recovery blocks.',
    author: 'Dr. David Thomas',
    sections: [
      {
        heading: 'Three early warning signs of student burnout',
        body: 'Unlike short-term tiredness that improves after a weekend nap, burnout presents as persistent emotional exhaustion, detachment from subjects you used to enjoy, and declining efficiency despite spending more hours at your desk.',
      },
      {
        heading: 'The 3-tier weekly task triage',
        body: 'Sort weekly academic obligations into Must-Submit (graded deadlines within 72 hours), Maintain (ongoing reading/lab prep), and Defer/Drop (optional clubs or perfectionist edits). Protect at least two 3-hour zero-guilt recovery windows per week.',
      },
    ],
    actionSteps: [
      'List all active commitments and identify one low-impact obligation to pause this week.',
      'Schedule one screen-free meal or walk with a peer without discussing grades.',
      'If exhaustion lasts beyond 2 weeks, book a preventive campus counselor check-in.',
    ],
  },
  {
    id: 'res-audio-bodyscan',
    title: 'Evening Progressive Muscle Release Script',
    format: 'Audio',
    stressor: 'Sleep Hygiene',
    duration: '8 min guided',
    summary:
      'A calm, structured head-to-toe muscle release sequence designed for releasing jaw clenching, shoulder tension, and racing thoughts at night.',
    author: 'Campus Wellness Clinical Team',
    sections: [
      {
        heading: 'Phase 1 · Feet & Calves (2 min)',
        body: 'Lying comfortably in bed, gently curl your toes downward for 5 seconds while inhaling slowly. Exhale completely and feel the weight of your heels settle into the mattress.',
      },
      {
        heading: 'Phase 2 · Shoulders & Neck (3 min)',
        body: 'Lift your shoulders softly toward your ears for 4 seconds—just enough to notice muscular effort—then drop them down on a long 6-second exhale. Unclench your jaw and let your tongue rest away from the roof of your mouth.',
      },
      {
        heading: 'Phase 3 · Forehead & Slow Exhale (3 min)',
        body: 'Smooth the muscles around your eyebrows. Count ten natural exhales backward from ten to one; if thoughts wander to tomorrow’s timetable, quietly return to the current number.',
      },
    ],
    actionSteps: [
      'Dim room lights and silence academic notifications before starting.',
      'Keep tension gentle—never strain muscles.',
    ],
  },
  {
    id: 'res-pomodoro-calm',
    title: 'Low-Friction Study Sprints for Overwhelmed Days',
    format: 'Productivity Tools',
    stressor: 'Exam Anxiety',
    duration: '4 min guide',
    summary:
      'Replace marathon 4-hour guilt sessions with gentle 20-minute entry sprints that overcome avoidance and perfectionism.',
    author: 'Dr. Ananya Deshmukh',
    sections: [
      {
        heading: 'Shrink the starting threshold',
        body: 'Procrastination is rarely laziness; it is usually emotional avoidance of a task that feels ambiguously large. Commit only to opening one problem set and working for 20 minutes—with full permission to pause afterward.',
      },
      {
        heading: 'Close the loop cleanly',
        body: 'At the end of every sprint, jot a 1-line "next micro-step" note (e.g., "Solve Q4 part b next") so restarting tomorrow takes zero mental friction.',
      },
    ],
    actionSteps: [
      'Pick one micro-deliverable achievable in 20 minutes.',
      'Place phone out of arm’s reach during the sprint.',
      'Stand up, hydrate, and look at a distant window for 3 minutes between blocks.',
    ],
  },
  {
    id: 'res-audio-grounding-walk',
    title: '10-Minute Campus Decompression Walk Guide',
    format: 'Audio',
    stressor: 'Grounding',
    duration: '10 min guided',
    summary:
      'A structured walking mindfulness cue set for transitioning mentally between intense lectures, labs, and hostel rest.',
    author: 'Ms. Meera Nair',
    sections: [
      {
        heading: 'Minutes 1–3 · Pace & Posture',
        body: 'Walk at 80% of your usual rushed campus speed. Notice the rhythmic contact of each footfall and allow your gaze to lift from your phone to the trees and horizon.',
      },
      {
        heading: 'Minutes 4–7 · Environmental Anchoring',
        body: 'Notice three ambient sounds around campus—wind, distant footsteps, birds—without labeling them as pleasant or distracting.',
      },
      {
        heading: 'Minutes 8–10 · Mental Transition',
        body: 'As you approach your room or library, name one single priority for the next hour and intentionally set the remaining list aside.',
      },
    ],
    actionSteps: [
      'Leave headphones on low or off so you can hear natural surroundings.',
      'Take one full minute of stillness before opening your laptop.',
    ],
  },
];

function getRelativeDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUpcomingDates(count = 6): { dateStr: string; label: string; weekday: string }[] {
  const days: { dateStr: string; label: string; weekday: string }[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = getRelativeDateStr(i);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ dateStr, label, weekday });
  }
  return days;
}

export function createSeedState(): AppState {
  // 14 days of realistic higher-education engineering student mood logs (ending yesterday or today)
  const moodBlueprint: {
    offset: number;
    mood: number;
    sleepQ: number;
    sleepH: number;
    factors: InfluencingFactor[];
    journal: string;
  }[] = [
    {
      offset: -13,
      mood: 7,
      sleepQ: 4,
      sleepH: 7.5,
      factors: ['Exercise', 'Social Life'],
      journal: 'Good weekend reset. Played badminton with hostel mates and caught up on sleep.',
    },
    {
      offset: -12,
      mood: 6,
      sleepQ: 3,
      sleepH: 6.5,
      factors: ['Academics/Exams', 'Sleep'],
      journal: 'Mid-semester operating systems lab assignment released; felt a mild spike in pressure.',
    },
    {
      offset: -11,
      mood: 5,
      sleepQ: 3,
      sleepH: 6.0,
      factors: ['Academics/Exams', 'Sleep'],
      journal: 'Long debugging afternoon. Skipped evening walk and stayed up revising notes.',
    },
    {
      offset: -10,
      mood: 4,
      sleepQ: 2,
      sleepH: 5.0,
      factors: ['Academics/Exams', 'Sleep', 'Nutrition'],
      journal: 'Slept late before quiz; skipped breakfast and felt foggy through afternoon lectures.',
    },
    {
      offset: -9,
      mood: 5,
      sleepQ: 3,
      sleepH: 6.5,
      factors: ['Academics/Exams', 'Social Life'],
      journal: 'Quiz went better than expected. Talked with study group over dinner which helped.',
    },
    {
      offset: -8,
      mood: 6,
      sleepQ: 4,
      sleepH: 7.5,
      factors: ['Sleep', 'Exercise'],
      journal: 'Caught up on rest and went for a 20-minute run around the campus track.',
    },
    {
      offset: -7,
      mood: 7,
      sleepQ: 4,
      sleepH: 8.0,
      factors: ['Social Life', 'Nutrition', 'Sleep'],
      journal: 'Called family in the evening. Felt grounded and less behind on coursework.',
    },
    {
      offset: -6,
      mood: 5,
      sleepQ: 3,
      sleepH: 6.0,
      factors: ['Academics/Exams', 'Finance'],
      journal: 'Semester project review announced along with hostel mess fee deadline. Felt stretched.',
    },
    {
      offset: -5,
      mood: 4,
      sleepQ: 2,
      sleepH: 5.5,
      factors: ['Academics/Exams', 'Sleep'],
      journal: 'Struggled to fall asleep thinking about database project presentation.',
    },
    {
      offset: -4,
      mood: 5,
      sleepQ: 3,
      sleepH: 6.5,
      factors: ['Academics/Exams', 'Relationships'],
      journal: 'Minor misunderstanding with project teammate, resolved after a calm conversation.',
    },
    {
      offset: -3,
      mood: 6,
      sleepQ: 3,
      sleepH: 7.0,
      factors: ['Exercise', 'Academics/Exams'],
      journal: 'Tried 4-7-8 breathing before lab viva. Heart rate settled much faster.',
    },
    {
      offset: -2,
      mood: 6,
      sleepQ: 4,
      sleepH: 7.5,
      factors: ['Sleep', 'Nutrition'],
      journal: 'Put laptop away at 11:15 PM. Woke up noticeably clearer for 8:30 AM class.',
    },
    {
      offset: -1,
      mood: 7,
      sleepQ: 4,
      sleepH: 7.5,
      factors: ['Social Life', 'Exercise'],
      journal: 'Completed major milestone on team project and took an evening walk without checking email.',
    },
  ];

  const upcomingDates = getUpcomingDates(5);

  return {
    profile: {
      realName: 'Aarav Mehta',
      alias: 'User_Alpha_8',
      department: 'B.Tech Computer Science & Engineering',
      yearLabel: '3rd Year · Semester 6',
      studentId: 'CS23B041',
      email: 'aarav.mehta@campus.edu',
      privacy: {
        aliasMode: true,
        shareAssessments: true,
        shareMoodTrends: true,
        shareTriggers: true,
      },
    },
    assessments: [
      {
        id: 'asm-seed-1',
        type: 'PHQ-9',
        date: getRelativeDateStr(-12),
        timestamp: `${getRelativeDateStr(-12)}T18:20:00`,
        score: 11,
        maxScore: 27,
        severityLabel: 'Moderate',
        triageLevel: 'moderate',
        itemResponses: [1, 1, 2, 2, 1, 1, 2, 1, 0],
        flaggedSelfHarmItem: false,
      },
      {
        id: 'asm-seed-2',
        type: 'GAD-7',
        date: getRelativeDateStr(-6),
        timestamp: `${getRelativeDateStr(-6)}T20:10:00`,
        score: 10,
        maxScore: 21,
        severityLabel: 'Moderate',
        triageLevel: 'moderate',
        itemResponses: [2, 2, 2, 1, 1, 1, 1],
        flaggedSelfHarmItem: false,
      },
      {
        id: 'asm-seed-3',
        type: 'PSS-10',
        date: getRelativeDateStr(-2),
        timestamp: `${getRelativeDateStr(-2)}T16:45:00`,
        score: 18,
        maxScore: 40,
        severityLabel: 'Moderate Perceived Stress',
        triageLevel: 'moderate',
        itemResponses: [2, 2, 3, 2, 2, 2, 2, 2, 2, 1],
        flaggedSelfHarmItem: false,
      },
    ],
    moodLogs: moodBlueprint.map((entry, idx) => ({
      id: `mood-seed-${idx + 1}`,
      date: getRelativeDateStr(entry.offset),
      moodScore: entry.mood,
      sleepQuality: entry.sleepQ,
      sleepHours: entry.sleepH,
      factors: entry.factors,
      journal: entry.journal,
    })),
    appointments: [
      {
        id: 'apt-seed-student-1',
        referenceId: 'CONF-APT-702',
        studentAlias: 'User_Alpha_8',
        isCurrentStudent: true,
        counselorId: 'c-ananya',
        counselorName: 'Dr. Ananya Deshmukh',
        date: upcomingDates[1].dateStr,
        time: '11:00 AM',
        mode: 'In-Person Campus Center',
        status: 'Upcoming',
        triagePriority: 'moderate',
        concernNote:
          'Managing mid-semester exam pressure and disrupted sleep before lab vivas.',
        createdAt: getRelativeDateStr(-2),
      },
      {
        id: 'apt-seed-peer-1',
        referenceId: 'CONF-APT-689',
        studentAlias: 'User_Delta_19',
        isCurrentStudent: false,
        counselorId: 'c-ananya',
        counselorName: 'Dr. Ananya Deshmukh',
        date: upcomingDates[0].dateStr,
        time: '09:30 AM',
        mode: 'In-Person Campus Center',
        status: 'Upcoming',
        triagePriority: 'high',
        concernNote:
          'Priority triage slot requested after elevated PHQ-9 & GAD-7 scores during midterm week.',
        createdAt: getRelativeDateStr(-1),
        peerSnapshot: {
          consentedAssessments: true,
          consentedMoodTrends: true,
          consentedTriggers: true,
          latestPhq9: { score: 17, severity: 'Moderately Severe', date: getRelativeDateStr(-1) },
          latestGad7: { score: 15, severity: 'Severe', date: getRelativeDateStr(-1) },
          avgMood14d: 3.6,
          avgSleep14d: 5.1,
          topTriggers: ['Academics/Exams', 'Sleep', 'Finance'],
        },
      },
      {
        id: 'apt-seed-peer-2',
        referenceId: 'CONF-APT-695',
        studentAlias: 'User_Kite_44',
        isCurrentStudent: false,
        counselorId: 'c-rohan',
        counselorName: 'Dr. Rohan Kulkarni',
        date: upcomingDates[0].dateStr,
        time: '01:30 PM',
        mode: 'Virtual Tele-Counseling',
        status: 'Upcoming',
        triagePriority: 'moderate',
        concernNote: 'Recurring exhaustion and difficulty concentrating on thesis draft.',
        createdAt: getRelativeDateStr(-2),
        peerSnapshot: {
          consentedAssessments: false,
          consentedMoodTrends: false,
          consentedTriggers: false,
        },
      },
      {
        id: 'apt-seed-peer-3',
        referenceId: 'CONF-APT-671',
        studentAlias: 'User_Orion_12',
        isCurrentStudent: false,
        counselorId: 'c-meera',
        counselorName: 'Ms. Meera Nair',
        date: getRelativeDateStr(-3),
        time: '02:30 PM',
        mode: 'Virtual Tele-Counseling',
        status: 'Completed',
        triagePriority: 'low',
        concernNote: 'Follow-up check-in on hostel transition and grounding habits.',
        createdAt: getRelativeDateStr(-7),
        peerSnapshot: {
          consentedAssessments: true,
          consentedMoodTrends: true,
          consentedTriggers: true,
          latestGad7: { score: 6, severity: 'Mild', date: getRelativeDateStr(-4) },
          latestPss10: { score: 13, severity: 'Low Perceived Stress', date: getRelativeDateStr(-4) },
          avgMood14d: 7.2,
          avgSleep14d: 7.4,
          topTriggers: ['Social Life', 'Sleep'],
        },
      },
    ],
    sessionNotes: [
      {
        id: 'note-seed-1',
        referenceId: 'CONF-APT-671',
        studentAlias: 'User_Orion_12',
        counselorName: 'Ms. Meera Nair',
        date: getRelativeDateStr(-3),
        presentingTheme: 'First-year hostel transition and social adjustment',
        observations:
          'Student reports steadier evening routine and improved comfort in study groups. Grounding exercise practiced twice before quiz week with positive somatic calming.',
        followUpPlan:
          'Optional booster check-in in 4 weeks; continue mood tracking and evening screen wind-down.',
        riskStatus: 'Routine',
      },
    ],
  };
}

// Aggregated, anonymized campus-wide wellness data (no individual identifiers)
export const CAMPUS_WEEKLY_ANALYTICS = [
  { week: 'Wk 1', label: 'Orientation', low: 72, moderate: 22, high: 6, avgPhq9: 5.4, avgGad7: 5.1 },
  { week: 'Wk 2', label: 'Add/Drop', low: 68, moderate: 25, high: 7, avgPhq9: 5.8, avgGad7: 5.6 },
  { week: 'Wk 3', label: 'Quiz Cycle 1', low: 61, moderate: 29, high: 10, avgPhq9: 6.7, avgGad7: 6.9 },
  { week: 'Wk 4', label: 'Lab Demos', low: 58, moderate: 31, high: 11, avgPhq9: 7.1, avgGad7: 7.4 },
  { week: 'Wk 5', label: 'Pre-Midterm', low: 47, moderate: 37, high: 16, avgPhq9: 8.8, avgGad7: 9.5 },
  { week: 'Wk 6', label: 'Midterms', low: 39, moderate: 40, high: 21, avgPhq9: 10.2, avgGad7: 11.4 },
  { week: 'Wk 7', label: 'Midterm Break', low: 63, moderate: 28, high: 9, avgPhq9: 6.9, avgGad7: 6.4 },
  { week: 'Wk 8', label: 'Projects Start', low: 59, moderate: 30, high: 11, avgPhq9: 7.3, avgGad7: 7.5 },
  { week: 'Wk 9', label: 'Placement Prep', low: 51, moderate: 34, high: 15, avgPhq9: 8.5, avgGad7: 9.1 },
  { week: 'Wk 10', label: 'Project Vivas', low: 44, moderate: 38, high: 18, avgPhq9: 9.4, avgGad7: 10.2 },
  { week: 'Wk 11', label: 'Pre-Finals', low: 40, moderate: 40, high: 20, avgPhq9: 10.1, avgGad7: 11.0 },
  { week: 'Wk 12', label: 'End-Sem Exams', low: 36, moderate: 41, high: 23, avgPhq9: 10.9, avgGad7: 11.8 },
];

export const CAMPUS_STRESSOR_DISTRIBUTION = [
  { stressor: 'Academics / Exams', percentage: 68, studentsReporting: 412 },
  { stressor: 'Sleep Disruption', percentage: 54, studentsReporting: 327 },
  { stressor: 'Career / Placements', percentage: 41, studentsReporting: 248 },
  { stressor: 'Financial Pressure', percentage: 29, studentsReporting: 175 },
  { stressor: 'Social / Belonging', percentage: 26, studentsReporting: 157 },
  { stressor: 'Relationships', percentage: 22, studentsReporting: 133 },
  { stressor: 'Nutrition & Health', percentage: 18, studentsReporting: 109 },
];
