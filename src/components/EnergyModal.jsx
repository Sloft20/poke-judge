import React from 'react';
import { X, Zap, Circle } from 'lucide-react';
import { ENERGY_TYPES } from '../data/constants';
import { Card } from './UI'; // Reaproveitando seu UI base, mas vamos customizar classes

const EnergyModal = ({ onClose, onConfirm, pokemonName, currentEnergyCount }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabeçalho Sci-Fi */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative overflow-hidden">
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse"></div>
          
          <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <div className="bg-yellow-500 text-black p-2 rounded-lg shadow-lg shadow-yellow-500/50">
                <Zap size={24} fill="currentColor" />
              </div>
              Ligando Energias
            </h2>
            <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-widest">
              Selecionar Tipo de Energia: <span className="text-cyan-400 font-bold text-sm">{pokemonName || 'Pokémon Desconhecido'}</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white hover:bg-red-500/20 hover:border-red-500 p-2 rounded-full border border-transparent transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo com Grid de Energias */}
        <div className="p-6 bg-slate-900 relative">
            {/* Status Atual */}
            <div className="mb-6 flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="flex gap-1">
                    {Array.from({ length: currentEnergyCount }).map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                    ))}
                    {currentEnergyCount === 0 && <span className="text-xs text-slate-500 italic">Nenhuma energia ligada.</span>}
                </div>
                <div className="ml-auto text-xs font-bold text-slate-500 uppercase">Total no Pokémon: {currentEnergyCount}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(ENERGY_TYPES).map(([key, val]) => {
                    // Recupera o ícone do constants ou usa um padrão
                    const IconComponent = val.icon || Circle;
                    
                    return (
                        <button
                            key={key}
                            onClick={() => onConfirm(val)}
                            className={`
                                relative group overflow-hidden rounded-xl p-4 border border-slate-700 
                                hover:border-white/40 transition-all duration-300
                                flex flex-col items-center justify-center gap-3
                                ${val.gradient ? val.gradient : 'bg-slate-800'}
                            `}
                        >
                            {/* Overlay escuro que some no hover para revelar o gradiente puro */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>

                            {/* Conteúdo */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`p-2 rounded-full bg-black/30 backdrop-blur-md shadow-inner mb-1 text-white group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComponent size={24} />
                                </div>
                                <span className="font-black text-sm uppercase tracking-wider text-white drop-shadow-md">
                                    {val.name}
                                </span>
                            </div>

                            {/* Brilho no Hover */}
                            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/50 rounded-xl transition-all duration-300"></div>
                        </button>
                    );
                })}
            </div>
        </div>
        
        {/* Footer Informativo */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono">
                Selecionar Tipo de Energia
            </span>
        </div>
      </div>
    </div>
  );
};

export default EnergyModal;