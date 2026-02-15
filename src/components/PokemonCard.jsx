import React from 'react';
import { Badge } from './UI';
import { Skull, Flame, Zap } from 'lucide-react';

const getHealthColor = (percentage) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-600 animate-pulse';
};

const PokemonCard = ({ card, location = 'bench', onClick, isActive = false, getMaxHP }) => {
    if (!card) return null;

    // --- DEBUG: VEJA ISSO NO CONSOLE (F12) ---
    // Se isso não mudar quando você altera o status, o erro está no App.jsx
    // console.log(`Renderizando ${card.name}:`, card.activeCondition, `Veneno: ${card.isPoisoned}`);

    const maxHP = getMaxHP ? getMaxHP(card) : parseInt(card.hp);
    const currentHP = Math.max(0, maxHP - (card.damage || 0));
    const healthPercentage = Math.min(100, (currentHP / maxHP) * 100);

    // --- 1. LÓGICA DE ROTAÇÃO (VIA STYLE PARA FORÇAR) ---
    const condition = card.activeCondition || 'NONE';
    let rotationDegree = 0;
    let filterStyle = 'none';

    if (condition === 'ASLEEP') {
        rotationDegree = -90; // Vira esquerda
        filterStyle = 'grayscale(80%)';
    } else if (condition === 'PARALYZED') {
        rotationDegree = 90; // Vira direita
    } else if (condition === 'CONFUSED') {
        rotationDegree = 180; // Cabeça para baixo
    }

    // --- 2. BORDAS E BRILHOS (Status Contínuo) ---
    const isPoisoned = card.isPoisoned === true;
    const isBurned = card.isBurned === true;
    
    let ringClass = "";
    
    if (isPoisoned && isBurned) {
        // Borda dupla (Roxo e Vermelho) via shadow trick
        ringClass = "ring-4 ring-purple-600 shadow-[0_0_0_4px_rgba(220,38,38,1)]"; 
    } else if (isPoisoned) {
        ringClass = "ring-4 ring-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.7)]";
    } else if (isBurned) {
        ringClass = "ring-4 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.7)]";
    } else if (isActive) {
        ringClass = "ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]";
    }

    // Tamanhos
    const cardSizeClasses = location === 'active' 
        ? 'w-[160px] h-[222px] md:w-[200px] md:h-[278px]' 
        : 'w-[120px] h-[167px] md:w-[145px] md:h-[202px]';

    return (
        <div 
            className={`
                relative rounded-xl overflow-visible group transition-all duration-500 ease-in-out
                ${cardSizeClasses} 
                ${onClick ? 'cursor-pointer' : ''}
                ${ringClass}
            `}
            style={{ 
                transform: `rotate(${rotationDegree}deg) ${isActive ? 'scale(1.05)' : 'scale(1)'}`,
                filter: filterStyle,
                zIndex: isActive ? 20 : 1 // Garante que ativo fique por cima
            }}
            onClick={onClick}
        >
            
            {/* CAMADA 1: IMAGEM (Com tratamento de erro) */}
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                {card.image ? (
                    <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-gray-500 font-bold p-2 text-center">${card.name}</div>`;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs p-2 text-center">
                        {card.name}
                    </div>
                )}
            </div>

            {/* CAMADA 2: OVERLAYS */}
            
            {/* Barra de Vida */}
            <div className="absolute top-[51%] left-3 right-3 z-10 -translate-y-1/2">
                <div className="relative h-3 bg-gray-900/90 rounded-full border border-white/20 overflow-hidden shadow">
                    <div 
                        className={`h-full transition-all duration-500 ${getHealthColor(healthPercentage)}`}
                        style={{ width: `${healthPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Stage Badge */}
            {parseInt(card.stage) > 0 && (
                 <div className="absolute top-8 right-1 z-10">
                    <Badge variant="neutral" className="bg-black/70 text-white border-0 py-0 px-1.5 text-[8px] uppercase">
                        STG {card.stage}
                    </Badge>
                </div>
            )}

            {/* Ícones de Status (Caveira/Fogo) */}
            <div className="absolute -top-2 -left-2 flex flex-col gap-1 z-30">
                {isPoisoned && (
                    <div className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                        <Skull size={12} className="text-white"/>
                    </div>
                )}
                {isBurned && (
                    <div className="bg-red-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                        <Flame size={12} className="text-white"/>
                    </div>
                )}
            </div>

            {/* Contador de Dano 3D */}
            {(card.damage || 0) > 0 && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-10 h-10 bg-red-600/80 backdrop-blur rounded border border-red-300 shadow-lg rotate-12 flex items-center justify-center">
                        <span className="text-sm font-black text-white -rotate-12 drop-shadow-md">
                            {card.damage}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Texto de Condição (Fallback visual caso rotação falhe) */}
            {condition !== 'NONE' && (
                <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                    <span className="bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-red-500/50">
                        {condition === 'ASLEEP' ? 'Dormindo' : condition === 'PARALYZED' ? 'Paralisado' : 'Confuso'}
                    </span>
                </div>
            )}

            {/* Hover Glow */}
             <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white pointer-events-none z-30 mix-blend-overlay"></div>
        </div>
    );
};

export default PokemonCard;
