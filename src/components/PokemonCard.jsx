import React from 'react';
import { Badge } from './UI';
// Adicionamos todos os ícones necessários aqui
import { 
    Swords, Shield, Footprints, Sparkles, Anchor, 
    Flame, Droplets, Leaf, Zap, Eye, Dumbbell, Moon, 
    Hexagon, Star, Circle, Ghost 
} from 'lucide-react';

// --- MAPA DE ÍCONES POR TIPO ---
const TYPE_ICONS = {
    'Fire': { icon: Flame, color: 'text-red-500', bg: 'bg-red-100' },
    'Water': { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100' },
    'Grass': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-100' },
    'Lightning': { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    'Psychic': { icon: Eye, color: 'text-purple-500', bg: 'bg-purple-100' },
    'Fighting': { icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-100' },
    'Darkness': { icon: Moon, color: 'text-slate-700', bg: 'bg-slate-300' },
    'Metal': { icon: Hexagon, color: 'text-gray-500', bg: 'bg-gray-200' },
    'Dragon': { icon: Ghost, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    'Fairy': { icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-100' },
    'Colorless': { icon: Star, color: 'text-slate-400', bg: 'bg-slate-100' },
    // Fallback
    'default': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' }
};

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
    const hasTool = !!card.attachedTool;
    const energyCount = card.attachedEnergy ? card.attachedEnergy.length : 0;

    const cardSizeClasses = location === 'active' 
        ? 'w-[260px] h-[363px] md:w-[300px] md:h-[418px]' 
        : 'w-[160px] h-[223px] md:w-[180px] md:h-[251px]';

    const hoverClasses = onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-blue-400 transition-all duration-300' : '';
    const activeRing = isActive ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-105 z-10' : '';

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-lg group ${cardSizeClasses} ${hoverClasses} ${activeRing}`} onClick={onClick}>
            
            {/* CAMADA 1: IMAGEM */}
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
            
            {/* 1. BARRA DE VIDA (Centralizada) */}
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

            {/* 2. FERRAMENTA */}
            {hasTool && (
                 <div className="absolute top-8 right-2 z-20 animate-in slide-in-from-right-2">
                    <Badge variant="info" className="flex items-center gap-1 shadow-lg backdrop-blur-md bg-blue-900/80 text-blue-100 border-blue-400/50 pl-1 pr-2 py-0.5 text-[10px]">
                        <Anchor size={12} />
                        <span className="truncate max-w-[80px]">{card.attachedTool.name}</span>
                    </Badge>
                </div>
            )}

            {/* 3. ENERGIAS LIGADAS (AGORA COM ÍCONES VETORIAIS!) */}
            {energyCount > 0 && (
                <div className="absolute bottom-3 left-3 z-20 max-w-[85%]">
                    <div className="flex flex-wrap gap-1 p-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
                        {card.attachedEnergy.map((energyName, index) => {
                            // Busca o ícone e cores no mapa, ou usa o default
                            const typeData = TYPE_ICONS[energyName] || TYPE_ICONS['default'];
                            const IconComponent = typeData.icon;

                            return (
                                <div 
                                    key={index} 
                                    className={`w-6 h-6 rounded-full ${typeData.bg} border border-white/20 shadow-sm flex items-center justify-center transition-transform hover:scale-125`} 
                                    title={energyName}
                                >
                                    <IconComponent size={14} className={typeData.color} fill="currentColor" fillOpacity={0.2} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. STAGE (Topo Direito) */}
            {parseInt(card.stage) > 0 && (
                 <div className="absolute top-[32px] right-2 z-20">
                    <Badge variant="neutral" className="shadow-md backdrop-blur-sm bg-slate-900/80 text-slate-200 border border-slate-600/50 py-0 px-2 text-[9px] font-bold tracking-wider uppercase h-4 flex items-center">
                        STAGE {card.stage}
                    </Badge>
                </div>
            )}
            
             <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent z-30"></div>
        </div>
    );
};

export default PokemonCard;