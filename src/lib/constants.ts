
import { AthleteData } from './types';

export const INITIAL_MAXES = { squat: 250, bench: 180, deadlift: 300 };

export const INITIAL_MOBILITY: AthleteData['mobilityList'] = [
  { name: "Mobilidade de Tornozelo elástico", sets: "2x 15 seg", link: "https://www.youtube.com/results?search_query=mobilidade+tornozelo+powerlifting" },
  { name: "Rotação Torácica no chão", sets: "2x 10 cada lado", link: "https://www.youtube.com/results?search_query=thoracic+mobility+ground" },
  { name: "Alongamento de posterior", sets: "2x 20 seg", link: "https://www.youtube.com/results?search_query=hamstring+stretch" },
  { name: "Mobilidade de Quadril (90/90)", sets: "2x 10 cada lado", link: "https://www.youtube.com/results?search_query=90+90+hip+mobility" }
];

export const INITIAL_WORKOUT_PLAN: AthleteData['workoutData'] = [
  { id: 1, day: "DIA 1", focus: "Squat", exercises: [
    { name: "Squat low bar", setsReps: "3x8", percent: 0.60, liftType: "squat", coachingNotes: "Aquecimento: 1x15 (vazia), 1x8 (40%), 1x5 (50%). Foco em profundidade.", link: "https://www.youtube.com/results?search_query=tutorial+agachamento+low+bar" },
    { name: "Búlgaro halter", setsReps: "4x8", percent: "", liftType: "accessory", coachingNotes: "Cluster sets: 4 reps + 10s descanso + 4 reps." },
    { name: "Leg press", setsReps: "4x6", percent: "", liftType: "accessory" },
    { name: "Stiff barra", setsReps: "3x6", percent: "", liftType: "accessory" }
  ] },
  { id: 2, day: "DIA 2", focus: "Bench Press", exercises: [
    { name: "Bench press", setsReps: "6x6", percent: 0.60, liftType: "bench", coachingNotes: "Back-off sets: Após as 6 séries, reduzir 10% da carga e fazer +2 séries até a falha técnica.", link: "https://www.youtube.com/results?search_query=tutorial+supino+powerlifting" },
    { name: "Close-grip board médio", setsReps: "2x10", percent: 0.50, liftType: "bench" },
    { name: "OHP press", setsReps: "4x5", percent: "", liftType: "accessory" },
    { name: "Elevação lateral", setsReps: "3x10", percent: "", liftType: "accessory" },
    { name: "Tríceps testa Halter", setsReps: "4x6", percent: "", liftType: "accessory" }
  ] },
  { id: 3, day: "DIA 3", focus: "Deadlift", exercises: [
    { name: "Deadlift Convencional", setsReps: "4x8", percent: 0.60, liftType: "deadlift", coachingNotes: "Aquecimento progressivo até a carga de trabalho.", link: "https://www.youtube.com/results?search_query=tutorial+peso+morto+convencional" },
    { name: "Remada pendlay", setsReps: "4x6", percent: "", liftType: "accessory" },
    { name: "Barra Fixa", setsReps: "3x máx", percent: "", liftType: "accessory" },
    { name: "Rosca direta barra W", setsReps: "4x8", percent: "", liftType: "accessory" },
    { name: "Rosca martelo", setsReps: "3x6", percent: "", liftType: "accessory" }
  ] },
  { id: 4, day: "DIA 4", focus: "SBD", exercises: [
    { name: "Squat low bar", setsReps: "2x5", percent: 0.65, liftType: "squat" },
    { name: "Bench press", setsReps: "3x5", percent: 0.65, liftType: "bench" },
    { name: "Deadlift pausa 3s", setsReps: "2x5", percent: 0.65, liftType: "deadlift" }
  ] }
];

