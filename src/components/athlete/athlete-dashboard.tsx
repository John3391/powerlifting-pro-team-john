
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AthleteData, WorkoutDay, LiftType, Exercise } from '@/lib/types';
import { getDatabase, saveToDatabase } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";
import { 
  Dumbbell, BarChart2, Activity, Calendar as CalendarIcon, Camera, LogOut, ChevronLeft, Sparkles, Plus, 
  Trash2, Search, ChevronDown, ChevronUp, PlayCircle, Weight, MessageSquare, X, Info, Check, TrendingUp, Zap, Gauge, 
  Trophy, Target, ArrowRight, Shield, Sword, Flame, Skull
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PerformanceCharts } from "@/components/performance-charts";
import { ExerciseModal } from "@/components/exercise-modal";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { format, differenceInWeeks, addWeeks, startOfToday, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AthleteDashboardProps {
  athleteName: string;
  isCoachMode: boolean;
  onBackToCoachList?: () => void;
  onLogout: () => void;
}

export function AthleteDashboard({ athleteName, isCoachMode, onBackToCoachList, onLogout }: AthleteDashboardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<AthleteData | null>(null);
  const [activeTab, setActiveTab] = useState('training');
  const [activeWeek, setActiveWeek] = useState(0);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<{ dayId: number, exIndex: number | null }>({ dayId: 0, exIndex: null });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Estados para edição manual de data
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDateInput, setTempDateInput] = useState({ day: "", month: "", year: "" });

  useEffect(() => {
    const db = getDatabase();
    const athleteData = db[athleteName];
    if (athleteData) {
      setData(athleteData);
      setLastSaved(new Date());
    }
  }, [athleteName]);

  const save = (newData: AthleteData) => {
    setData(newData);
    saveToDatabase(athleteName, newData);
    setLastSaved(new Date());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O limite é 2MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (data) {
        save({ ...data, profileImage: base64 });
        toast({ title: "Logotipo Atualizado", description: "Sua marca pessoal foi definida!" });
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateWeight = (liftType: LiftType, percent: string | number) => {
    if (!percent || !data) return null;
    const cleanPercent = typeof percent === 'string' ? percent.toLowerCase().replace('kg', '').replace('%', '').trim() : percent;
    const val = typeof cleanPercent === 'string' ? parseFloat(cleanPercent) : cleanPercent;
    if (isNaN(val)) return null;

    if (liftType === 'accessory' || (typeof percent === 'string' && (percent.toLowerCase().includes('kg') || !percent.includes('%')))) {
      return val;
    }
    
    let p = val;
    if (p > 1.5) p = p / 100;
    return Math.round(data.maxes[liftType] * p);
  };

  const getNumSets = (setsReps: string) => {
    const parts = setsReps.toLowerCase().split('x');
    return parseInt(parts[0]) || 1;
  };

  const updateExercise = (dayId: number, exIdx: number, field: keyof Exercise, value: any) => {
    if (!data) return;
    const newWorkout = [...data.workoutData];
    const day = newWorkout.find(d => d.id === dayId);
    if (day) {
      day.exercises[exIdx] = { ...day.exercises[exIdx], [field]: value };
      save({ ...data, workoutData: newWorkout });
    }
  };

  const updateLog = (weekIdx: number, dayId: number, exIdx: number, field: 'weight' | 'note' | 'rpe', value: string) => {
    if (!data) return;
    const key = `w${weekIdx}-d${dayId}-e${exIdx}`;
    if (field === 'weight') {
      save({ ...data, actualWeights: { ...data.actualWeights, [key]: value } });
    } else if (field === 'rpe') {
      save({ ...data, actualRpes: { ...data.actualRpes, [key]: value } });
    } else {
      save({ ...data, exerciseNotes: { ...data.exerciseNotes, [key]: value } });
    }
  };

  const toggleSet = (weekIdx: number, dayId: number, exIdx: number, setIdx: number) => {
    if (!data) return;
    const key = `w${weekIdx}-d${dayId}-e${exIdx}-s${setIdx}`;
    save({ ...data, completedSets: { ...data.completedSets, [key]: !data.completedSets[key] } });
  };

  const removeExercise = (dayId: number, exIdx: number) => {
    if (!data) return;
    const newWorkout = [...data.workoutData];
    const day = newWorkout.find(d => d.id === dayId);
    if (day) {
      day.exercises.splice(exIdx, 1);
      save({ ...data, workoutData: newWorkout });
    }
  };

  const removeDay = (dayId: number) => {
    if (!data) return;
    save({ ...data, workoutData: data.workoutData.filter(d => d.id !== dayId) });
  };

  const addDay = () => {
    if (!data) return;
    const newDay: WorkoutDay = {
      id: Date.now(),
      day: `DIA ${data.workoutData.length + 1}`,
      focus: "Geral",
      exercises: []
    };
    save({ ...data, workoutData: [...data.workoutData, newDay] });
  };

  const getLiftColor = (type: LiftType) => {
    switch(type) {
      case 'squat': return 'text-chart-1 border-chart-1 bg-chart-1/5';
      case 'bench': return 'text-chart-2 border-chart-2 bg-chart-2/5';
      case 'deadlift': return 'text-chart-4 border-chart-4 bg-chart-4/5';
      default: return 'text-primary border-primary bg-primary/5';
    }
  };

  const handleApplyTypedDate = () => {
    const { day, month, year } = tempDateInput;
    if (!day || !month || !year) return;
    
    // Validar e criar data
    const dateStr = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    
    if (isValid(parsedDate)) {
      save({ ...data!, competitionDate: parsedDate.toISOString() });
      setIsEditingDate(false);
      toast({ title: "Destino Definido", description: `Data alterada para ${dateStr}` });
    } else {
      toast({ title: "Data Inválida", description: "Verifique os valores digitados.", variant: "destructive" });
    }
  };

  const clearCompetitionDate = () => {
    if (!data) return;
    save({ ...data, competitionDate: undefined });
    toast({ title: "Calendário Limpo", description: "A data da competição foi removida." });
  };

  const clearTrainingHistory = () => {
    if (!data) return;
    save({
      ...data,
      completedSets: {},
      actualWeights: {},
      actualRpes: {},
      exerciseNotes: {}
    });
    toast({ title: "Histórico Excluído", description: "Todos os registros de treino foram limpos." });
  };

  // Lógica de Calendário e Trajetória
  const compDate = data?.competitionDate ? new Date(data.competitionDate) : undefined;
  const weeksToComp = useMemo(() => {
    if (!compDate) return null;
    return differenceInWeeks(compDate, startOfToday());
  }, [compDate]);

  const trajectory = useMemo(() => {
    if (weeksToComp === null) return [];
    
    const steps = [];
    const totalWeeksToShow = Math.max(weeksToComp + 4, 16);
    
    for (let i = 0; i < totalWeeksToShow; i++) {
      const weeksLeft = weeksToComp - i;
      let phase = "OFF-SEASON";
      let color = "text-muted-foreground";
      let icon = <Activity className="w-5 h-5" />;
      let description = "Foco em volume e técnica básica.";

      if (weeksLeft < 0) {
        phase = "PÓS-PROVA";
        color = "text-chart-3";
        icon = <Check className="w-5 h-5" />;
        description = "Recuperação ativa e balanço de danos.";
      } else if (weeksLeft <= 1) {
        phase = "TAPER / PEAK";
        color = "text-accent";
        icon = <Flame className="w-5 h-5" />;
        description = "Redução drástica de volume, intensidade máxima.";
      } else if (weeksLeft <= 4) {
        phase = "PEAKING (PICO)";
        color = "text-primary";
        icon = <Zap className="w-5 h-5" />;
        description = "Semanas de singles e cargas de recorde.";
      } else if (weeksLeft <= 8) {
        phase = "FORÇA ESPECÍFICA";
        color = "text-chart-1";
        icon = <Sword className="w-5 h-5" />;
        description = "Aumento de intensidade, redução de volume.";
      } else if (weeksLeft <= 12) {
        phase = "HIPERTROFIA / BASE";
        color = "text-chart-2";
        icon = <Shield className="w-5 h-5" />;
        description = "Volume alto, foco em acessórios e variações.";
      }

      steps.push({ weekNum: i + 1, weeksLeft, phase, color, icon, description });
    }
    return steps;
  }, [weeksToComp]);

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Estilo Logotipo */}
      <header className="relative pt-12 pb-8 px-4 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="absolute top-4 right-4 flex gap-2">
            {isCoachMode && onBackToCoachList && (
              <Button size="sm" variant="outline" onClick={onBackToCoachList} className="rounded-full bg-secondary/50 border-border h-8 text-[10px] font-black uppercase">
                <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full bg-accent/10 border-accent/50 text-accent hover:bg-accent hover:text-white h-8 text-[10px] font-black uppercase">
              <LogOut className="w-3 h-3 mr-1" /> Sair
            </Button>
          </div>

          <div 
            onClick={() => !isCoachMode && fileInputRef.current?.click()}
            className="relative w-28 h-28 sm:w-36 sm:h-36 group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-500" />
            <div className="relative w-full h-full bg-black border-4 border-primary rounded-[2.5rem] overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95">
              {data.profileImage ? (
                <img src={data.profileImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/50">
                  <Camera className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-black uppercase">Logo Atleta</span>
                </div>
              )}
              {!isCoachMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">
              {athleteName} <span className="text-primary tracking-widest not-italic">×</span> {data.appTitle}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-border" />
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">{data.appSubtitle}</p>
              <div className="h-px w-8 bg-border" />
            </div>
          </div>
        </div>
      </header>

      {/* Navegação Global */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border/50">
          <TabsList className="max-w-6xl mx-auto flex h-14 bg-transparent p-0 overflow-x-auto hide-scrollbar">
            {[
              { id: 'training', label: data.tabNames.bloco1 },
              { id: 'analise', label: data.tabNames.analise },
              { id: 'calendario', label: data.tabNames.calendario || '🗓️ CALENDÁRIO' },
              { id: 'dashboard', label: data.tabNames.dashboard },
              { id: 'mobility', label: data.tabNames.mobilidade }
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex-1 min-w-[120px] h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="max-w-6xl mx-auto w-full p-4 sm:p-8">
          {/* Treino */}
          <TabsContent value="training" className="space-y-8 mt-0">
            <div className="flex justify-between items-center gap-4 bg-card/50 p-6 rounded-[2rem] border border-border/50 shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2"><Zap className="w-3 h-3" /> Plano de Guerra</span>
                <h2 className="text-xl font-black text-white uppercase">Caminho da Força</h2>
              </div>
              <div className="flex gap-2">
                {isCoachMode && (
                  <Button onClick={addDay} className="bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] h-10 px-4 rounded-xl">
                    <Plus className="w-4 h-4 mr-1" /> Novo Dia
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {Array.from({ length: data.numWeeks }).map((_, i) => (
                <Button 
                  key={i} 
                  onClick={() => setActiveWeek(i)}
                  variant={activeWeek === i ? 'default' : 'secondary'}
                  className={`h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeWeek === i ? 'bg-primary text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-secondary/50 border border-border/50 text-muted-foreground'}`}
                >
                  Semana {i + 1}
                </Button>
              ))}
              {isCoachMode && (
                <Button onClick={() => save({...data, numWeeks: data.numWeeks + 1})} variant="outline" className="h-12 w-12 rounded-2xl border-dashed border-primary/30 text-primary p-0">
                  <Plus className="w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {data.workoutData.map(day => {
                const dayKey = `${activeWeek}-${day.id}`;
                const isExpanded = data.expandedDays[dayKey] !== false;
                let dayTotal = 0, dayDone = 0;
                day.exercises.forEach((ex, exIdx) => {
                  const sets = getNumSets(ex.setsReps);
                  dayTotal += sets;
                  for(let s=0; s<sets; s++) if (data.completedSets[`w${activeWeek}-d${day.id}-e${exIdx}-s${s}`]) dayDone++;
                });
                const progress = dayTotal > 0 ? (dayDone / dayTotal) * 100 : 0;
                const isComplete = progress === 100;

                return (
                  <div key={day.id} className={`bg-card/40 border-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isComplete ? 'border-chart-3 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-border/50'}`}>
                    <Progress value={progress} className={`h-1.5 rounded-none bg-black/40 ${isComplete ? '[&>div]:bg-chart-3' : ''}`} />
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div 
                        onClick={() => save({...data, expandedDays: {...data.expandedDays, [dayKey]: !isExpanded}})} 
                        className="cursor-pointer flex-1 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter ${isComplete ? 'text-chart-3' : 'text-white'}`}>{day.day}</h3>
                          {isComplete && <Check className="text-chart-3 w-6 h-6" strokeWidth={4} />}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-accent/10 text-accent border-accent/20 font-black text-[9px] uppercase tracking-widest">Foco Viking</Badge>
                          {isCoachMode ? (
                            <input value={day.focus} onClick={e => e.stopPropagation()} onChange={e => {
                              const newW = [...data.workoutData];
                              const d = newW.find(dw => dw.id === day.id);
                              if(d) d.focus = e.target.value;
                              save({...data, workoutData: newW});
                            }} className="bg-black/50 border border-border rounded-xl px-4 py-1.5 text-xs font-bold text-white uppercase focus:ring-primary w-40" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground uppercase">{day.focus}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${isComplete ? 'bg-chart-3/10 border-chart-3 text-chart-3' : 'bg-black/40 border-border text-muted-foreground'}`}>
                          {dayDone} / {dayTotal} Séries
                        </div>
                        {isCoachMode && (
                          <Button variant="ghost" size="icon" onClick={() => removeDay(day.id)} className="h-10 w-10 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-2xl">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => save({...data, expandedDays: {...data.expandedDays, [dayKey]: !isExpanded}})}
                          className="h-10 w-10 rounded-2xl bg-secondary/50"
                        >
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-8 bg-black/20 border-t border-border/50 space-y-6">
                        {day.exercises.map((ex, exIdx) => {
                          const numSets = getNumSets(ex.setsReps);
                          const weight = calculateWeight(ex.liftType, ex.percent);
                          const logKey = `w${activeWeek}-d${day.id}-e${exIdx}`;
                          const liftStyles = getLiftColor(ex.liftType);

                          return (
                            <div key={exIdx} className="bg-card/60 border border-border/50 rounded-3xl p-6 sm:p-8 relative hover:border-primary/30 transition-all group">
                              <div className="flex justify-between items-start gap-4 mb-8">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    {isCoachMode ? (
                                      <input value={ex.name} onChange={e => updateExercise(day.id, exIdx, 'name', e.target.value)} className="bg-transparent border-none text-white font-black uppercase text-xl sm:text-2xl focus:ring-0 w-full" />
                                    ) : (
                                      <h4 className="text-white font-black uppercase text-xl sm:text-2xl tracking-tighter">{ex.name}</h4>
                                    )}
                                  </div>
                                  {ex.link && (
                                    <a href={ex.link} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-accent uppercase bg-accent/5 px-3 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-all">
                                      <PlayCircle className="w-4 h-4" /> Ver Ritual
                                    </a>
                                  )}
                                </div>
                                {isCoachMode && (
                                  <Button variant="ghost" size="icon" onClick={() => removeExercise(day.id, exIdx)} className="h-10 w-10 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-2xl"><Trash2 className="w-5 h-5" /></Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="bg-black/40 p-4 rounded-2xl border border-border/30 text-center">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Volume</label>
                                  {isCoachMode ? (
                                    <input value={ex.setsReps} onChange={e => updateExercise(day.id, exIdx, 'setsReps', e.target.value)} className="w-full bg-black border border-border rounded-lg text-center text-sm font-black text-white outline-none h-8" />
                                  ) : (
                                    <span className="text-lg font-black text-white">{ex.setsReps}</span>
                                  )}
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-border/30 text-center">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase block mb-1">% / Carga</label>
                                  {isCoachMode ? (
                                    <input value={ex.percent} onChange={e => updateExercise(day.id, exIdx, 'percent', e.target.value)} className="w-full bg-black border border-border rounded-lg text-center text-sm font-black text-primary outline-none h-8" />
                                  ) : (
                                    <span className="text-lg font-black text-primary">{ex.percent || '-'}</span>
                                  )}
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-border/30 text-center flex flex-col justify-center">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Padrão</label>
                                  {isCoachMode ? (
                                    <Select value={ex.liftType} onValueChange={val => updateExercise(day.id, exIdx, 'liftType', val)}>
                                      <SelectTrigger className="h-8 bg-black border-border text-[9px] font-black uppercase"><SelectValue /></SelectTrigger>
                                      <SelectContent className="bg-card border-border">
                                        <SelectItem value="squat">SQUAT</SelectItem>
                                        <SelectItem value="bench">BENCH</SelectItem>
                                        <SelectItem value="deadlift">DEADLIFT</SelectItem>
                                        <SelectItem value="accessory">ACESSÓRIO</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">{ex.liftType}</span>
                                  )}
                                </div>
                                <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center items-center shadow-lg transition-all ${liftStyles}`}>
                                  <label className="text-[8px] font-black uppercase block mb-1 opacity-70">Peso Alvo</label>
                                  <div className="text-2xl font-black">{weight ? `${weight}kg` : '-'}</div>
                                </div>
                              </div>

                              <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                <label className="text-[10px] font-black text-primary uppercase flex items-center gap-2 mb-3"><Info className="w-4 h-4" /> Pergaminho de Treino (Metodologia)</label>
                                {isCoachMode ? (
                                  <Textarea value={ex.coachingNotes || ""} onChange={e => updateExercise(day.id, exIdx, 'coachingNotes', e.target.value)} placeholder="Ex: Back-off sets, Cluster sets, RPE..." className="bg-black/50 border-border text-xs font-medium text-white min-h-[80px]" />
                                ) : (
                                  <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">{ex.coachingNotes || "Sem notas táticas."}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 border-t border-border/30 pt-8">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-accent uppercase flex items-center gap-2"><Weight className="w-4 h-4" /> Peso Erguido (kg)</label>
                                  <Input value={data.actualWeights[logKey] || ""} onChange={e => updateLog(activeWeek, day.id, exIdx, 'weight', e.target.value)} placeholder="0 kg" className="bg-black border-border h-12 font-black text-lg text-white" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-chart-5 uppercase flex items-center gap-2"><Gauge className="w-4 h-4" /> RPE Alcançado</label>
                                  <Input value={data.actualRpes[logKey] || ""} onChange={e => updateLog(activeWeek, day.id, exIdx, 'rpe', e.target.value)} placeholder="7-10" className="bg-black border-border h-12 font-black text-lg text-white" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-primary uppercase flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Feedback da Batalha</label>
                                  <Input value={data.exerciseNotes[logKey] || ""} onChange={e => updateLog(activeWeek, day.id, exIdx, 'note', e.target.value)} placeholder="Senti..." className="bg-black border-border h-12 font-black text-sm text-white" />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-4 pt-6 border-t border-border/30">
                                {Array.from({ length: numSets }).map((_, s) => {
                                  const setKey = `w${activeWeek}-d${day.id}-e${exIdx}-s${s}`;
                                  const done = data.completedSets[setKey];
                                  return (
                                    <button 
                                      key={s} 
                                      onClick={() => toggleSet(activeWeek, day.id, exIdx, s)}
                                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all transform active:scale-90 ${done ? 'bg-chart-3 border-chart-3 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110' : 'bg-black/40 border-border text-muted-foreground/20 hover:border-primary/50'}`}
                                    >
                                      {done ? <Check className="w-8 h-8" strokeWidth={4} /> : <span className="text-xs font-black">{s+1}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {isCoachMode && (
                          <Button 
                            variant="outline" 
                            className="w-full py-12 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase text-[12px] gap-3 rounded-[2rem]"
                            onClick={() => { setModalTarget({ dayId: day.id, exIndex: null }); setIsExerciseModalOpen(true); }}
                          >
                            <Plus className="w-6 h-6" /> Adicionar Novos Ritual de Força
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Análise */}
          <TabsContent value="analise" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-card/40 border-border/50 rounded-[2rem] shadow-2xl">
                <CardHeader className="p-8">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3"><BarChart2 className="w-5 h-5 text-primary" /> Volume vs Intensidade</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] p-8">
                  <PerformanceCharts athleteData={data} type="volume-intensity" />
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 rounded-[2rem] shadow-2xl">
                <CardHeader className="p-8">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3"><Gauge className="w-5 h-5 text-chart-5" /> Fadiga Acumulada (RPE)</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] p-8">
                  <PerformanceCharts athleteData={data} type="fatigue" />
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 rounded-[2rem] shadow-2xl lg:col-span-2">
                <CardHeader className="p-8">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3"><Zap className="w-5 h-5 text-accent" /> Evolução SBD Estimada</CardTitle>
                </CardHeader>
                <CardContent className="h-[450px] p-8">
                  <PerformanceCharts athleteData={data} type="performance" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendário Competitivo */}
          <TabsContent value="calendario" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/40 border-border/50 rounded-[2.5rem] shadow-2xl p-8 lg:col-span-1 relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-700" />
                
                <div className="flex flex-col gap-10 relative z-10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-black/60 rounded-[2rem] border-2 border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.1)] group-hover:border-primary/50 transition-all">
                      <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Dia do <span className="text-primary not-italic">Combate</span></h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-[0.3em] opacity-60">Prepare seu destino</p>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                      <CalendarIcon className="w-4 h-4" /> Selecionar Data da Prova
                    </label>
                    <div className="bg-black/60 border-2 border-border/50 rounded-[2rem] p-8 group/date hover:border-primary/50 transition-all shadow-inner relative overflow-hidden min-h-[320px] flex items-center justify-center">
                      {!isEditingDate ? (
                        <div className="flex flex-col items-center gap-6 w-full">
                          <div className="text-7xl font-black text-white tracking-tighter leading-none group-hover/date:scale-110 transition-transform duration-500">
                            {compDate ? format(compDate, "dd") : "--"}
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-[12px] font-black text-primary uppercase tracking-widest mb-1">
                              {compDate ? format(compDate, "MMMM", { locale: ptBR }) : "Mês"}
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">
                              {compDate ? format(compDate, "yyyy") : "Ano"}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full max-w-[200px]">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 rounded-full border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">
                                  Calendário
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-card border-border shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden" align="center" sideOffset={15}>
                                <Calendar
                                  mode="single"
                                  selected={compDate}
                                  onSelect={(date) => date && save({ ...data, competitionDate: date.toISOString() })}
                                  disabled={(date) => date < startOfToday()}
                                  initialFocus
                                  locale={ptBR}
                                  captionLayout="dropdown-buttons"
                                  fromYear={new Date().getFullYear()}
                                  toYear={new Date().getFullYear() + 5}
                                  className="p-6"
                                />
                              </PopoverContent>
                            </Popover>
                            <Button 
                              onClick={() => {
                                setIsEditingDate(true);
                                setTempDateInput({
                                  day: compDate ? format(compDate, "dd") : "",
                                  month: compDate ? format(compDate, "MM") : "",
                                  year: compDate ? format(compDate, "yyyy") : ""
                                });
                              }}
                              variant="outline" 
                              size="sm" 
                              className="flex-1 rounded-full border-accent/20 bg-accent/5 text-accent text-[8px] font-black uppercase hover:bg-accent hover:text-white"
                            >
                              Digitar
                            </Button>
                          </div>
                          {compDate && (
                            <Button 
                              onClick={clearCompetitionDate}
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-[10px] font-black uppercase text-muted-foreground hover:text-accent flex items-center gap-1 mx-auto"
                            >
                              <X className="w-3 h-3" /> Limpar Destino
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300 w-full">
                          <div className="flex gap-2">
                            <div className="flex flex-col items-center gap-1">
                              <label className="text-[8px] font-black text-primary uppercase">Dia</label>
                              <input 
                                type="text" 
                                maxLength={2}
                                placeholder="DD"
                                value={tempDateInput.day}
                                onChange={e => setTempDateInput({...tempDateInput, day: e.target.value.replace(/\D/g, '')})}
                                className="w-14 h-14 bg-black border-2 border-border rounded-xl text-center text-xl font-black text-white outline-none focus:border-primary transition-all shadow-lg"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <label className="text-[8px] font-black text-primary uppercase">Mês</label>
                              <input 
                                type="text" 
                                maxLength={2}
                                placeholder="MM"
                                value={tempDateInput.month}
                                onChange={e => setTempDateInput({...tempDateInput, month: e.target.value.replace(/\D/g, '')})}
                                className="w-14 h-14 bg-black border-2 border-border rounded-xl text-center text-xl font-black text-white outline-none focus:border-primary transition-all shadow-lg"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <label className="text-[8px] font-black text-primary uppercase">Ano</label>
                              <input 
                                type="text" 
                                maxLength={4}
                                placeholder="YYYY"
                                value={tempDateInput.year}
                                onChange={e => setTempDateInput({...tempDateInput, year: e.target.value.replace(/\D/g, '')})}
                                className="w-24 h-14 bg-black border-2 border-border rounded-xl text-center text-xl font-black text-white outline-none focus:border-primary transition-all shadow-lg"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 w-full px-4">
                            <Button onClick={() => setIsEditingDate(false)} variant="ghost" className="flex-1 text-[10px] font-black uppercase text-muted-foreground hover:bg-secondary/20">
                              Cancelar
                            </Button>
                            <Button onClick={handleApplyTypedDate} className="flex-1 bg-primary text-black font-black uppercase text-[10px] shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {weeksToComp !== null && (
                    <div className="relative overflow-hidden bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-8 text-center transition-all hover:bg-primary/10">
                      <div className="absolute -bottom-4 -right-4 p-4 opacity-10">
                        <Flame className="w-24 h-24 text-primary animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase block mb-3 tracking-widest opacity-80">Contagem Regressiva</span>
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-7xl font-black text-white tracking-tighter">
                          {weeksToComp < 0 ? 0 : weeksToComp}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-black text-primary tracking-tighter leading-none">SEM</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Restantes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!compDate && (
                    <div className="p-8 border-2 border-dashed border-border/50 rounded-[2rem] text-center bg-black/20 flex flex-col items-center gap-4">
                      <Skull className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wide">
                        Trace seu objetivo no calendário para que os deuses da força revelem seu plano de guerra.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="lg:col-span-2 bg-card/40 border-border/50 rounded-[2.5rem] shadow-2xl p-8 sm:p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                  <Target className="w-64 h-64" />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-border/50">
                  <h3 className="font-black text-white text-2xl uppercase tracking-tighter italic flex items-center gap-4">
                    <Sword className="text-accent w-8 h-8 not-italic drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> 
                    Trajetória de <span className="text-primary not-italic">Preparação</span>
                  </h3>
                  {compDate && (
                    <Badge className="bg-black border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest h-8 px-4 rounded-full">
                      Caminho Revelado
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-6 custom-scroll">
                  {trajectory.length === 0 ? (
                    <div className="text-center py-32 flex flex-col items-center gap-8 text-muted-foreground">
                      <div className="w-24 h-24 bg-secondary/30 rounded-[2.5rem] flex items-center justify-center border-4 border-dashed border-border/30 animate-pulse">
                        <Skull className="w-12 h-12 opacity-10" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-lg font-black uppercase tracking-widest text-white/40">O destino está oculto</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest max-w-xs mx-auto opacity-50">Defina a data do combate para visualizar o desdobramento da sua força.</p>
                      </div>
                    </div>
                  ) : (
                    trajectory.map((step, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-black/30 border-2 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center gap-8 group hover:border-primary transition-all relative overflow-hidden ${step.weeksLeft === 0 ? 'border-accent shadow-[0_0_40px_rgba(220,38,38,0.2)]' : 'border-border/50'}`}
                      >
                        {step.weeksLeft === 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent pointer-events-none" />
                        )}
                        
                        <div className="flex flex-col items-center justify-center min-w-[100px] h-[100px] bg-secondary/50 rounded-[2rem] border-2 border-border/50 shadow-xl group-hover:border-primary/50 transition-all">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Semana</span>
                          <span className="text-4xl font-black text-white group-hover:text-primary transition-colors">{step.weekNum}</span>
                        </div>

                        <div className="flex-1 space-y-3 text-center sm:text-left">
                          <div className={`text-[15px] font-black uppercase tracking-[0.15em] ${step.color} flex items-center justify-center sm:justify-start gap-3`}>
                            <span className="bg-current/10 p-2 rounded-xl">{step.icon}</span>
                            {step.phase}
                            {step.weeksLeft === 0 && (
                              <Badge className="bg-accent text-white border-none animate-bounce text-[9px] px-3 h-5 font-black uppercase tracking-tighter">É HOJE</Badge>
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground font-medium max-w-lg leading-relaxed">{step.description}</p>
                        </div>

                        <div className="text-right min-w-[100px] border-l border-border/30 pl-8 hidden sm:block">
                          <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1 tracking-widest">Status</span>
                          <span className={`text-2xl font-black tracking-tighter ${step.weeksLeft <= 4 && step.weeksLeft >= 0 ? 'text-accent' : 'text-white'}`}>
                            {step.weeksLeft < 0 ? 'CONCLUÍDO' : step.weeksLeft === 0 ? 'COMBATE' : `${step.weeksLeft} SEM`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="dashboard" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/40 border-border/50 rounded-[2rem] shadow-2xl p-8">
                <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><Dumbbell className="text-primary w-5 h-5" /> Recordes (1RM)</h3>
                <div className="space-y-6">
                  {Object.entries(data.maxes).map(([lift, val]) => (
                    <div key={lift} className="flex justify-between items-center group">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{lift}</span>
                      <div className="flex items-center gap-3">
                        <input type="number" value={val} onChange={e => save({...data, maxes: {...data.maxes, [lift]: parseInt(e.target.value) || 0}})} className="w-24 bg-black border border-border rounded-xl p-3 text-right font-black text-xl text-primary outline-none focus:border-primary transition-all" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-2 bg-card/40 border-border/50 rounded-[2rem] shadow-2xl p-8">
                <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] mb-12 flex items-center gap-3"><BarChart2 className="text-accent w-5 h-5" /> Tonelagem por Sessão (kg)</h3>
                <div className="h-60 flex items-end justify-around gap-4 px-4">
                  {data.workoutData.map(day => {
                    let vol = 0;
                    day.exercises.forEach(ex => {
                      const sets = getNumSets(ex.setsReps);
                      const w = calculateWeight(ex.liftType, ex.percent);
                      if (w) vol += w * sets;
                    });
                    const height = Math.min(100, (vol / 15000) * 100);
                    return (
                      <div key={day.id} className="flex-1 flex flex-col items-center group relative h-full">
                        <div className="w-full bg-primary/20 rounded-t-2xl transition-all duration-500 hover:bg-primary/40 relative" style={{ height: `${Math.max(10, height)}%` }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-primary/50 text-primary px-3 py-1 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all scale-75 group-hover:scale-100">{vol.toLocaleString()} KG</div>
                        </div>
                        <span className="text-[8px] font-black text-muted-foreground uppercase mt-4 tracking-tighter truncate w-full text-center">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="mt-8 pt-8 border-t border-border/30 flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-accent border-accent/30 hover:bg-accent/10 font-black uppercase text-[10px] h-10 px-6 rounded-xl">
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Todo Histórico de Treino
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white uppercase font-black">Apagar Histórico?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Isso removerá todas as cargas erguidas, RPEs, notas e séries concluídas de todas as semanas. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-black border-border text-white uppercase font-bold text-xs">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearTrainingHistory}
                      className="bg-accent hover:bg-accent/90 text-white uppercase font-bold text-xs"
                    >
                      Limpar Agora
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          {/* Mobilidade */}
          <TabsContent value="mobility" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-card/40 border border-border/50 p-8 rounded-[2rem] shadow-2xl flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex gap-3 items-center"><Activity className="text-accent w-6 h-6" /> Manutenção Viking</h2>
              {isCoachMode && <Button className="bg-primary text-black font-black uppercase text-[10px] h-10 px-6 rounded-xl"><Plus className="w-4 h-4 mr-2" /> Novo Ritual</Button>}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {data.mobilityList.map((item, idx) => (
                <div key={idx} className="bg-card/60 border border-border/50 p-6 rounded-3xl flex flex-col sm:flex-row gap-6 items-center hover:border-primary/30 transition-all">
                  <div className="flex-1 w-full">
                    <label className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Exercício</label>
                    <div className="text-lg font-black text-white uppercase">{item.name}</div>
                  </div>
                  <div className="w-full sm:w-1/4 text-center">
                    <label className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Protocolo</label>
                    <div className="text-lg font-black text-primary uppercase">{item.sets}</div>
                  </div>
                  <div className="flex gap-3">
                    {item.link && <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white h-12 w-12 p-0 rounded-2xl"><a href={item.link} target="_blank"><PlayCircle className="w-6 h-6" /></a></Button>}
                    {isCoachMode && (
                       <Button variant="outline" onClick={() => save({...data, mobilityList: data.mobilityList.filter((_, i) => i !== idx)})} className="border-border text-muted-foreground hover:text-accent hover:bg-accent/10 h-12 w-12 p-0 rounded-2xl"><Trash2 className="w-5 h-5" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Indicador de Status Estilo Viking */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-primary/30 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizado com o Valhalla</span>
        {lastSaved && <span className="text-[8px] text-muted-foreground font-bold">{lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
      </div>

      <ExerciseModal 
        isOpen={isExerciseModalOpen} 
        onClose={() => setIsExerciseModalOpen(false)} 
        onSelect={(name, video) => {
          if (!data) return;
          const newWorkout = [...data.workoutData];
          const day = newWorkout.find(d => d.id === modalTarget.dayId);
          if (day) {
            if (modalTarget.exIndex !== null) {
              day.exercises[modalTarget.exIndex].name = name;
              day.exercises[modalTarget.exIndex].link = video;
            } else {
              day.exercises.push({ 
                name, 
                link: video, 
                setsReps: "3x10", 
                percent: "", 
                liftType: name.toLowerCase().includes('squat') ? 'squat' : 
                          name.toLowerCase().includes('bench') ? 'bench' : 
                          name.toLowerCase().includes('deadlift') ? 'deadlift' : 'accessory',
                coachingNotes: ""
              });
            }
          }
          save({ ...data, workoutData: newWorkout });
          setIsExerciseModalOpen(false);
          toast({ title: "Treino Atualizado", description: "O novo exercício foi forjado!" });
        }}
      />
    </div>
  );
}
