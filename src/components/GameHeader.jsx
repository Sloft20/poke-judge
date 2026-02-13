import React from 'react';
import { Shield, Clock, Play, Pause, Coins, BarChart2, BookOpen, Edit3, Zap, Activity, FileText } from 'lucide-react';
import { PHASES } from '../data/constants';

const GameHeader = ({ 
    gameState, 
    gameTimer, 
    isTimerPaused, 
    onToggleTimer, 
    onCoinFlip, 
    onOpenDeckManager, 
    onOpenRanking, 
    onOpenRules,
    showSidebar,       // Nova prop
    onToggleSidebar    // Nova prop
}) => {
    
    // Formata o tempo (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <header className="bg-slate-950 border-b border-slate-800 shadow-2xl relative z-50">
            {/* Linha de brilho superior */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

            <div className="max-w-[1920px] mx-auto px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-4">
                
                {/* --- BLOCO 1: LOGO E VERSÃO --- */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
                        <Shield className="text-cyan-400 relative z-10" size={36} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 filter drop-shadow-sm">
                            PokéJudge Pro
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase border border-slate-800 px-1.5 rounded bg-slate-900">
                                Sys. v2.5
                            </span>
                            <button 
                                onClick={onOpenDeckManager} 
                                className="text-[10px] font-bold text-cyan-600 hover:text-cyan-400 flex items-center gap-1 transition-colors hover:underline decoration-cyan-500/30"
                            >
                                <Edit3 size={10}/> Gerenciar Decks
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- BLOCO 2: HUD CENTRAL (TIMER E FASE) --- */}
                <div className="flex items-center gap-6 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/60 backdrop-blur-md">
                    
                    {/* Timer Digital */}
                    <div className="flex items-center gap-3 px-4 py-1 border-r border-slate-800">
                        <div className={`p-1.5 rounded-full ${isTimerPaused ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500 animate-pulse'}`}>
                            <Clock size={18} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className={`font-mono text-2xl font-black tracking-widest leading-none ${isTimerPaused ? 'text-slate-400' : 'text-white'}`}>
                                {formatTime(gameTimer)}
                            </span>
                            <button 
                                onClick={onToggleTimer} 
                                className="text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                {isTimerPaused ? <><Play size={8} fill="currentColor"/> Retomar</> : <><Pause size={8} fill="currentColor"/> Pausar</>}
                            </button>
                        </div>
                    </div>

                    {/* Indicador de Fase */}
                    <div className="px-2 flex flex-col items-center min-w-[100px]">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">
                            Status
                        </span>
                        <div className={`
                            px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(0,0,0,0.3)]
                            ${gameState.phase === PHASES.SETUP ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 
                              gameState.phase === PHASES.ATTACK ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                              'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}
                        `}>
                            <Activity size={12} className={!isTimerPaused ? 'animate-pulse' : ''}/>
                            {gameState.phase}
                        </div>
                    </div>
                </div>

                {/* --- BLOCO 3: FERRAMENTAS (DIREITA) --- */}
                <div className="flex items-center gap-2">
                    
                    {/* Botão de Moeda */}
                    <button 
                        onClick={onCoinFlip}
                        className="group relative px-4 py-2 bg-slate-900 hover:bg-yellow-950/30 border border-slate-700 hover:border-yellow-500/50 rounded-lg text-slate-300 hover:text-yellow-400 transition-all duration-300 overflow-hidden"
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            <Coins size={16} className="group-hover:rotate-12 transition-transform"/>
                            <span className="text-xs font-bold uppercase">Moeda</span>
                        </div>
                        <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-md"></div>
                    </button>

                    {/* Botão de Ranking */}
                    <button 
                        onClick={onOpenRanking}
                        className="group relative px-4 py-2 bg-slate-900 hover:bg-purple-950/30 border border-slate-700 hover:border-purple-500/50 rounded-lg text-slate-300 hover:text-purple-400 transition-all duration-300"
                    >
                         <div className="flex items-center gap-2 relative z-10">
                            <BarChart2 size={16} />
                            <span className="text-xs font-bold uppercase">Rank</span>
                        </div>
                    </button>

                    {/* Botão de Regras */}
                    <button 
                        onClick={onOpenRules}
                        className="group relative px-4 py-2 bg-slate-900 hover:bg-blue-950/30 border border-slate-700 hover:border-blue-500/50 rounded-lg text-slate-300 hover:text-blue-400 transition-all duration-300"
                    >
                         <div className="flex items-center gap-2 relative z-10">
                            <BookOpen size={16} />
                            <span className="text-xs font-bold uppercase">Regras</span>
                        </div>
                    </button>

                    {/* NOVO: Botão de Log (Sidebar Toggle) */}
                    <button 
                        onClick={onToggleSidebar}
                        className={`
                            group relative px-4 py-2 rounded-lg text-slate-300 transition-all duration-300 border
                            ${showSidebar 
                                ? 'bg-slate-800 text-white border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                : 'bg-slate-900 border-slate-700 hover:bg-emerald-950/30 hover:border-emerald-500/50 hover:text-emerald-400'}
                        `}
                    >
                         <div className="flex items-center gap-2 relative z-10">
                            <FileText size={16} />
                            <span className="text-xs font-bold uppercase">
                                {showSidebar ? 'Ocultar Log' : 'Ver Log'}
                            </span>
                        </div>
                    </button>
                </div>
                                
            </div>
        </header>
    );
};

export default GameHeader;