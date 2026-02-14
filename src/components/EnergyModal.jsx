import React from 'react';
import { X, Zap } from 'lucide-react';

// --- IMAGENS DAS CARTAS DE ENERGIA (Série Scarlet & Violet / Alta Resolução) ---
const ENERGY_CARDS = {
    'Grass': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_001_R_EN.png', 
        label: 'Planta', 
        color: 'text-green-700'
    },
    'Fire': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_002_R_EN.png', 
        label: 'Fogo', 
        color: 'text-red-700'
    },
    'Water': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_003_R_EN.png', 
        label: 'Água', 
        color: 'text-blue-700'
    },
    'Lightning': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_004_R_EN.png', 
        label: 'Elétrico', 
        color: 'text-yellow-600'
    },
    'Psychic': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_005_R_EN.png', 
        label: 'Psíquico', 
        color: 'text-purple-700'
    },
    'Fighting': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_006_R_EN.png', 
        label: 'Luta', 
        color: 'text-orange-700'
    },
    'Darkness': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_007_R_EN.png', 
        label: 'Escuridão', 
        color: 'text-slate-700'
    },
    'Metal': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVE/SVE_008_R_EN.png', 
        label: 'Metal', 
        color: 'text-gray-600'
    },
    'Dragon': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/ROS/ROS_097_R_EN.png', 
        label: 'Dragão', 
        color: 'text-amber-700'
    },
    'Fairy': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/TEU/TEU_172_R_EN.png', 
        label: 'Fada', 
        color: 'text-pink-600'
    },
    'Colorless': { 
        src: 'https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/SVI/SVI_196_R_EN.png', 
        label: 'Incolor', 
        color: 'text-slate-400'
    }
};

const EnergyModal = ({ onClose, onConfirm, pokemonName, currentEnergyCount }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Cabeçalho Clean */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
              <Zap size={24} className="text-yellow-500 fill-current" />
              Ligar Energias
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Alvo: <span className="text-blue-600">{pokemonName || 'Pokémon'}</span>
            </p>
          </div>

          {/* Contador Numérico */}
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Ligado</span>
             <div className="bg-slate-100 px-4 py-1 rounded-lg border border-slate-200 mt-1">
                <span className="text-2xl font-black text-blue-600 font-mono">
                    {currentEnergyCount.toString().padStart(2, '0')}
                </span>
             </div>
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 md:static text-slate-300 hover:text-slate-500 p-2 rounded-full hover:bg-slate-50 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Corpo: Grid de Cartas */}
        <div className="p-6 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {Object.entries(ENERGY_CARDS).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => onConfirm({ name: data.label, type: key })}
                        className="group relative flex flex-col items-center focus:outline-none"
                    >
                        {/* A Carta (Container com Proporção Vertical) */}
                        <div className="relative w-full aspect-[2.5/3.5] rounded-lg shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 bg-white p-1 border border-slate-200 group-active:scale-95">
                             <img 
                                src={data.src} 
                                alt={data.label} 
                                className="w-full h-full object-cover rounded"
                                loading="lazy"
                             />
                             {/* Flash Branco ao clicar */}
                             <div className="absolute inset-0 bg-white/50 opacity-0 group-active:opacity-100 transition-opacity rounded pointer-events-none"></div>
                        </div>
                        
                        {/* Nome da Energia */}
                        <span className={`mt-2 text-[10px] font-black uppercase tracking-widest ${data.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
                            {data.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Footer */}
        <div className="bg-white p-4 border-t border-slate-100 flex justify-between items-center z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Clique nas cartas para adicionar
            </p>
            <button 
                onClick={onClose}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
                Concluir
            </button>
        </div>
      </div>
    </div>
  );
};

export default EnergyModal;
