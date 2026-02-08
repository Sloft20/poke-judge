// src/components/PokemonCard.jsx
import React from 'react';
import { Circle, Briefcase, PlusCircle, Star, Skull, Flame, EyeOff } from 'lucide-react'; 
import { ENERGY_TYPES, CONDITIONS } from '../data/constants';

// Pequeno componente auxiliar (Barra de Vida)
const HPBar = ({ current, max }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    let colorClass = 'bg-green-500';
    if (percentage < 50) colorClass = 'bg-yellow-500';
    if (percentage < 20) colorClass = 'bg-red-600 animate-pulse';

    return (
        <div className="w-full h-3 bg-gray-200 rounded-full mt-1 overflow-hidden border border-gray-400 relative">
            <div 
                className={`h-full transition-all duration-500 ease-out ${colorClass}`} 
                style={{ width: `${percentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black drop-shadow-sm">
                {current}/{max}
            </div>
        </div>
    );
};

// Componente Principal
const PokemonCard = ({ card, actions, small = false, onClick, className = '' }) => {
  if (!card) return null;

  const TypeIcon = ENERGY_TYPES[card.type]?.icon || Circle;
  const cardBackground = ENERGY_TYPES[card.type]?.gradient || 'bg-gray-300';
  const typeText = ENERGY_TYPES[card.type]?.text || 'text-black';
  const imageUrl = card.image || card.images?.small;

  let maxHP = card.hp || 0;
  let retreatCost = card.retreat || 0;
  
  // Processa ferramentas (Tools)
  if (card.attachedTool) {
      if (card.attachedTool.type === 'hp' && card.attachedTool.condition(card)) {
          maxHP += card.attachedTool.value;
      }
      if (card.attachedTool.type === 'retreat') {
          retreatCost = Math.max(0, retreatCost + card.attachedTool.value);
      }
  }

  const currentDamage = card.damage || 0;
  const currentHP = Math.max(0, maxHP - currentDamage);
  
  const isEx = card.name?.toLowerCase().includes('ex') || card.name?.toLowerCase().includes(' v');
  const borderClass = isEx ? 'border-gray-400 ring-2 ring-gray-300' : 'border-yellow-400 ring-2 ring-yellow-400';

  // --- LÓGICA VISUAL DE STATUS ---
  const isPoisoned = card.isPoisoned;
  const isBurned = card.isBurned;
  const condition = card.activeCondition || CONDITIONS.NONE;

  // Define rotação para Sono ou Paralisia
  let rotateClass = '';
  if (condition === CONDITIONS.ASLEEP) rotateClass = '-rotate-90 grayscale brightness-90 transition-all duration-500'; 
  if (condition === CONDITIONS.PARALYZED) rotateClass = 'rotate-90 brightness-110 saturate-150 transition-all duration-500'; 

  return (
    <div 
      onClick={onClick}
      className={`relative ${small ? 'w-24 h-36' : 'w-52 h-80'} rounded-xl overflow-hidden shadow-lg border-4 ${borderClass} flex flex-col transform transition-transform duration-300 ${actions || onClick ? '' : 'hover:scale-105'} ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : 'cursor-default'} group ${cardBackground} ${className} ${rotateClass}`}
    >
      
      {/* 1. MARCADORES DE STATUS (TOKENS) */}
      <div className="absolute top-8 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
          {isPoisoned && (
              <div className="w-8 h-8 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                  <Skull className="text-white w-5 h-5" />
              </div>
          )}
          {isBurned && (
              <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <Flame className="text-white w-5 h-5" />
              </div>
          )}
          {condition === CONDITIONS.CONFUSED && (
              <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-spin-slow">
                  <EyeOff className="text-white w-5 h-5" />
              </div>
          )}
      </div>

      {/* Overlay de Sono */}
      {condition === CONDITIONS.ASLEEP && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white drop-shadow-md animate-pulse">Zzz...</span>
          </div>
      )}

      {actions && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 p-2 pointer-events-none">
              <div className="pointer-events-auto w-full flex flex-col gap-2">
                   {actions}
              </div>
          </div>
      )}

      {/* Header */}
      <div className={`flex justify-between items-center px-2 py-1 ${typeText} text-[10px] font-bold z-10`}>
        <div className="flex flex-col leading-tight">
            <span className={`truncate ${small ? 'max-w-[50px] text-[9px]' : 'max-w-[80px] text-xs'} font-bold ${isEx ? 'italic' : ''}`}>{card.name}</span>
            {card.stage > 0 && (
                <span className={`inline-block mt-0.5 bg-white/40 px-1 rounded text-[6px] uppercase font-bold w-fit border border-white/50 text-black`}>
                   Estágio {card.stage}
                </span>
            )}
        </div>
        <div className="flex items-center gap-1">
             <span className={`${small ? 'text-[8px]' : 'text-xs'} font-black`}>HP{maxHP}</span>
             <TypeIcon size={small ? 14 : 18} />
        </div>
      </div>
      
      {/* 3. ÁREA DA IMAGEM */}
      <div className={`relative mx-2 mt-0.5 mb-0.5 border-2 border-yellow-200/50 shadow-inner bg-white/90 overflow-hidden flex items-center justify-center ${small ? 'h-12' : 'h-28'}`}>
         {imageUrl ? (
             <img 
               src={imageUrl} 
               alt={card.name} 
               className="w-full h-full object-cover z-0" 
             />
         ) : (
             <TypeIcon size={small ? 24 : 60} className={`opacity-80 drop-shadow-md text-${card.imgColor || 'gray'}-600`} />
         )}

         {card.attachedTool && (
             <div className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 z-10 border border-white" title={card.attachedTool.effect}>
                 <Briefcase size={8} />
                 {!small && card.attachedTool.name.split(' ')[0]}
             </div>
         )}

         <div className="absolute bottom-1 right-1 flex flex-wrap-reverse gap-0.5 justify-end max-w-[80%] z-10">
             {(card.attachedEnergy || []).map((energyType, idx) => {
                 const EIcon = ENERGY_TYPES[energyType]?.icon || PlusCircle;
                 const EColor = ENERGY_TYPES[energyType]?.color || 'bg-gray-400';
                 const EText = ENERGY_TYPES[energyType]?.text || 'text-white';
                 return (
                     <div key={idx} className={`${small ? 'w-3 h-3 text-[8px]' : 'w-4 h-4 text-[10px]'} ${EColor} rounded-full flex items-center justify-center ${EText} border border-white/20 shadow-sm`} title={energyType}>
                         <EIcon size={8} />
                     </div>
                 );
             })}
         </div>
      </div>

      {/* HP Bar */}
      <div className={`px-2 pb-0.5 ${small ? 'h-2' : ''}`}>
          <HPBar current={currentHP} max={maxHP} />
      </div>

      {/* Ataques */}
      <div className="bg-white/40 flex-1 flex flex-col overflow-hidden text-gray-900 mx-1 mb-1 rounded-sm p-1">
          {!small && (
              <div className="flex-1 space-y-1 overflow-y-auto px-1 py-1 custom-scrollbar">
                  {(card.attacks || []).slice(0, 3).map((atk, i) => (
                      <div key={i} className="flex flex-col text-[10px] border-b border-gray-300 last:border-0 pb-1 mb-0.5">
                          <div className="flex justify-between items-center mb-0.5">
                              <div className="flex gap-0.5">
                                  {(atk.cost || []).map((c, idx) => {
                                      if(c === 'Ability') return <span key={idx} className="text-[8px] font-bold text-red-600 uppercase tracking-tighter">Habilidade</span>;
                                      const EIcon = ENERGY_TYPES[c]?.icon || Circle;
                                      const EColor = ENERGY_TYPES[c]?.color || 'bg-gray-400';
                                      const EText = ENERGY_TYPES[c]?.text || 'text-white';
                                      return (
                                          <div key={idx} className={`w-3.5 h-3.5 ${EColor} rounded-full flex items-center justify-center ${EText} shadow-sm`}>
                                              <EIcon size={6} />
                                          </div>
                                      );
                                  })}
                              </div>
                              <span className="font-black text-black text-xs">{atk.damage > 0 ? atk.damage : ''}</span>
                          </div>
                          <span className="text-gray-800 font-bold truncate leading-tight text-[9px]">{atk.name}</span>
                      </div>
                  ))}
              </div>
          )}
          
          {small && (card.attacks || [])[0] && (
              <div className="flex-1 flex flex-col justify-center text-center p-0.5 space-y-0.5">
                  {(card.attacks || []).slice(0,2).map((atk, i) => (
                      <div key={i} className="flex items-center gap-1 border-b border-gray-100 last:border-0 pb-0.5">
                           <div className="flex gap-0.5 shrink-0">
                                  {(atk.cost || []).slice(0,2).map((c, idx) => {
                                      if(c === 'Ability') return <span key={idx} className="text-[5px] font-bold text-red-600 uppercase">HAB</span>;
                                      const EIcon = ENERGY_TYPES[c]?.icon || Circle;
                                      const EColor = ENERGY_TYPES[c]?.color || 'bg-gray-400';
                                      return (
                                          <div key={idx} className={`w-2.5 h-2.5 ${EColor} rounded-full flex items-center justify-center text-[6px] text-white`}>
                                              <EIcon size={4} />
                                          </div>
                                      );
                                  })}
                           </div>
                           <span className="text-[7px] text-gray-600 font-bold leading-none truncate w-full">{atk.name}</span>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Footer (Fraqueza, Resistência, Recuo) */}
      <div className={`bg-gray-100 p-0.5 border-t border-gray-300 text-gray-600 flex justify-between items-center px-1 rounded-b-lg ${small ? 'h-4 text-[6px]' : 'h-6 text-[8px]'}`}>
          
          {/* Fraqueza */}
          <div className="flex items-center gap-0.5">
              <span className="uppercase text-gray-400">Fraq.</span>
              {card.weakness ? (
                  <div className={`${small ? 'w-2.5 h-2.5 text-[6px]' : 'w-3 h-3 text-[8px]'} ${ENERGY_TYPES[card.weakness]?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white`}>
                      {ENERGY_TYPES[card.weakness]?.icon ? React.createElement(ENERGY_TYPES[card.weakness]?.icon, { size: 6 }) : card.weakness[0]}
                  </div>
              ) : <span>-</span>}
          </div>

          {/* Resistência (NOVO) */}
          <div className="flex items-center gap-0.5">
              <span className="uppercase text-gray-400">Res.</span>
              {card.resistance ? (
                  <div className={`${small ? 'w-2.5 h-2.5 text-[6px]' : 'w-3 h-3 text-[8px]'} ${ENERGY_TYPES[card.resistance]?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white`}>
                      {ENERGY_TYPES[card.resistance]?.icon ? React.createElement(ENERGY_TYPES[card.resistance]?.icon, { size: 6 }) : card.resistance[0]}
                  </div>
              ) : <span>-</span>}
          </div>
          
          {/* Recuo */}
          <div className="flex items-center gap-0.5">
              <span className="uppercase text-gray-400">Recuo</span>
              <div className="flex gap-0.5">
                  {[...Array(retreatCost)].map((_, i) => (
                      <div key={i} className={`${small ? 'w-2 h-2 text-[5px]' : 'w-2.5 h-2.5 text-[6px]'} rounded-full bg-gray-300 flex items-center justify-center`}>
                          <Star size={4} className="text-white"/>
                      </div>
                  ))}
                  {retreatCost === 0 && <span className="font-bold">-</span>}
              </div>
          </div>
      </div>
    </div>
  );
};

export default PokemonCard;