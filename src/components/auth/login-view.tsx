
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, User, ShieldCheck, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getDatabase } from '@/lib/store';

interface LoginViewProps {
  onLogin: (role: 'athlete' | 'coach', name?: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'athlete' | 'coach'>('athlete');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleAthleteLogin = () => {
    if (!name || !password) {
      toast({ title: "Erro", description: "Preencha o nome e a palavra-passe.", variant: "destructive" });
      return;
    }
    const db = getDatabase();
    if (db[name] && db[name].password && db[name].password !== password) {
      toast({ title: "Erro", description: "Palavra-passe incorreta.", variant: "destructive" });
      return;
    }
    onLogin('athlete', name);
  };

  const handleCoachLogin = () => {
    if (password === "3636") {
      onLogin('coach');
    } else {
      toast({ title: "Erro", description: "Palavra-passe incorreta.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden w-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] z-0 pointer-events-none" />

      <div className="bg-card/90 p-8 sm:p-10 rounded-3xl shadow-2xl border border-border w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-5 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Zap className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Powerlift <span className="text-primary">Pro</span></h1>
        </div>

        <div className="flex bg-black rounded-xl p-1 mb-8 border border-border">
          <button 
            onClick={() => setTab('athlete')} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'athlete' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            <User className="w-4 h-4" /> Atleta
          </button>
          <button 
            onClick={() => setTab('coach')} 
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'coach' ? 'bg-accent text-accent-foreground shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Treinador
          </button>
        </div>

        <div className="min-h-[160px]">
          {tab === 'athlete' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-black/50 p-5 rounded-2xl border border-border focus-within:border-primary/50 transition-colors">
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Nome do Atleta</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Insira o nome" 
                  className="w-full bg-transparent outline-none text-white font-semibold placeholder-muted-foreground border-b border-border focus:border-primary pb-2 transition-colors mb-4" 
                />
                
                <label className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Palavra-passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha" 
                  className="w-full bg-transparent outline-none text-white font-semibold placeholder-muted-foreground border-b border-border focus:border-primary pb-2 transition-colors" 
                />
              </div>
              <Button 
                onClick={handleAthleteLogin}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wide py-6 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                <LogIn className="w-5 h-5 mr-2" /> Entrar
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-black/50 p-5 rounded-2xl border border-border focus-within:border-accent/50 transition-colors">
                <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-3 block">Senha do Treinador</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="***" 
                  className="w-full bg-transparent outline-none text-white font-semibold placeholder-muted-foreground border-b border-border focus:border-accent pb-2 transition-colors" 
                />
              </div>
              <Button 
                onClick={handleCoachLogin}
                className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-black uppercase tracking-wide py-6 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                <ShieldCheck className="w-5 h-5 mr-2" /> Aceder Portal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