export const EXERCISE_CATEGORIES = {
  "AGACHAMENTO - PRINCIPAIS": [
    { name: "Agachamento Low Bar", video: "https://www.youtube.com/results?search_query=low+bar+squat" },
    { name: "Agachamento High Bar", video: "https://www.youtube.com/results?search_query=high+bar+squat" },
    { name: "Agachamento Pausado", video: "https://www.youtube.com/results?search_query=paused+squat" },
    { name: "Agachamento com Tempo", video: "https://www.youtube.com/results?search_query=tempo+squat" },
    { name: "Agachamento com Correntes", video: "https://www.youtube.com/results?search_query=squat+with+chains" },
    { name: "Agachamento com Elásticos", video: "https://www.youtube.com/results?search_query=squat+with+bands" },
    { name: "Agachamento Safety Bar", video: "https://www.youtube.com/results?search_query=safety+bar+squat" },
    { name: "Agachamento Pin Squat", video: "https://www.youtube.com/results?search_query=pin+squat" }
  ],
  "SUPINO - PRINCIPAIS": [
    { name: "Supino Reto Competição", video: "https://www.youtube.com/results?search_query=bench+press+competition" },
    { name: "Supino Pausado (3s)", video: "https://www.youtube.com/results?search_query=3s+paused+bench" },
    { name: "Supino Pegada Fechada", video: "https://www.youtube.com/results?search_query=close+grip+bench" },
    { name: "Supino com Board", video: "https://www.youtube.com/results?search_query=board+press" },
    { name: "Supino Spoto Press", video: "https://www.youtube.com/results?search_query=spoto+press" },
    { name: "Supino Larsen Press", video: "https://www.youtube.com/results?search_query=larsen+press" },
    { name: "Supino com Correntes", video: "https://www.youtube.com/results?search_query=bench+press+chains" },
    { name: "Supino Inclinado Barra", video: "https://www.youtube.com/results?search_query=incline+bench+press" }
  ],
  "PESO MORTO - PRINCIPAIS": [
    { name: "Peso Morto Convencional", video: "https://www.youtube.com/results?search_query=conventional+deadlift" },
    { name: "Peso Morto Sumo", video: "https://www.youtube.com/results?search_query=sumo+deadlift" },
    { name: "Peso Morto com Pausa", video: "https://www.youtube.com/results?search_query=paused+deadlift" },
    { name: "Peso Morto Déficit", video: "https://www.youtube.com/results?search_query=deficit+deadlift" },
    { name: "Peso Morto Bloco/Rack Pull", video: "https://www.youtube.com/results?search_query=block+pull+deadlift" },
    { name: "Peso Morto Romeno (RDL)", video: "https://www.youtube.com/results?search_query=romanian+deadlift" },
    { name: "Peso Morto Stiff", video: "https://www.youtube.com/results?search_query=stiff+leg+deadlift" },
    { name: "Peso Morto com Elásticos", video: "https://www.youtube.com/results?search_query=deadlift+with+bands" }
  ],
  "COSTAS - REMADAS": [
    { name: "Remada Pendlay", video: "https://www.youtube.com/results?search_query=pendlay+row" },
    { name: "Remada Curvada Pronada", video: "https://www.youtube.com/results?search_query=bent+over+row" },
    { name: "Remada Curvada Supinada", video: "https://www.youtube.com/results?search_query=underhand+bent+over+row" },
    { name: "Remada Cavalinho (T-Bar)", video: "https://www.youtube.com/results?search_query=t-bar+row" },
    { name: "Remada Unilateral Halter", video: "https://www.youtube.com/results?search_query=dumbbell+row" },
    { name: "Remada Baixa Triângulo", video: "https://www.youtube.com/results?search_query=seated+cable+row" },
    { name: "Remada na Máquina", video: "https://www.youtube.com/results?search_query=machine+row" },
    { name: "Seal Row (Remada Foca)", video: "https://www.youtube.com/results?search_query=seal+row" }
  ],
  "COSTAS - VERTICAL": [
    { name: "Barra Fixa (Pull-up)", video: "https://www.youtube.com/results?search_query=pull-ups" },
    { name: "Barra Fixa Supinada (Chin-up)", video: "https://www.youtube.com/results?search_query=chin-ups" },
    { name: "Puxada Alta Pronada", video: "https://www.youtube.com/results?search_query=lat+pulldown" },
    { name: "Puxada Alta Triângulo", video: "https://www.youtube.com/results?search_query=v-bar+pulldown" },
    { name: "Puxada Alta Supinada", video: "https://www.youtube.com/results?search_query=underhand+pulldown" },
    { name: "Pullover na Polia", video: "https://www.youtube.com/results?search_query=cable+pullover" }
  ],
  "PERNAS - ACESSÓRIOS": [
    { name: "Leg Press 45", video: "https://www.youtube.com/results?search_query=leg+press+45" },
    { name: "Hack Squat", video: "https://www.youtube.com/results?search_query=hack+squat" },
    { name: "Agachamento Búlgaro", video: "https://www.youtube.com/results?search_query=bulgarian+split+squat" },
    { name: "Afundo com Halteres", video: "https://www.youtube.com/results?search_query=dumbbell+lunges" },
    { name: "Cadeira Extensora", video: "https://www.youtube.com/results?search_query=leg+extension" },
    { name: "Mesa Flexora", video: "https://www.youtube.com/results?search_query=lying+leg+curl" },
    { name: "Cadeira Flexora", video: "https://www.youtube.com/results?search_query=seated+leg+curl" },
    { name: "Cadeira Abdutora", video: "https://www.youtube.com/results?search_query=hip+abduction+machine" },
    { name: "Cadeira Adutora", video: "https://www.youtube.com/results?search_query=hip+adduction+machine" },
    { name: "Elevação de Gêmeos em Pé", video: "https://www.youtube.com/results?search_query=standing+calf+raise" },
    { name: "Elevação de Gêmeos Sentado", video: "https://www.youtube.com/results?search_query=seated+calf+raise" }
  ],
  "OMBROS": [
    { name: "Desenvolvimento Militar (OHP)", video: "https://www.youtube.com/results?search_query=overhead+press" },
    { name: "Desenvolvimento com Halteres", video: "https://www.youtube.com/results?search_query=dumbbell+shoulder+press" },
    { name: "Elevação Lateral Halteres", video: "https://www.youtube.com/results?search_query=lateral+raises" },
    { name: "Elevação Lateral Polia", video: "https://www.youtube.com/results?search_query=cable+lateral+raise" },
    { name: "Elevação Frontal Halter", video: "https://www.youtube.com/results?search_query=front+raises" },
    { name: "Crucifixo Inverso (Facepull)", video: "https://www.youtube.com/results?search_query=facepulls" },
    { name: "Remada Alta", video: "https://www.youtube.com/results?search_query=upright+row" }
  ],
  "BRAÇOS - TRÍCEPS": [
    { name: "Tríceps Testa Barra W", video: "https://www.youtube.com/results?search_query=skull+crushers" },
    { name: "Tríceps Pulley Corda", video: "https://www.youtube.com/results?search_query=triceps+rope+pushdown" },
    { name: "Tríceps Pulley Barra Reta", video: "https://www.youtube.com/results?search_query=triceps+straight+bar+pushdown" },
    { name: "Tríceps Francês Halter", video: "https://www.youtube.com/results?search_query=french+press+triceps" },
    { name: "Mergulho nas Paralelas", video: "https://www.youtube.com/results?search_query=dips" },
    { name: "Tríceps Coice Polia", video: "https://www.youtube.com/results?search_query=cable+kickbacks" }
  ],
  "BRAÇOS - BÍCEPS": [
    { name: "Rosca Direta Barra", video: "https://www.youtube.com/results?search_query=barbell+curl" },
    { name: "Rosca Direta Halteres", video: "https://www.youtube.com/results?search_query=dumbbell+curl" },
    { name: "Rosca Martelo", video: "https://www.youtube.com/results?search_query=hammer+curl" },
    { name: "Rosca Alternada", video: "https://www.youtube.com/results?search_query=alternating+dumbbell+curl" },
    { name: "Rosca Concentrada", video: "https://www.youtube.com/results?search_query=concentration+curl" },
    { name: "Rosca Scott", video: "https://www.youtube.com/results?search_query=preacher+curl" }
  ],
  "CORE - ESTABILIZAÇÃO": [
    { name: "Prancha Abdominal", video: "https://www.youtube.com/results?search_query=plank" },
    { name: "Abdominal Roda (Ab Wheel)", video: "https://www.youtube.com/results?search_query=ab+wheel" },
    { name: "Deadbug", video: "https://www.youtube.com/results?search_query=deadbug" },
    { name: "Bird Dog", video: "https://www.youtube.com/results?search_query=bird+dog+exercise" },
    { name: "Pallof Press", video: "https://www.youtube.com/results?search_query=pallof+press" },
    { name: "Elevação de Pernas", video: "https://www.youtube.com/results?search_query=leg+raises" },
    { name: "Farmer's Walk", video: "https://www.youtube.com/results?search_query=farmers+walk" }
  ]
};
