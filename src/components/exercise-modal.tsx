
"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube, Plus, X, ChevronRight, Database as DbIcon, Sparkles } from 'lucide-react';
import { EXERCISE_CATEGORIES } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string, video?: string) => void;
}

export function ExerciseModal({ isOpen, onClose, onSelect }: ExerciseModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customLink, setCustomLink] = useState('');

  const filteredCategories = useMemo(() => {
    return Object.entries(EXERCISE_CATEGORIES).map(([cat, exercises]) => {
      const filtered = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { cat, exercises: filtered };
    }).filter(c => c.exercises.length > 0);
  }, [searchTerm]);

  const totalExercises = useMemo(() => {
    return Object.values(EXERCISE_CATEGORIES).flat().length;
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-black border-border shadow-2xl">
        <DialogHeader className="p-6 border-b border-border bg-card">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              <DbIcon className="text-primary w-6 h-6" /> Banco de Dados
            </DialogTitle>
            <Badge variant="outline" className="border-primary/50 text-primary text-[10px] font-black">
              {totalExercises} EXERCÍCIOS
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-4 border-b border-border bg-black space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para buscar (ex: Squat, Bench, Remada...)" 
              className="pl-12 h-14 bg-secondary border-border rounded-xl focus:ring-primary font-bold text-lg placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <div className="flex gap-4 items-center">
            <Button 
              variant="link" 
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="p-0 h-auto text-[10px] font-black text-accent hover:text-red-400 uppercase tracking-widest flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> {showCustomForm ? 'Cancelar' : 'Adicionar Manual'}
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-[10px] font-black text-muted-foreground uppercase">Atalhos: Squat, Bench, Deadlift</span>
          </div>
          
          {showCustomForm && (
            <div className="mt-3 bg-secondary p-5 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-primary uppercase ml-1">Nome</label>
                  <Input 
                    placeholder="Nome do exercício" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-black border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-primary uppercase ml-1">Link Vídeo</label>
                  <Input 
                    placeholder="YouTube URL" 
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="bg-black border-border"
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (customName) onSelect(customName, customLink);
                  setCustomName(''); setCustomLink(''); setShowCustomForm(false);
                }}
                disabled={!customName}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase py-6 rounded-xl"
              >
                Incluir no Treino
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-4">
          {filteredCategories.length > 0 ? (
            <Accordion type="multiple" className="space-y-3" defaultValue={searchTerm ? filteredCategories.map(c => c.cat) : []}>
              {filteredCategories.map(({ cat, exercises }) => (
                <AccordionItem value={cat} key={cat} className="border border-border rounded-2xl bg-card overflow-hidden">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">{cat}</span>
                      <Badge className="bg-black border-border text-[9px]">{exercises.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                      {exercises.map((ex, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => onSelect(ex.name, ex.video)}
                          className="flex justify-between items-center p-4 bg-black border border-border/50 rounded-xl group hover:border-primary hover:bg-secondary/30 transition-all cursor-pointer"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-sm font-bold text-white block truncate group-hover:text-primary transition-colors">{ex.name}</span>
                            {ex.video && (
                              <div className="flex items-center gap-1 mt-1">
                                <Youtube className="w-3 h-3 text-accent" />
                                <span className="text-[9px] text-muted-foreground font-bold">Tutorial disponível</span>
                              </div>
                            )}
                          </div>
                          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="p-6 bg-secondary rounded-full border border-border">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-black uppercase text-xs">Nenhum exercício encontrado para "{searchTerm}"</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Tente usar termos mais genéricos ou adicione manualmente.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
