import React from 'react';
import { Badge } from './UI'; // Certifique-se que o caminho está certo
import { Swords, Shield, Footprints, Sparkles, Anchor } from 'lucide-react';

// --- FUNÇÃO AUXILIAR PARA COR DA BARRA DE VIDA ---
const getHealthColor = (percentage) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-600animate-pulse';
};

const PokemonCard = ({ card, location = 'bench', onClick, isActive = false, getMaxHP }) => {
    if (!card) return null;

    // 1. Cálculos de Estado (Usando a função getMaxHP que criamos antes)
    const maxHP = getMaxHP ? getMaxHP(card) : parseInt(card.hp);
    const currentHP = Math.max(0, maxHP - (card.damage || 0));
    const healthPercentage = Math.min(100, (currentHP / maxHP) * 100);
    const hasTool = !!card.attachedTool;
    const energyCount = card.attachedEnergy ? card.attachedEnergy.length : 0;

    // Define o tamanho base do card (Ativo é maior)
    const cardSizeClasses = location === 'active' 
        ? 'w-[260px] h-[363px] md:w-[300px] md:h-[418px]' // Tamanho de carta real (proporção ~0.71)
        : 'w-[160px] h-[223px] md:w-[180px] md:h-[251px]'; // Banco menor

    // Efeito de Hover e Seleção
    const hoverClasses = onClick ? 'cursor-pointer hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-blue-400 transition-all duration-300' : '';
    const activeRing = isActive ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-105 z-10' : '';

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-lg group ${cardSizeClasses} ${hoverClasses} ${activeRing}`} onClick={onClick}>
            
            {/* --- CAMADA 1: A IMAGEM COMPLETA DA CARTA --- */}
            {card.image ? (
                <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover z-0"
                    // Fallback se a imagem falhar (mostra um fundo cinza)
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.parentElement.classList.add('bg-slate-800'); e.target.style.display = 'none';
                    }}
                />
            ) : (
                // Fallback se não tiver URL de imagem cadastrada
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                    SEM IMAGEM
                </div>
            )}

            {/* ============================================================
                 CAMADA 2: OVERLAYS (As informações por cima da imagem)
            ============================================================ */}
            
            {/* 1. BARRA DE VIDA (Posicionada na Faixa Central) */}
            {/* top-[54%] coloca ela logo abaixo da imagem da maioria das cartas */}
            {/* 1. BARRA DE VIDA (Ajuste Fino) */}
            {/* Mudamos para 51% para cobrir a faixa de dados da Pokédex */}
            <div className="absolute top-[51%] left-4 right-4 z-20 -translate-y-1/2">
                
                {/* Mantive o resto igual para preservar o estilo que você gostou */}
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

            {/* 2. FERRAMENTA LIGADA (Canto Superior Direito, abaixo do HP) */}
            {hasTool && (
                 <div className="absolute top-8 right-2 z-20 animate-in slide-in-from-right-2">
                    <Badge variant="info" className="flex items-center gap-1 shadow-lg backdrop-blur-md bg-blue-900/80 text-blue-100 border-blue-400/50 pl-1 pr-2 py-0.5 text-[10px]">
                        <Anchor size={12} />
                        <span className="truncate max-w-[80px]">{card.attachedTool.name}</span>
                    </Badge>
                </div>
            )}

            {/* 3. ENERGIAS LIGADAS (Canto Inferior Esquerdo) */}
            {energyCount > 0 && (
                <div className="absolute bottom-3 left-3 z-20 max-w-[75%]">
                     {/* Fundo escuro para as energias não sumirem na arte */}
                    <div className="flex flex-wrap gap-1 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-md">
                        {card.attachedEnergy.map((energyName, index) => {
                            // Mapeamento simples de cores (idealmente seriam ícones no futuro)
                            const colorMap = {
                                'Fire': 'bg-red-500 border-red-300',
                                'Water': 'bg-blue-500 border-blue-300',
                                'Grass': 'bg-green-500 border-green-300',
                                'Lightning': 'bg-yellow-400 border-yellow-200 text-yellow-900',
                                'Psychic': 'bg-purple-500 border-purple-300',
                                'Fighting': 'bg-orange-700 border-orange-400',
                                'Darkness': 'bg-slate-800 border-slate-600',
                                'Metal': 'bg-gray-400 border-gray-200 text-gray-800',
                                'Colorless': 'bg-slate-200 border-slate-300 text-slate-700',
                            };
                            const style = colorMap[energyName] || 'bg-white text-black';

                            return (
                                <div key={index} className={`w-5 h-5 rounded-full ${style} border shadow-sm flex items-center justify-center text-[8px] font-bold uppercase`} title={energyName}>
                                    {energyName.substring(0, 1)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. INDICADOR DE ESTÁGIO (Pequeno ícone no canto superior esquerdo) */}
            {parseInt(card.stage) > 0 && (
                 <div className="absolute top-8 left-2 z-20">
                    <Badge variant="neutral" className="shadow-lg backdrop-blur-md bg-slate-900/80 text-slate-200 border-slate-600 py-0 px-1.5 text-[9px]">
                        STAGE {card.stage}
                    </Badge>
                </div>
            )}
            
             {/* Efeito de Brilho ao passar o mouse (Opcional) */}
             <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent z-30"></div>
        </div>
    );
};

export default PokemonCard;