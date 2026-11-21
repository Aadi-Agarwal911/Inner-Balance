import { AssessmentType, TriageLevel } from '../types';

export interface AssessmentOption {
  value: number;
  label: string;
}

export interface AssessmentDefinition {
  type: AssessmentType;
  fullName: string;
  shortDescription: string;
  timeframePrompt: string;
  maxScore: number;
  estimatedMinutes: number;
  options: AssessmentOption[];
  questions: string[];
  reverseScoredIndices?: number[]; // 0-based indices for PSS-10
  thresholdSummary: {
    low: string;
    moderate: string;
    high: string;
  };
}

export const PHQ9_GAD7_OPTIONS: AssessmentOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const PSS10_OPTIONS: AssessmentOption[] = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly often' },
  { value: 4, label: 'Very often' },
];

export const ASSESSMENT_DEFINITIONS: Record<AssessmentType, AssessmentDefinition> = {
  'PHQ-9': {
    type: 'PHQ-9',
    fullName: 'Patient Health Questionnaire (PHQ-9)',
    shortDescription: 'Validated 9-item depression symptom screener measuring low mood, energy, and concentration.',
    timeframePrompt: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    maxScore: 27,
    estimatedMinutes: 3,
    options: PHQ9_GAD7_OPTIONS,
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading coursework or following lectures',
      'Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead, or of hurting yourself in some way',
    ],
    thresholdSummary: {
      low: '0–9: Minimal to Mild symptoms',
      moderate: '10–14: Moderate symptoms',
      high: '15–27 (or Item 9 ≥ 1): Moderately Severe to Severe — Priority Support',
    },
  },
  'GAD-7': {
    type: 'GAD-7',
    fullName: 'Generalized Anxiety Disorder Scale (GAD-7)',
    shortDescription: 'Validated 7-item anxiety screener assessing worry intensity, restlessness, and tension.',
    timeframePrompt: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    maxScore: 21,
    estimatedMinutes: 2,
    options: PHQ9_GAD7_OPTIONS,
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid, as if something awful might happen',
    ],
    thresholdSummary: {
      low: '0–9: Minimal to Mild anxiety',
      moderate: '10–14: Moderate anxiety',
      high: '15–21: Severe anxiety — Priority Support',
    },
  },
  'PSS-10': {
    type: 'PSS-10',
    fullName: 'Perceived Stress Scale (PSS-10)',
    shortDescription: 'Validated 10-item measure of how unpredictable, overloaded, and uncontrollable daily life feels.',
    timeframePrompt: 'In the last month, how often have you experienced the following?',
    maxScore: 40,
    estimatedMinutes: 3,
    options: PSS10_OPTIONS,
    reverseScoredIndices: [3, 4, 6, 7], // Items 4, 5, 7, 8 (1-based)
    questions: [
      'Been upset because of something that happened unexpectedly',
      'Felt that you were unable to control the important things in your life',
      'Felt nervous and stressed',
      'Felt confident about your ability to handle your personal problems',
      'Felt that things were going your way',
      'Found that you could not cope with all the things that you had to do',
      'Been able to control irritations in your life',
      'Felt that you were on top of things',
      'Been angered because of things that happened that were outside of your control',
      'Felt difficulties were piling up so high that you could not overcome them',
    ],
    thresholdSummary: {
      low: '0–13: Low perceived stress',
      moderate: '14–26: Moderate perceived stress',
      high: '27–40: High perceived stress — Priority Support',
    },
  },
};

export interface TriageEvaluation {
  score: number;
  maxScore: number;
  severityLabel: string;
  triageLevel: TriageLevel;
  flaggedSelfHarmItem: boolean;
  summaryTitle: string;
  guidanceText: string;
  nextSteps: string[];
}

/**
 * Deterministic, rule-based clinical triage scoring engine.
 * Strictly threshold-driven — zero AI inference or automated diagnosis.
 */
