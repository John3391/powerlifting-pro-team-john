
"use client";

import React, { useState } from 'react';
import { Users, LogOut, Download, Upload, Trash2, ArrowRight, ShieldCheck, Database as DbIcon, AlertOctagon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getDatabase, saveToDatabase } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CoachDashboardProps {
  onViewAthlete: (name: string) => void;
  onLogout: () => void;
}

export function CoachDashboard({ onViewAthlete, onLogout }: CoachDashboardProps) {
  const { toast } = useToast();
  const [db, setDb] = useState(getDatabase());
  const athletes = Object.keys(db).sort((a, b) => a.localeCompare(b));

  const handleDelete = (name: string) => {
    const newDb = { ...db };
    delete newDb[name];
    localStorage.setItem('powerliftPro_AthletesDB', JSON.stringify(newDb));
    setDb(newDb);
    toast({ 
      title: "Atleta Removido", 
      description: `O perfil de ${name} foi excluído permanentemente.`, 
      variant: "destructive" 
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `PowerliftPro_BD_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    toast({ title: "Sucesso", description: "Base de dados exportada!" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        localStorage.setItem('powerliftPro_AthletesDB', JSON.stringify(imported));
        setDb(imported);
        toast({ title: "Sucesso", description: "Base de dados restaurada!" });
      } catch (err) {
        toast({ title: "Erro", description: "Ficheiro inválido.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent" />
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">Portal <span className="text-accent">Treinador</span></h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="border-border bg-black text-muted-foreground hover:text-white gap-2 rounded-full font-black text-[10px] uppercase">
            <LogOut className="w-3.5 h-3.5" /> SAIR
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-primary uppercase">
          <Users className="w-5 h-5" /> Atletas ({athletes.length})
        </h2>

        {athletes.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <Users className="mx-auto text-muted-foreground/30 mb-4 w-16 h-16" />
            <p className="text-muted-foreground font-bold uppercase text-xs">Nenhum atleta cadastrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {athletes.map(name => (
              <div 
                key={name} 
                className="bg-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center border border-border hover:border-primary/50 transition-all group"
              >
                <div 
                  onClick={() => onViewAthlete(name)}
                  className="flex items-center gap-4 mb-4 sm:mb-0 cursor-pointer flex-1"
                >
                  <div className="w-14 h-14 bg-black border border-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-inner uppercase group-hover:border-primary transition-colors">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-black text-lg text-white block uppercase tracking-wide group-hover:text-primary transition-colors">{name}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{db[name].numWeeks || 0} Semanas de Treino</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50">
                  <div className="text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-black block tracking-tighter">Squat 1RM</span>
                    <span className="text-white font-black text-lg">{db[name].maxes?.squat || 0} <span className="text-[10px] text-muted-foreground">kg</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white uppercase font-black">Excluir Atleta?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Esta ação é irreversível. Todos os treinos, históricos e cargas de <strong>{name}</strong> serão apagados permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-black border-border text-white hover:bg-secondary uppercase font-bold text-xs">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(name)}
                            className="bg-accent hover:bg-accent/90 text-white uppercase font-bold text-xs"
                          >
                            Excluir Permanentemente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                      onClick={() => onViewAthlete(name)}
                      className="bg-primary/10 text-primary p-0 h-10 w-10 rounded-xl hover:bg-primary hover:text-black transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card p-6 rounded-3xl border border-border mt-10 shadow-2xl">
          <h3 className="font-black text-sm text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <DbIcon className="text-accent w-4 h-4" /> Gestão de Dados
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-black gap-2 font-black uppercase text-[10px] h-11 px-6 rounded-xl shadow-lg">
              <Download className="w-4 h-4" /> Exportar Backup
            </Button>
            <label className="cursor-pointer">
              <div className="bg-secondary hover:bg-secondary/80 text-white px-6 h-11 flex items-center gap-2 rounded-xl border border-border text-[10px] font-black uppercase transition-all shadow-lg">
                <Upload className="w-4 h-4" /> Importar Backup
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <div className="flex-1" />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-accent hover:text-white border-accent/30 hover:bg-accent gap-2 font-black uppercase text-[10px] h-11 px-6 rounded-xl"
                >
                  <AlertOctagon className="w-4 h-4" /> Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white uppercase font-black">Reset Total da Base de Dados?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    CUIDADO: Isso apagará TODOS os atletas e configurações. Você perderá tudo se não tiver um backup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-black border-border text-white hover:bg-secondary uppercase font-bold text-xs">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      localStorage.removeItem('powerliftPro_AthletesDB');
                      window.location.reload();
                    }}
                    className="bg-accent hover:bg-accent/90 text-white uppercase font-bold text-xs"
                  >
                    Resetar Agora
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
