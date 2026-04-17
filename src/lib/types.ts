
export type LiftType = 'squat' | 'bench' | 'deadlift' | 'accessory';

export interface Exercise {
  name: string;
  setsReps: string;
  percent: string | number;
  liftType: LiftType;
  link?: string;
  coachingNotes?: string;
  rpeTarget?: string;
}

export interface WorkoutDay {
  id: number;
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Maxes {
  squat: number;
  bench: number;
  deadlift: number;
}

export interface MobilityItem {
  name: string;
  sets: string;
  link?: string;
}

export interface AthleteData {
  password?: string;
  maxes: Maxes;
  completedSets: Record<string, boolean>;
  actualWeights: Record<string, string>;
  actualRpes: Record<string, string>;
  exerciseNotes: Record<string, string>;
  numWeeks: number;
  mobilityList: MobilityItem[];
  workoutData: WorkoutDay[];
  tabNames: Record<string, string>;
  appTitle: string;
  appSubtitle: string;
  profileImage: string | null;
  expandedDays: Record<string, boolean>;
  chartPeriod: 'week' | 'month' | 'year';
  competitionDate?: string; // ISO string
}

export interface Database {
  [athleteName: string]: AthleteData;
}
