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

    // --- SANITIZAÇÃO DOS DADOS ---
    // Garante que se não tiver condição, é string vazia ou NONE
    const condition = (card.activeCondition || 'NONE').toUpperCase();
    const isPoisoned = card.isPoisoned === true;
    const isBurned = card.isBurned === true;

    // --- 1. LÓGICA DE ROTAÇÃO (APLICADA EM CLASSE ESPECÍFICA) ---
    // Usamos classes diretas do Tailwind para evitar conflito de 'transform'
    let rotateClass = ""; 
    let filterClass = "";

    if (condition === 'ASLEEP') {
        rotateClass = "-rotate-90"; // Esquerda
        filterClass = "grayscale opacity-80";
    } else if (condition === 'PARALYZED') {
        rotateClass = "rotate-90"; // Direita
        filterClass = "contrast-125";
    } else if (condition === 'CONFUSED') {
        rotateClass = "rotate-180"; // Cabeça para baixo
    }

    // --- 2. BORDAS (Status e Ativo) ---
    let borderClass = "border border-slate-700"; // Borda padrão discreta
    let ringClass = "";

    if (isActive) {
        ringClass = "ring-4 ring-yellow-400 shadow-xl z-10 scale-105"; // Destaque Ativo
    }

    // Se tiver status, a borda muda de cor (sobrepõe o amarelo do ativo se necessário, ou soma)
    if (isPoisoned && isBurned) {
        borderClass = "border-4 border-purple-600 ring-2 ring-red-500"; 
    } else if (isPoisoned) {
        borderClass = "border-4 border-purple-600";
    } else if (isBurned) {
        borderClass = "border-4 border-red-600";
    }

    // --- 3. TAMANHOS ---
    const sizeClass = location === 'active' 
        ? 'w-[160px] h-[222px] md:w-[200px] md:h-[278px]' 
        : 'w-[120px] h-[167px] md:w-[145px] md:h-[202px]';

    return (
        // CONTAINER EXTERNO (Posição e Clique)
        <div 
            className={`relative group ${sizeClass} ${isActive ? 'z-20' : 'z-0'}`}
            onClick={onClick}
        >
            {/* CONTAINER INTERNO DE ROTAÇÃO (Separa a rotação do resto) */}
            <div className={`
                w-full h-full rounded-xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out bg-slate-800
                ${rotateClass} ${filterClass} ${borderClass} ${ringClass}
                ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}
            `}>
                
                {/* IMAGEM DA CARTA */}
                {card.image ? (
                    <img 
                        src={card.image} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs p-2 text-center bg-slate-900">
                        {card.name}
                    </div>
                )}

                {/* OVERLAYS (Dentro da rotação para acompanhar a carta) */}
                
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
                        <Badge variant="neutral" className="bg-black/70 text-white border-0 py-0 px-1.5 text-[8px] uppercase backdrop-blur-sm">
                            STG {card.stage}
                        </Badge>
                    </div>
                )}

                {/* Efeito de Brilho Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-white pointer-events-none mix-blend-overlay"></div>
            </div>

            {/* ELEMENTOS FLUTUANTES (FORA DA ROTAÇÃO - Para ficarem sempre de pé) */}
            
            {/* Ícones de Status (Canto Superior Esquerdo) */}
            <div className="absolute -top-2 -left-2 flex flex-col gap-1 z-30 pointer-events-none">
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

            {/* Contador de Dano (Dado 3D) */}
            {(card.damage || 0) > 0 && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="w-10 h-10 bg-red-600/90 backdrop-blur rounded-lg border border-red-400 shadow-xl rotate-12 flex items-center justify-center transform hover:scale-110 transition-transform">
                        <span className="text-sm font-black text-white -rotate-12 drop-shadow-md">
                            {card.damage}
                        </span>
                    </div>
                </div>
            )}

            {/* Label de Condição (Fallback visual caso a rotação confunda) */}
            {condition !== 'NONE' && (
                <div className="absolute bottom-4 left-0 right-0 text-center z-30 pointer-events-none">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg border border-white/20 uppercase tracking-widest">
                        {condition === 'ASLEEP' ? 'Dormindo' : condition === 'PARALYZED' ? 'Paralisado' : 'Confuso'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PokemonCard;
