import React, { useEffect, useRef } from 'react';
import { History, AlertTriangle, Terminal, Download, Zap, Shield, Sparkles, Activity } from 'lucide-react';

const GameLog = ({ logs, onAddLog, onDownload, currentPlayer, onUpdatePlayer, currentPlayerIndex }) => {
    const logsContainerRef = useRef(null);

    // Auto-scroll para o final sempre que chegar um log novo
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Função para definir a cor da linha baseado no tipo de log
    const getLogStyle = (level) => {
        switch (level) {
            case 'CRIT': return 'text-red-400 border-l-2 border-red-500 bg-red-950/30';
            case 'WARN': return 'text-yellow-400 border-l-2 border-yellow-500 bg-yellow-950/30';
            case 'RULE': return 'text-purple-400 border-l-2 border-purple-500 bg-purple-950/30';
            case 'SUCCESS': return 'text-green-400 border-l-2 border-green-500 bg-green-950/30';
            case 'PRIZE': return 'text-yellow-200 border-l-2 border-yellow-200 bg-yellow-900/20';
            default: return 'text-blue-300 border-l-2 border-blue-500/50 hover:bg-slate-800/50';
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            
            {/* --- TERMINAL DE LOGS --- */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative">
                
                {/* Header do Terminal */}
                <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-green-500 animate-pulse"/>
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                            SYSTEM_LOG // V.2.5
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                </div>

                {/* Área de Scroll (Logs) */}
                <div 
                    ref={logsContainerRef} 
                    className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs custom-scrollbar bg-slate-950"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {logs.length === 0 && (
                        <div className="text-slate-600 italic text-center mt-10 opacity-50">
                             Aguardando entrada de dados...
                        </div>
                    )}
                    
                    {logs.map((log) => (
                        <div key={log.id} className={`p-2 rounded-r mb-1 transition-all animate-in fade-in slide-in-from-left-2 ${getLogStyle(log.level)}`}>
                            <div className="flex justify-between opacity-50 text-[10px] mb-0.5 font-bold">
                                <span>[{log.time}]</span>
                                {log.level !== 'INFO' && <span>{log.level}</span>}
                            </div>
                            <div className="leading-tight break-words">
                                 {log.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Decorativo */}
                <div className="bg-slate-900 p-1 border-t border-slate-800 flex justify-between items-center px-3">
                    <span className="text-[9px] text-green-500/50 animate-pulse">● ONLINE</span>
                    <span className="text-[9px] text-slate-600 font-mono">SECURE CONNECTION</span>
                </div>
            </div>

            {/* --- PAINEL DE CONTROLE DO JUIZ --- */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-500"/> 
                    Controles de Arbitragem
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                    {/* Botões de Penalidade */}
                    <button 
                        onClick={() => onAddLog('Aviso: Jogo Lento (Slow Play).', 'WARN')}
                        className="bg-slate-800 hover:bg-yellow-900/30 hover:border-yellow-600 text-slate-300 hover:text-yellow-400 border border-slate-700 rounded p-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                    >
                        <Activity size={12}/> Slow Play
                    </button>
                    
                    <button 
                        onClick={() => onAddLog('Erro de Procedimento Menor.', 'WARN')}
                        className="bg-slate-800 hover:bg-orange-900/30 hover:border-orange-600 text-slate-300 hover:text-orange-400 border border-slate-700 rounded p-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={12}/> Erro Menor
                    </button>

                    {/* Botões de Regra (Toggle) */}
                    <button 
                        onClick={() => {
                            onUpdatePlayer(currentPlayerIndex, { allowUnlimitedEnergy: !currentPlayer.allowUnlimitedEnergy });
                            onAddLog(`${!currentPlayer.allowUnlimitedEnergy ? 'LIBEROU' : 'BLOQUEOU'} Energia Ilimitada.`, 'RULE');
                        }}
                        className={`col-span-1 border rounded p-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                            currentPlayer.allowUnlimitedEnergy 
                            ? 'bg-green-900/20 border-green-500 text-green-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Zap size={12} fill={currentPlayer.allowUnlimitedEnergy ? "currentColor" : "none"}/>
                        {currentPlayer.allowUnlimitedEnergy ? "Energia: ∞" : "Energia: 1"}
                    </button>

                    <button 
                        onClick={() => {
                            onUpdatePlayer(currentPlayerIndex, { allowRareCandy: !currentPlayer.allowRareCandy });
                            onAddLog(`${!currentPlayer.allowRareCandy ? 'ATIVOU' : 'DESATIVOU'} Modo Rare Candy.`, 'RULE');
                        }}
                        className={`col-span-1 border rounded p-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                            currentPlayer.allowRareCandy 
                            ? 'bg-blue-900/20 border-blue-500 text-blue-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Sparkles size={12}/>
                        {currentPlayer.allowRareCandy ? "Candy: ON" : "Candy: OFF"}
                    </button>

                    {/* Botão de Exportar */}
                    <button 
                        onClick={onDownload}
                        className="col-span-2 mt-1 bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-white border border-slate-800 rounded p-2 text-[10px] font-mono uppercase flex items-center justify-center gap-2 transition-all"
                    >
                        <Download size={12}/> Exportar Log (.txt)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameLog;