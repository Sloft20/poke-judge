import React from 'react';
import { X, Zap } from 'lucide-react';

// --- IMAGENS OFICIAIS DAS ENERGIAS (Alta Qualidade) ---
const ENERGY_IMAGES_LARGE = {
    'Fire': { src: 'https://archives.bulbagarden.net/media/upload/thumb/a/ad/Fire-attack.png/60px-Fire-attack.png', label: 'Fogo', color: 'text-red-500' },
    'Water': { src: 'https://archives.bulbagarden.net/media/upload/thumb/1/11/Water-attack.png/60px-Water-attack.png', label: 'Água', color: 'text-blue-500' },
    'Grass': { src: 'https://archives.bulbagarden.net/media/upload/thumb/2/2e/Grass-attack.png/60px-Grass-attack.png', label: 'Planta', color: 'text-green-500' },
    'Lightning': { src: 'https://archives.bulbagarden.net/media/upload/thumb/0/04/Lightning-attack.png/60px-Lightning-attack.png', label: 'Elétrico', color: 'text-yellow-500' },
    'Psychic': { src: 'https://archives.bulbagarden.net/media/upload/thumb/e/ef/Psychic-attack.png/60px-Psychic-attack.png', label: 'Psíquico', color: 'text-purple-500' },
    'Fighting': { src: 'https://archives.bulbagarden.net/media/upload/thumb/4/4c/Fighting-attack.png/60px-Fighting-attack.png', label: 'Luta', color: 'text-orange-600' },
    'Darkness': { src: 'https://archives.bulbagarden.net/media/upload/thumb/8/8f/Darkness-attack.png/60px-Darkness-attack.png', label: 'Escuridão', color: 'text-slate-400' },
    'Metal': { src: 'https://archives.bulbagarden.net/media/upload/thumb/f/f1/Metal-attack.png/60px-Metal-attack.png', label: 'Metal', color: 'text-gray-300' },
    'Dragon': { src: 'https://archives.bulbagarden.net/media/upload/thumb/d/d7/Dragon-attack.png/60px-Dragon-attack.png', label: 'Dragão', color: 'text-yellow-600' },
    'Fairy': { src: 'https://archives.bulbagarden.net/media/upload/thumb/c/c3/Fairy-attack.png/60px-Fairy-attack.png', label: 'Fada', color: 'text-pink-400' },
    'Colorless': { src: 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/60px-Colorless-attack.png', label: 'Incolor', color: 'text-white' }
};

const EnergyModal = ({ onClose, onConfirm, pokemonName, currentEnergyCount }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Botão Fechar (Posicionado Absolutamente para estilo limpo) */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-10"
        >
            <X size={24} />
        </button>

        {/* Cabeçalho */}
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
              Alvo: <span className="text-cyan-400 font-bold text-sm">{pokemonName || 'Pokémon'}</span>
            </p>
          </div>
        </div>

        {/* Corpo com Grid de Energias (IMAGENS REAIS) */}
        <div className="p-6 bg-slate-900 relative">
            
            {/* Indicador de Energias Atuais */}
            <div className="mb-6 flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Atual:</span>
                <div className="flex gap-1">
                    {currentEnergyCount > 0 ? (
                        Array.from({ length: Math.min(10, currentEnergyCount) }).map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
                        ))
                    ) : (
                        <span className="text-xs text-slate-600 italic">Nenhuma energia</span>
                    )}
                </div>
            </div>

            {/* GRID DAS IMAGENS */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Object.entries(ENERGY_IMAGES_LARGE).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => {
                            // Envia o objeto com a propriedade 'name' que seu sistema espera
                            onConfirm({ name: data.label, type: key });
                        }}
                        className="group relative flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-white/30 hover:scale-105 hover:shadow-lg hover:shadow-black/50 transition-all duration-200"
                    >
                        {/* Imagem da Energia (Grande e com efeito de brilho) */}
                        <div className="relative w-12 h-12 mb-2 transition-transform group-hover:scale-110 duration-300">
                             <img 
                                src={data.src} 
                                alt={data.label} 
                                className="w-full h-full object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                             />
                        </div>
                        
                        {/* Nome da Energia */}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${data.color}`}>
                            {data.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">
                Selecione o Tipo de energia
            </span>
        </div>
      </div>
    </div>
  );
};

export default EnergyModal;