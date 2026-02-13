import React from 'react';
import { X, Zap } from 'lucide-react';

// --- IMAGENS OFICIAIS (Mesmas do restante do App) ---
const ENERGY_IMAGES_LARGE = {
    'Fire': { src: 'https://archives.bulbagarden.net/media/upload/thumb/a/ad/Fire-attack.png/60px-Fire-attack.png', label: 'Fogo', color: 'text-red-600', bg: 'hover:bg-red-50 hover:border-red-200' },
    'Water': { src: 'https://archives.bulbagarden.net/media/upload/thumb/1/11/Water-attack.png/60px-Water-attack.png', label: 'Água', color: 'text-blue-600', bg: 'hover:bg-blue-50 hover:border-blue-200' },
    'Grass': { src: 'https://archives.bulbagarden.net/media/upload/thumb/2/2e/Grass-attack.png/60px-Grass-attack.png', label: 'Planta', color: 'text-green-600', bg: 'hover:bg-green-50 hover:border-green-200' },
    'Lightning': { src: 'https://archives.bulbagarden.net/media/upload/thumb/0/04/Lightning-attack.png/60px-Lightning-attack.png', label: 'Elétrico', color: 'text-yellow-600', bg: 'hover:bg-yellow-50 hover:border-yellow-200' },
    'Psychic': { src: 'https://archives.bulbagarden.net/media/upload/thumb/e/ef/Psychic-attack.png/60px-Psychic-attack.png', label: 'Psíquico', color: 'text-purple-600', bg: 'hover:bg-purple-50 hover:border-purple-200' },
    'Fighting': { src: 'https://archives.bulbagarden.net/media/upload/thumb/4/4c/Fighting-attack.png/60px-Fighting-attack.png', label: 'Luta', color: 'text-orange-700', bg: 'hover:bg-orange-50 hover:border-orange-200' },
    'Darkness': { src: 'https://archives.bulbagarden.net/media/upload/thumb/8/8f/Darkness-attack.png/60px-Darkness-attack.png', label: 'Escuridão', color: 'text-slate-700', bg: 'hover:bg-slate-100 hover:border-slate-300' },
    'Metal': { src: 'https://archives.bulbagarden.net/media/upload/thumb/f/f1/Metal-attack.png/60px-Metal-attack.png', label: 'Metal', color: 'text-gray-500', bg: 'hover:bg-gray-100 hover:border-gray-300' },
    'Dragon': { src: 'https://archives.bulbagarden.net/media/upload/thumb/d/d7/Dragon-attack.png/60px-Dragon-attack.png', label: 'Dragão', color: 'text-yellow-700', bg: 'hover:bg-amber-50 hover:border-amber-200' },
    'Fairy': { src: 'https://archives.bulbagarden.net/media/upload/thumb/c/c3/Fairy-attack.png/60px-Fairy-attack.png', label: 'Fada', color: 'text-pink-500', bg: 'hover:bg-pink-50 hover:border-pink-200' },
    'Colorless': { src: 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/60px-Colorless-attack.png', label: 'Incolor', color: 'text-slate-400', bg: 'hover:bg-slate-50 hover:border-slate-200' }
};

const EnergyModal = ({ onClose, onConfirm, pokemonName, currentEnergyCount }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Cabeçalho Clean */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
              <Zap size={20} className="text-yellow-500 fill-current" />
              Ligar Energia
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Alvo: <span className="text-blue-500">{pokemonName || 'Pokémon'}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 p-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo Clean */}
        <div className="p-6 bg-white">
            
            {/* Indicador de Energias Atuais (Barra Sutil) */}
            <div className="mb-6 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Atual</span>
                <div className="flex gap-1">
                    {currentEnergyCount > 0 ? (
                        Array.from({ length: Math.min(10, currentEnergyCount) }).map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm"></div>
                        ))
                    ) : (
                        <span className="text-[10px] text-slate-400 italic">Vazio</span>
                    )}
                </div>
            </div>

            {/* GRID CLEAN & COMPACTO */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {Object.entries(ENERGY_IMAGES_LARGE).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => {
                            // Envia o objeto com a propriedade 'name' que seu sistema espera
                            onConfirm({ name: data.label, type: key });
                            onClose(); // Fecha após selecionar (opcional, mas comum em design clean)
                        }}
                        className={`
                            group flex flex-col items-center justify-center p-3 rounded-xl border border-transparent transition-all duration-200
                            bg-white hover:shadow-md hover:-translate-y-0.5 border-slate-50
                            ${data.bg}
                        `}
                    >
                        {/* Imagem da Energia */}
                        <div className="relative w-8 h-8 mb-2 transition-transform group-hover:scale-110 duration-300">
                             <img 
                                src={data.src} 
                                alt={data.label} 
                                className="w-full h-full object-contain drop-shadow-sm"
                             />
                        </div>
                        
                        {/* Nome da Energia */}
                        <span className={`text-[9px] font-black uppercase tracking-wider ${data.color}`}>
                            {data.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Footer Minimalista */}
        <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                Selecione uma esfera
            </span>
        </div>
      </div>
    </div>
  );
};

export default EnergyModal;