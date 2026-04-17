
import { Database, AthleteData } from './types';
import { INITIAL_MAXES, INITIAL_MOBILITY, INITIAL_WORKOUT_PLAN } from './constants';

const DB_KEY = 'powerliftPro_AthletesDB';

export const getDatabase = (): Database => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(DB_KEY);
  return saved ? JSON.parse(saved) : {};
};

export const saveToDatabase = (athleteName: string, data: AthleteData) => {
  if (typeof window === 'undefined') return;
  const db = getDatabase();
  db[athleteName] = data;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const createDefaultAthlete = (password?: string): AthleteData => ({
  password,
  maxes: JSON.parse(JSON.stringify(INITIAL_MAXES)),
  completedSets: {},
  actualWeights: {},
  actualRpes: {},
  exerciseNotes: {},
  numWeeks: 3,
  mobilityList: JSON.parse(JSON.stringify(INITIAL_MOBILITY)),
  workoutData: JSON.parse(JSON.stringify(INITIAL_WORKOUT_PLAN)),
  tabNames: { 
    bloco1: "📋 TREINO", 
    analise: "📈 MÉDIAS - ANÁLISE", 
    dashboard: "📊 PERFIL", 
    mobilidade: "🧘 MOBILIDADE",
    calendario: "🗓️ CALENDÁRIO"
  },
  appTitle: "⚡ POWERLIFT PRO",
  appSubtitle: "Controle | Evolução | Análise",
  profileImage: null,
  expandedDays: {},
  chartPeriod: 'week',
  competitionDate: undefined
});