export function evaluateAssessment(
  type: AssessmentType,
  responses: number[]
): TriageEvaluation {
  const def = ASSESSMENT_DEFINITIONS[type];
  const reverseSet = new Set(def.reverseScoredIndices ?? []);

  const score = responses.reduce((sum, raw, idx) => {
    const val = reverseSet.has(idx) ? 4 - raw : raw;
    return sum + val;
  }, 0);

  if (type === 'PHQ-9') {
    const flaggedSelfHarmItem = (responses[8] ?? 0) >= 1;
    let severityLabel = 'Minimal';
    if (score >= 20) severityLabel = 'Severe';
    else if (score >= 15) severityLabel = 'Moderately Severe';
    else if (score >= 10) severityLabel = 'Moderate';
    else if (score >= 5) severityLabel = 'Mild';

    if (score >= 15 || flaggedSelfHarmItem) {
      return {
        score,
        maxScore: 27,
        severityLabel: flaggedSelfHarmItem && score < 15 ? `${severityLabel} (Safety Flag)` : severityLabel,
        triageLevel: 'high',
        flaggedSelfHarmItem,
        summaryTitle: 'High / Urgent Support Recommended',
        guidanceText: flaggedSelfHarmItem
          ? 'Your responses indicate recent thoughts of self-harm or significant distress. You do not have to navigate this alone—please connect with a trained campus counselor or 24/7 crisis responder right away.'
          : 'Your PHQ-9 score falls in the moderately severe to severe range. Connecting with a campus psychologist for priority human support is strongly recommended.',
        nextSteps: [
          'Review the 24/7 Crisis Helpline numbers below or call Tele-MANAS (14416) immediately if you feel unsafe.',
          'Use one-click Priority Counseling Booking to alert the Campus Wellness Desk for an expedited slot.',
          'Reach out to a trusted friend, family member, or hostel warden so you are not alone today.',
        ],
      };
    }

    if (score >= 10) {
      return {
        score,
        maxScore: 27,
        severityLabel,
        triageLevel: 'moderate',
        flaggedSelfHarmItem: false,
        summaryTitle: 'Moderate — Structured Support Recommended',
        guidanceText:
          'Your score indicates moderate depressive symptoms that may be affecting your academic energy, sleep, or enjoyment. Pairing structured self-guided exercises with a confidential campus counselor conversation can help.',
        nextSteps: [
          'Book a confidential session with a verified campus counselor to discuss practical coping strategies.',
          'Practice a 5-minute grounding or breathing exercise in the Wellness Hub when overwhelm rises.',
          'Log daily mood and sleep trends over the next 7 days to notice patterns.',
        ],
      };
    }

    return {
      score,
      maxScore: 27,
      severityLabel,
      triageLevel: 'low',
      flaggedSelfHarmItem: false,
      summaryTitle: 'Low / Manageable Range',
      guidanceText:
        'Your current PHQ-9 score is in the minimal-to-mild range. Continuing regular sleep, movement, and brief mood check-ins helps maintain steady emotional resilience across the semester.',
      nextSteps: [
        'Explore curated self-help articles and sleep hygiene guides in the Wellness Hub.',
        'Maintain your daily mood check-in streak to catch workload shifts early.',
        'Re-screen in 2 weeks or anytime academic pressure increases.',
      ],
    };
  }

  if (type === 'GAD-7') {
    let severityLabel = 'Minimal';
    if (score >= 15) severityLabel = 'Severe';
    else if (score >= 10) severityLabel = 'Moderate';
    else if (score >= 5) severityLabel = 'Mild';

    if (score >= 15) {
      return {
        score,
        maxScore: 21,
        severityLabel,
        triageLevel: 'high',
        flaggedSelfHarmItem: false,
        summaryTitle: 'High / Urgent Support Recommended',
        guidanceText:
          'Your GAD-7 score indicates severe anxiety symptoms. Persistent worry and physical tension at this intensity deserve prompt, compassionate support from a campus clinician.',
        nextSteps: [
          'Book a priority session with a campus counselor specialized in anxiety management.',
          'If anxiety feels acute or overwhelming right now, contact Campus Crisis Support or Tele-MANAS (14416).',
          'Try the 4-7-8 Guided Breathing Timer to slow down physiological arousal.',
        ],
      };
    }

    if (score >= 10) {
      return {
        score,
        maxScore: 21,
        severityLabel,
        triageLevel: 'moderate',
        flaggedSelfHarmItem: false,
        summaryTitle: 'Moderate — Structured Support Recommended',
        guidanceText:
          'Your GAD-7 score reflects moderate anxiety. Structured breathing exercises, grounding practices, and a supportive session with a campus counselor are well suited for this level.',
        nextSteps: [
          'Schedule a confidential consultation with a campus counselor.',
          'Use the 5-4-3-2-1 Grounding Exercise before exams or high-stress deadlines.',
          'Track anxiety triggers (Academics, Sleep, Finance) in your daily check-in.',
        ],
      };
    }

    return {
      score,
      maxScore: 21,
      severityLabel,
      triageLevel: 'low',
      flaggedSelfHarmItem: false,
      summaryTitle: 'Low / Manageable Range',
      guidanceText:
        'Your current anxiety score falls within the minimal-to-mild range. Keep nurturing steady routines and preventive wellness habits.',
      nextSteps: [
        'Browse exam pacing and focus tools in the Wellness Hub.',
        'Continue logging sleep quality and mood check-ins.',
      ],
    };
  }

  // PSS-10
  let severityLabel = 'Low Stress';
  if (score >= 27) severityLabel = 'High Perceived Stress';
  else if (score >= 14) severityLabel = 'Moderate Perceived Stress';

  if (score >= 27) {
    return {
      score,
      maxScore: 40,
      severityLabel,
      triageLevel: 'high',
      flaggedSelfHarmItem: false,
      summaryTitle: 'High / Urgent Support Recommended',
      guidanceText:
        'Your PSS-10 score shows high perceived stress and sustained academic or personal overload. Priority support with a campus counselor can help you decompress and establish sustainable boundaries.',
      nextSteps: [
        'Use one-click Priority Booking to speak with a campus counselor this week.',
        'Keep 24/7 crisis helplines accessible if stress feels unmanageable tonight.',
        'Pause non-essential tasks and start a 4-7-8 breathing cycle.',
      ],
    };
  }

  if (score >= 14) {
    return {
      score,
      maxScore: 40,
      severityLabel,
      triageLevel: 'moderate',
      flaggedSelfHarmItem: false,
      summaryTitle: 'Moderate — Structured Support Recommended',
      guidanceText:
        'Your stress load is moderate—common during project deadlines and exam weeks, yet worth addressing early before burnout accumulates.',
      nextSteps: [
        'Try the structured burnout recovery and exam-pacing modules in the Wellness Hub.',
        'Consider booking a preventive check-in with a campus counselor.',
        'Monitor which daily triggers correlate with your lowest sleep scores.',
      ],
    };
  }

  return {
    score,
    maxScore: 40,
    severityLabel,
    triageLevel: 'low',
    flaggedSelfHarmItem: false,
    summaryTitle: 'Low / Manageable Range',
    guidanceText:
      'Your perceived stress is currently well managed. Keep using healthy boundaries, restorative sleep, and regular self-check-ins.',
    nextSteps: [
      'Explore productivity pacing tools in the Wellness Hub to sustain balance.',
      'Check back during midterm or final exam periods.',
    ],
  };
}
