import { formatISO } from 'date-fns';
import {
  loadInteractionRecords,
  StoredInteractionRecord,
  InteractionModule
} from '@/services/interactionStorage';

type SkillSection = 'Math' | 'Reading' | 'Writing' | 'Unknown';

interface DailyStat {
  date: string;
  attempted: number;
  correct: number;
  timeSpent: number;
  moduleCounts: Record<InteractionModule, number>;
  skillCounts: Record<string, { count: number; correct: number }>;
}

interface SkillSummary {
  skillId: string;
  skillName: string;
  chapter: string | number | null;
  section: SkillSection;
  correct: number;
  incorrect: number;
  total: number;
  totalTime: number;
  daysPracticed: Set<string>;
}

export interface PerformanceGraphEntry {
  date: string;
  attempted: number;
  globalAverage: number;
  momentum: number;
  dayName: string;
  mostPracticedSkill: {
    name: string;
    percentile: number;
    contribution: number;
  };
}

export interface SkillAnalyticsEntry {
  skillId: string;
  skillName: string;
  chapter: string | number | null;
  section: SkillSection;
  correct: number;
  incorrect: number;
  accuracy: number;
  averageTime: number;
  solvedProblems: number;
  practicePerDay: number;
  globalPercentile: number;
  percentileGrowth: number;
  improvement?: number;
}

export interface ProgressSnapshot {
  userId: string;
  totalProgressPercent: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  questionsAnsweredToday: number;
  streak: number;
  averageScore: number;
  rank: number;
  projectedScore: number;
  speed: number;
  easyAccuracy: number;
  easyAvgTime: number;
  easyCompleted: number;
  easyTotal: number;
  mediumAccuracy: number;
  mediumAvgTime: number;
  mediumCompleted: number;
  mediumTotal: number;
  hardAccuracy: number;
  hardAvgTime: number;
  hardCompleted: number;
  hardTotal: number;
  averageTime: number;
  correctAnswerAvgTime: number;
  incorrectAnswerAvgTime: number;
  longestQuestionTime: number;
  performanceGraph: PerformanceGraphEntry[];
  skillAnalytics: SkillAnalyticsEntry[];
  dataSource: 'local_interactions';
}

const formatDayKey = (iso: string) => iso.slice(0, 10);

