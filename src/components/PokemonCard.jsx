import React from 'react';
import { Badge } from './UI';
import { Skull, Flame } from 'lucide-react';

const getHealthColor = (percentage) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-600 animate-pulse';
};

const PokemonCard = ({ card, location = 'bench', onClick, isActive = false, getMaxHP }) => {
    if (!card) return null;

    const maxHP = getMaxHP ? getMaxHP(card) : parseInt(card.hp);
    const currentHP = Math.max(0, maxHP - (card.damage || 0));
    const healthPercentage = Math.min(100, (currentHP / maxHP) * 100);

    // --- LÓGICA VISUAL DE STATUS (Versão de Alta Visibilidade) ---
    // Verifica se as propriedades existem dentro do objeto 'card'
    const condition = card.activeCondition || 'NONE';
    const isPoisoned = card.isPoisoned === true;
    const isBurned = card.isBurned === true;

    let statusClasses = "transition-all duration-500 ease-in-out transform origin-center";
    let statusRing = "";

    // 1. ROTAÇÃO (Condições de Bloqueio)
    if (condition === 'ASLEEP') {
        statusClasses += " -rotate-90 grayscale contrast-125"; // Vira p/ esquerda + Cinza
    } else if (condition === 'PARALYZED') {
        statusClasses += " rotate-90 contrast-125"; // Vira p/ direita
    } else if (condition === 'CONFUSED') {
        statusClasses += " rotate-180"; // Cabeça para baixo
    }

    // 2. BORDAS COLORIDAS (Dano Contínuo - Sobrepõe o anel de "ativo")
    if (isPoisoned && isBurned) {
        statusRing = "ring-4 ring-offset-2 ring-purple-600 border-4 border-red-500"; // Borda dupla
    } else if (isPoisoned) {
        statusRing = "ring-4 ring-purple-600 ring-offset-1"; // Borda Roxa grossa
    } else if (isBurned) {
        statusRing = "ring-4 ring-red-600 ring-offset-1"; // Borda Vermelha grossa
    } else if (isActive) {
        statusRing = "ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-105 z-10"; // Borda Padrão de Ativo
    }
    // -----------------------------------------------------------

    // Ajuste de Tamanhos
    const cardSizeClasses = location === 'active' 
        ? 'w-[160px] h-[222px] md:w-[200px] md:h-[278px]' 
        : 'w-[120px] h-[167px] md:w-[145px] md:h-[202px]';

    const hoverClasses = onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-blue-400 transition-all duration-300' : '';

    return (
        <div 
            className={`
                relative rounded-xl overflow-hidden shadow-lg group 
                ${cardSizeClasses} ${hoverClasses} ${statusClasses} ${statusRing}
            `} 
            onClick={onClick}
        >
            
            {/* CAMADA 1: IMAGEM DA CARTA */}
            {card.image ? (
                <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover z-0"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.parentElement.classList.add('bg-slate-800'); e.target.style.display = 'none';
                    }}
                />
            ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                    SEM IMAGEM
                </div>
            )}

            {/* CAMADA 2: OVERLAYS */}
            
            {/* 1. BARRA DE VIDA */}
            <div className="absolute top-[51%] left-4 right-4 z-20 -translate-y-1/2">
                <div className="relative h-3.5 bg-gray-900/90 backdrop-blur-[2px] rounded-full border border-white/20 overflow-hidden shadow-md">
                    <div 
                        className={`h-full transition-all duration-500 ease-out ${getHealthColor(healthPercentage)}`}
                        style={{ width: `${healthPercentage}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-widest uppercase">
                            {currentHP}/{maxHP}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. STAGE */}
            {parseInt(card.stage) > 0 && (
                 <div className="absolute top-[32px] right-2 z-20">
                    <Badge variant="neutral" className="shadow-md backdrop-blur-sm bg-slate-900/80 text-slate-200 border border-slate-600/50 py-0 px-2 text-[9px] font-bold tracking-wider uppercase h-4 flex items-center">
                        STAGE {card.stage}
                    </Badge>
                </div>
            )}

            {/* 3. ÍCONES DE STATUS (NOVO: Canto Superior Esquerdo) */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-30">
                {isPoisoned && (
                    <div className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white animate-pulse" title="Envenenado">
                        <Skull size={14} className="text-white"/>
                    </div>
                )}
                {isBurned && (
                    <div className="bg-red-600 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white animate-pulse" title="Queimado">
                        <Flame size={14} className="text-white"/>
                    </div>
                )}
            </div>

            {/* 4. CONTADOR DE DANO (Dado 3D) */}
            {(card.damage || 0) > 0 && (
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none animate-in zoom-in bounce-in duration-500">
                    <div className="relative group">
                        <div className="w-10 h-10 bg-red-600/60 backdrop-blur-md rounded-lg border border-red-300 shadow-[0_4px_15px_rgba(220,38,38,0.6)] rotate-6 flex items-center justify-center">
                            <span className="text-sm font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] -rotate-6">
                                {card.damage}
                            </span>
                        </div>
                        <div className="absolute top-1 left-1 w-3 h-1 bg-white/40 rounded-full rotate-6"></div>
                    </div>
                </div>
            )}
            
            {/* Efeito de Brilho Hover */}
             <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent z-30"></div>
        </div>
    );
};

export default PokemonCard;
