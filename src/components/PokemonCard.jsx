import React from 'react';
import { Badge } from './UI';
import { Anchor } from 'lucide-react';

// --- IMAGENS OFICIAIS DAS ENERGIAS (PNG Transparente) ---
const ENERGY_IMAGES = {
    'Grass': 'https://archives.bulbagarden.net/media/upload/thumb/2/2e/Grass-attack.png/20px-Grass-attack.png',
    'Fire': 'https://archives.bulbagarden.net/media/upload/thumb/a/ad/Fire-attack.png/20px-Fire-attack.png',
    'Water': 'https://archives.bulbagarden.net/media/upload/thumb/1/11/Water-attack.png/20px-Water-attack.png',
    'Lightning': 'https://archives.bulbagarden.net/media/upload/thumb/0/04/Lightning-attack.png/20px-Lightning-attack.png',
    'Psychic': 'https://archives.bulbagarden.net/media/upload/thumb/e/ef/Psychic-attack.png/20px-Psychic-attack.png',
    'Fighting': 'https://archives.bulbagarden.net/media/upload/thumb/4/4c/Fighting-attack.png/20px-Fighting-attack.png',
    'Darkness': 'https://archives.bulbagarden.net/media/upload/thumb/8/8f/Darkness-attack.png/20px-Darkness-attack.png',
    'Metal': 'https://archives.bulbagarden.net/media/upload/thumb/f/f1/Metal-attack.png/20px-Metal-attack.png',
    'Dragon': 'https://archives.bulbagarden.net/media/upload/thumb/d/d7/Dragon-attack.png/20px-Dragon-attack.png',
    'Fairy': 'https://archives.bulbagarden.net/media/upload/thumb/c/c3/Fairy-attack.png/20px-Fairy-attack.png',
    'Colorless': 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/20px-Colorless-attack.png',
    'Ability': 'https://limitlesstcg.com/img/symbols/energy/ability.png' // Bônus: Ícone de Habilidade
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
        ? 'w-[300px] h-[410px] md:w-[400px] md:h-[518px]' 
        : 'w-[120px] h-[167px] md:w-[145px] md:h-[202px]';

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

            {/* 2. FERRAMENTA */}
            {hasTool && (
                 <div className="absolute top-8 right-2 z-20 animate-in slide-in-from-right-2">
                    <Badge variant="info" className="flex items-center gap-1 shadow-lg backdrop-blur-md bg-blue-900/80 text-blue-100 border-blue-400/50 pl-1 pr-2 py-0.5 text-[10px]">
                        <Anchor size={12} />
                        <span className="truncate max-w-[80px]">{card.attachedTool.name}</span>
                    </Badge>
                </div>
            )}

            {/* 3. ENERGIAS LIGADAS (Lado Direito, Acima da Barra de Vida) */}
            {energyCount > 0 && (
                // Mudei para 'right-3' (lado direito)
                // Mudei para 'top-[44%]' (para ficar logo acima da barra de vida que está em 51%)
                <div className="absolute top-[41%] right-3 z-20 max-w-[60%] pointer-events-none">
                    {/* Adicionei 'justify-end' para as energias ficarem alinhadas à direita */}
                    <div className="flex flex-wrap gap-0.5 justify-end">
                        {card.attachedEnergy.map((energyName, index) => {
                            const imgUrl = ENERGY_IMAGES[energyName] || ENERGY_IMAGES['Colorless'];

                            return (
                                <div 
                                    key={index} 
                                    className="w-5 h-5 rounded-full transition-transform hover:scale-125 hover:z-50 relative pointer-events-auto" 
                                    title={energyName}
                                >
                                    <img 
                                        src={imgUrl} 
                                        alt={energyName}
                                        className="w-full h-full object-contain drop-shadow-md"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. STAGE */}
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