const toSkillSection = (module: InteractionModule): SkillSection => {
  switch (module) {
    case 'math':
      return 'Math';
    case 'reading':
      return 'Reading';
    case 'writing':
      return 'Writing';
    default:
      return 'Unknown';
  }
};

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const computeStreak = (days: string[]): number => {
  if (!days.length) return 0;
  const uniqueDays = Array.from(new Set(days)).sort();
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset < uniqueDays.length; offset++) {
    const target = new Date(today);
    target.setDate(today.getDate() - offset);
    const key = formatISO(target, { representation: 'date' });
    if (uniqueDays.includes(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const computeSpeedScore = (averageTime: number): number => {
  if (averageTime <= 0) return 100;
  const normalized = Math.max(0, Math.min(120, averageTime));
  return Math.round(Math.max(10, 110 - (normalized / 120) * 100));
};

const selectMostPracticedSkill = (skillCounts: DailyStat['skillCounts'], totalAttempts: number) => {
  const entries = Object.entries(skillCounts);
  if (!entries.length) {
    return {
      name: 'Mixed Practice',
      percentile: 50,
      contribution: 0
    };
  }

  const [skillName, stats] = entries.reduce((top, current) =>
    current[1].count > top[1].count ? current : top,
  entries[0]);

  const accuracy = stats.count > 0 ? Math.round((stats.correct / stats.count) * 100) : 0;

  const contribution = totalAttempts > 0 ? Math.round((stats.count / totalAttempts) * 100) : 0;

  return {
    name: skillName,
    percentile: Math.min(99, Math.max(1, accuracy)),
    contribution: Math.max(0, Math.min(100, contribution))
  };
};

const normalizeRecord = (record: StoredInteractionRecord): StoredInteractionRecord => {
  if (record.timestamp) return record;
  return {
    ...record,
    timestamp: new Date().toISOString()
  };
};

export const loadNormalizedInteractions = (userId?: string): StoredInteractionRecord[] => {
  const records = loadInteractionRecords().map(normalizeRecord).map(record => ({
    ...record,
    module: record.module ?? 'unknown',
    chapter: record.chapter ?? null,
    topic: record.topic ?? null,
    difficulty: record.difficulty ?? null,
    selectedAnswer: record.selectedAnswer ?? '',
    timeSpentSeconds: Number.isFinite(record.timeSpentSeconds)
      ? record.timeSpentSeconds
      : 0,
    practiceMode: record.practiceMode ?? null
  }));

  const filtered = userId ? records.filter(record => record.userId === userId) : records;
  return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const buildProgressSnapshotFromInteractions = (userId?: string): ProgressSnapshot | null => {
  const interactions = loadNormalizedInteractions(userId);

  if (!interactions.length) {
    return null;
  }

  const totals = {
    correct: 0,
    incorrect: 0,
    time: 0,
    timeCorrect: 0,
    timeIncorrect: 0,
    longestTime: 0,
    difficulties: {
      easy: { count: 0, correct: 0, time: 0 },
      medium: { count: 0, correct: 0, time: 0 },
      hard: { count: 0, correct: 0, time: 0 }
    }
  };

  const dailyMap = new Map<string, DailyStat>();
  const skillMap = new Map<string, SkillSummary>();

  interactions.forEach(record => {
    const { module, timeSpentSeconds, difficulty } = record;
    const dayKey = formatDayKey(record.timestamp);
    const dayStat = dailyMap.get(dayKey) ?? {
      date: dayKey,
      attempted: 0,
      correct: 0,
      timeSpent: 0,
      moduleCounts: { math: 0, reading: 0, writing: 0, unknown: 0 },
      skillCounts: {}
    };

    dayStat.attempted += 1;
    dayStat.timeSpent += record.timeSpentSeconds;
    dayStat.moduleCounts[module] = (dayStat.moduleCounts[module] || 0) + 1;

    const skillName = `${toSkillSection(module)} • ${record.chapter ?? record.topic ?? 'General'}`;
    dayStat.skillCounts[skillName] = dayStat.skillCounts[skillName] || { count: 0, correct: 0 };
    dayStat.skillCounts[skillName].count += 1;

    const skillKey = `${module}|${record.chapter ?? record.topic ?? 'General'}`;
    const skillSummary = skillMap.get(skillKey) ?? {
      skillId: skillKey,
      skillName,
      chapter: record.chapter ?? record.topic ?? 'General',
      section: toSkillSection(module),
      correct: 0,
      incorrect: 0,
      total: 0,
      totalTime: 0,
      daysPracticed: new Set<string>()
    };

    skillSummary.total += 1;
    skillSummary.totalTime += record.timeSpentSeconds;
    skillSummary.daysPracticed.add(dayKey);

    if (record.isCorrect) {
      totals.correct += 1;
      dayStat.correct += 1;
      totals.timeCorrect += record.timeSpentSeconds;
      skillSummary.correct += 1;
      dayStat.skillCounts[skillName].correct += 1;
    } else {
      totals.incorrect += 1;
      totals.timeIncorrect += record.timeSpentSeconds;
      skillSummary.incorrect += 1;
    }

    totals.time += record.timeSpentSeconds;
    totals.longestTime = Math.max(totals.longestTime, record.timeSpentSeconds);

    if (difficulty && difficulty in totals.difficulties) {
      totals.difficulties[difficulty as 'easy' | 'medium' | 'hard'].count += 1;
      if (record.isCorrect) {
        totals.difficulties[difficulty as 'easy' | 'medium' | 'hard'].correct += 1;
      }
      totals.difficulties[difficulty as 'easy' | 'medium' | 'hard'].time += record.timeSpentSeconds;
    }

    dailyMap.set(dayKey, dayStat);
    skillMap.set(skillKey, skillSummary);
  });

  const totalAttempted = totals.correct + totals.incorrect;
  const accuracy = totalAttempted > 0 ? Math.round((totals.correct / totalAttempted) * 100) : 0;
  const averageTime = totalAttempted > 0 ? totals.time / totalAttempted : 0;
  const correctAvgTime = totals.correct > 0 ? totals.timeCorrect / totals.correct : 0;
  const incorrectAvgTime = totals.incorrect > 0 ? totals.timeIncorrect / totals.incorrect : 0;

  const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const overallAverageAttempts = dailyStats.length
    ? Math.round(dailyStats.reduce((sum, stat) => sum + stat.attempted, 0) / dailyStats.length)
    : 0;

  let previousAttempts = 0;
  const performanceGraph: PerformanceGraphEntry[] = dailyStats.slice(-15).map(stat => {
    const momentum = stat.attempted - previousAttempts;
    previousAttempts = stat.attempted;

    const entry = {
      date: stat.date,
      attempted: stat.attempted,
      globalAverage: overallAverageAttempts,
      momentum,
      dayName: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mostPracticedSkill: selectMostPracticedSkill(stat.skillCounts, stat.attempted)
    };
    return entry;
  });

  const todayKey = formatISO(new Date(), { representation: 'date' });
  const questionsAnsweredToday = dailyMap.get(todayKey)?.attempted ?? 0;
  const streak = computeStreak(dailyStats.map(stat => stat.date));

  const buildDifficultyStats = (difficulty: 'easy' | 'medium' | 'hard', fallbackTotal: number) => {
    const entry = totals.difficulties[difficulty];
    const total = entry.count || 0;
    const accuracyValue = total > 0 ? Math.round((entry.correct / total) * 100) : accuracy;
    const averageDifficultyTime = total > 0 ? entry.time / total : averageTime;

    return {
      accuracy: accuracyValue,
      avgTime: Number(averageDifficultyTime.toFixed(1)),
      completed: total,
      total: fallbackTotal
    };
  };

  const easy = buildDifficultyStats('easy', 50);
  const medium = buildDifficultyStats('medium', 50);
  const hard = buildDifficultyStats('hard', 30);

  const skillAnalytics: SkillAnalyticsEntry[] = Array.from(skillMap.values()).map(skill => {
    const accuracyValue = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;
    const averageSkillTime = skill.total > 0 ? skill.totalTime / skill.total : 0;
    const practicePerDay = skill.daysPracticed.size > 0
      ? skill.total / skill.daysPracticed.size
      : skill.total;

    return {
      skillId: skill.skillId,
      skillName: skill.skillName,
      chapter: skill.chapter,
      section: skill.section,
      correct: skill.correct,
      incorrect: skill.incorrect,
      accuracy: accuracyValue,
      averageTime: Number(averageSkillTime.toFixed(2)),
      solvedProblems: skill.total,
      practicePerDay: Number(practicePerDay.toFixed(2)),
      globalPercentile: accuracyValue,
      percentileGrowth: 0,
      improvement: 0
    };
  });

  const projectedScore = Math.max(200, Math.min(800, Math.round(400 + accuracy * 4)));

  return {
    userId: userId || 'local-user',
    totalProgressPercent: accuracy,
    correctAnswers: totals.correct,
    incorrectAnswers: totals.incorrect,
    unattemptedQuestions: Math.max(0, 200 - totalAttempted),
    questionsAnsweredToday,
    streak,
    averageScore: accuracy,
    rank: Math.max(1, 1000 - totals.correct),
    projectedScore,
    speed: computeSpeedScore(averageTime),
    easyAccuracy: easy.accuracy,
    easyAvgTime: easy.avgTime,
    easyCompleted: easy.completed,
    easyTotal: easy.total,
    mediumAccuracy: medium.accuracy,
    mediumAvgTime: medium.avgTime,
    mediumCompleted: medium.completed,
    mediumTotal: medium.total,
    hardAccuracy: hard.accuracy,
    hardAvgTime: hard.avgTime,
    hardCompleted: hard.completed,
    hardTotal: hard.total,
    averageTime: Number(averageTime.toFixed(2)),
    correctAnswerAvgTime: Number(correctAvgTime.toFixed(2)),
    incorrectAnswerAvgTime: Number(incorrectAvgTime.toFixed(2)),
    longestQuestionTime: totals.longestTime,
    performanceGraph,
    skillAnalytics,
    dataSource: 'local_interactions'
  };
};
