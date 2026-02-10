import React from 'react';
import { Circle, Briefcase, PlusCircle, Star, Skull, Flame, EyeOff, Shield, Heart, Zap } from 'lucide-react'; 
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

  // Dados principais
  const typeInfo = ENERGY_TYPES[card.type] || { icon: Circle, color: 'bg-gray-500', gradient: 'bg-gray-500', text: 'text-white' };
  const TypeIcon = typeInfo.icon;
  const cardBackground = typeInfo.gradient || 'bg-gray-300';
  const typeText = typeInfo.text || 'text-black';
  const imageUrl = card.image || card.images?.small;

  // Cálculo de HP e Ferramentas
  let maxHP = parseInt(card.hp) || 0;
  let retreatCost = parseInt(card.retreat) || 0;
  
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

  // Lógica de Status
  const isPoisoned = card.isPoisoned;
  const isBurned = card.isBurned;
  const condition = card.activeCondition || CONDITIONS.NONE;

  let rotateClass = '';
  if (condition === CONDITIONS.ASLEEP) rotateClass = '-rotate-90 grayscale brightness-90 transition-all duration-500'; 
  if (condition === CONDITIONS.PARALYZED) rotateClass = 'rotate-90 brightness-110 saturate-150 transition-all duration-500'; 

  // --- HELPERS DE RENDERIZAÇÃO ---

  // Renderiza Custo de Energia (Ataque)
  const renderEnergyCost = (cost) => {
      if (!cost) return null;
      return cost.map((type, idx) => {
          if (type === 'Ability') return <span key={idx} className="text-[8px] font-bold text-red-600 uppercase">HAB</span>;
          const EIcon = ENERGY_TYPES[type]?.icon || Circle;
          const EColor = ENERGY_TYPES[type]?.color || 'bg-gray-400';
          return (
              <div key={idx} className={`w-3 h-3 ${EColor} rounded-full flex items-center justify-center text-white shadow-sm border border-white/20`}>
                  <EIcon size={8} />
              </div>
          );
      });
  };

  // Renderiza Fraqueza ou Resistência
  const renderWeakRes = (data, label) => {
      const type = typeof data === 'object' ? data?.type : data;
      if (!type || type === 'none') return <span className="text-[8px] text-gray-400 font-bold">-</span>;
      const EInfo = ENERGY_TYPES[type] || { color: 'bg-gray-500', icon: Circle };
      const EIcon = EInfo.icon;
      return (
        <div className={`w-4 h-4 rounded-full ${EInfo.color} flex items-center justify-center text-white shadow-sm border border-white/30`}>
            <EIcon size={10} />
        </div>
      );
  };

  return (
    <div 
      onClick={onClick}
      className={`relative ${small ? 'w-24 h-36' : 'w-52 h-80'} rounded-xl overflow-hidden shadow-lg border-4 ${borderClass} flex flex-col transform transition-transform duration-300 ${actions || onClick ? '' : 'hover:scale-105'} ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : 'cursor-default'} group ${cardBackground} ${className} ${rotateClass}`}
    >
      
      {/* 1. MARCADORES DE STATUS (TOKENS) */}
      <div className="absolute top-8 left-0 right-0 z-20 flex justify-center gap-1 pointer-events-none">
          {isPoisoned && (
              <div className="w-6 h-6 bg-purple-600 rounded-full border border-white shadow-lg flex items-center justify-center animate-bounce">
                  <Skull className="text-white w-3 h-3" />
              </div>
          )}
          {isBurned && (
              <div className="w-6 h-6 bg-red-600 rounded-full border border-white shadow-lg flex items-center justify-center animate-pulse">
                  <Flame className="text-white w-3 h-3" />
              </div>
          )}
          {condition === CONDITIONS.CONFUSED && (
              <div className="w-6 h-6 bg-pink-500 rounded-full border border-white shadow-lg flex items-center justify-center animate-spin-slow">
                  <EyeOff className="text-white w-3 h-3" />
              </div>
          )}
      </div>

      {/* Overlay de Sono */}
      {condition === CONDITIONS.ASLEEP && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-indigo-900/30">
              <span className="text-2xl font-black text-white drop-shadow-md animate-pulse">Zzz...</span>
          </div>
      )}

      {/* Ações (Hover Overlay) */}
      {actions && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 p-2 pointer-events-none">
              <div className="pointer-events-auto w-full flex flex-col gap-2 transform scale-90">
                    {actions}
              </div>
          </div>
      )}

      {/* --- HEADER --- */}
      <div className={`flex justify-between items-center px-2 py-1 ${typeText} text-[10px] font-bold z-10 bg-white/10 backdrop-blur-sm border-b border-white/20`}>
        <div className="flex flex-col leading-tight">
            <span className={`truncate ${small ? 'max-w-[60px] text-[9px]' : 'max-w-[120px] text-xs'} font-black drop-shadow-sm`}>{card.name}</span>
            {card.stage > 0 && (
                <span className="text-[6px] opacity-80 uppercase font-mono bg-black/10 px-1 rounded w-fit">
                   Estágio {card.stage}
                </span>
            )}
        </div>
        <div className="flex items-center gap-1">
             <span className={`${small ? 'text-[8px]' : 'text-xs'} font-black`}>HP{maxHP}</span>
             <TypeIcon size={small ? 14 : 16} />
        </div>
      </div>
      
      {/* --- IMAGEM --- */}
      {/* Se for pequeno, a imagem agora ocupa mais espaço (flex-1) para preencher o vazio deixado pelos ataques */}
      <div className={`relative mx-1.5 mt-1 border-2 border-white/40 shadow-inner bg-slate-100 overflow-hidden flex items-center justify-center ${small ? 'flex-1 min-h-[50px]' : 'h-32'}`}>
         {imageUrl ? (
             <img src={imageUrl} alt={card.name} className="w-full h-full object-cover z-0" />
         ) : (
             <TypeIcon size={small ? 24 : 60} className={`opacity-50 text-gray-400`} />
         )}

         {/* Ferramenta Ligada */}
         {card.attachedTool && (
             <div className="absolute top-1 right-1 bg-blue-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10 border border-white">
                 <Briefcase size={8} />
                 {!small && card.attachedTool.name.split(' ')[0]}
             </div>
         )}

         {/* Energias Ligadas (Sobre a imagem) */}
         <div className="absolute bottom-1 right-1 flex flex-wrap-reverse gap-0.5 justify-end max-w-[90%] z-10">
             {(card.attachedEnergy || []).map((energyType, idx) => {
                 const EIcon = ENERGY_TYPES[energyType]?.icon || PlusCircle;
                 const EColor = ENERGY_TYPES[energyType]?.color || 'bg-gray-400';
                 return (
                     <div key={idx} className={`w-3 h-3 ${EColor} rounded-full flex items-center justify-center text-white border border-white shadow-sm`}>
                         <EIcon size={8} />
                     </div>
                 );
             })}
         </div>
      </div>

      {/* Barra de HP */}
      <div className={`px-2 pb-0.5 ${small ? 'h-2' : 'h-3'}`}>
          <HPBar current={currentHP} max={maxHP} />
      </div>

      {/* --- ATAQUES (SÓ RENDERIZA SE NÃO FOR PEQUENO) --- */}
      {!small && (
        <div className="bg-white/90 flex-1 flex flex-col overflow-hidden text-gray-900 mx-1 mb-1 rounded-sm p-1 border border-black/5 shadow-sm">
            <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                {(card.attacks || []).slice(0, 2).map((atk, i) => (
                    <div key={i} className="flex flex-col border-b border-gray-200 last:border-0 pb-1 mb-0.5">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-0.5 pt-0.5">
                                {renderEnergyCost(atk.cost)}
                            </div>
                            <span className="font-black text-black text-[10px]">{atk.damage > 0 ? atk.damage : ''}</span>
                        </div>
                        <span className="text-gray-800 font-bold truncate leading-tight text-[8px] mt-0.5">{atk.name}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* --- FOOTER (Fraqueza, Resistência, Recuo) --- */}
      <div className={`bg-gray-100 border-t border-gray-300 text-gray-600 flex justify-between items-center px-2 rounded-b-lg ${small ? 'h-5 py-0.5' : 'h-7 py-1'}`}>
          
          {/* Fraqueza */}
          <div className="flex items-center gap-1" title="Fraqueza">
              <span className="text-[6px] font-bold uppercase text-gray-400">F</span>
              {renderWeakRes(card.weakness, 'Fraq')}
          </div>

          {/* Resistência */}
          <div className="flex items-center gap-1" title="Resistência">
              <span className="text-[6px] font-bold uppercase text-gray-400">R</span>
              {renderWeakRes(card.resistance, 'Res')}
          </div>
          
          {/* Recuo */}
          <div className="flex items-center gap-0.5" title="Custo de Recuo">
              <div className="flex gap-0.5">
                  {[...Array(retreatCost)].map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300 flex items-center justify-center border border-white">
                          <Star size={6} className="text-white fill-white"/>
                      </div>
                  ))}
                  {retreatCost === 0 && <span className="text-[8px] font-bold text-gray-400">-</span>}
              </div>
          </div>
      </div>
    </div>
  );
};

export default PokemonCard;