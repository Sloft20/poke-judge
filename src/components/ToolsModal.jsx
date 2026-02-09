import React from 'react';
import { Briefcase, X, Shield, Zap, Move, Sparkles, Sword } from 'lucide-react';
import { TOOLS } from '../data/constants';

const ToolsModal = ({ onClose, onSelect }) => {
    
    // Função auxiliar para escolher o ícone baseado no tipo da ferramenta
    const getToolIcon = (type) => {
        switch(type) {
            case 'hp': return <Shield size={20} />;
            case 'retreat': return <Move size={20} />;
            case 'damage': return <Sword size={20} />;
            case 'attack': return <Zap size={20} />;
            default: return <Sparkles size={20} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Header Holográfico */}
                <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 animate-pulse"></div>
                    
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <span className="text-purple-400 bg-purple-900/20 p-2 rounded-lg border border-purple-500/30">
                                <Briefcase size={24} />
                            </span>
                            INVENTÁRIO TÁTICO
                        </h2>
                        <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-widest pl-1">
                            Selecione um item para acoplar
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="text-slate-500 hover:text-white hover:bg-purple-600/20 hover:border-purple-500 p-2 rounded-full border border-transparent transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Grid de Ferramentas */}
                <div className="p-6 bg-slate-900 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => onSelect(tool)}
                                className="group relative bg-slate-800/50 border border-slate-700 hover:border-purple-500 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] text-left"
                            >
                                {/* Ícone com brilho */}
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform group-hover:bg-purple-500 group-hover:text-white">
                                    {getToolIcon(tool.type)}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-200 uppercase text-sm group-hover:text-white transition-colors">
                                        {tool.name}
                                    </h4>
                                    <p className="text-xs text-purple-300 font-mono mt-0.5">
                                        {tool.effect}
                                    </p>
                                </div>

                                {/* Seta indicativa no hover */}
                                <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-purple-500">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-950 p-3 border-t border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Ferramentas concedem efeitos passivos ou novos ataques
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ToolsModal;