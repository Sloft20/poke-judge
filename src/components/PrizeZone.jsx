// src/components/PrizeZone.jsx
import React from 'react';
import { Gift } from 'lucide-react';

const CARD_BACK_URL = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";

const PrizeZone = ({ count, onClick, compact = false }) => {
    // Cria um array vazio só para fazer o map
    const prizes = Array(count).fill(null);

    if (count === 0) {
        return (
            <div className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center opacity-50">
                <Gift className="text-gray-400" size={20} />
            </div>
        );
    }

    return (
        <div 
            className={`relative ${compact ? 'w-16 h-24' : 'grid grid-cols-3 gap-2'}`}
            onClick={onClick}
            title={`${count} Prêmios Restantes`}
        >
            {prizes.map((_, index) => (
                <div 
                    key={index}
                    className={`
                        transition-all duration-500 ease-out shadow-md rounded-md overflow-hidden bg-blue-900 border border-white/20
                        ${compact ? 'absolute w-full h-full' : 'w-20 h-28 relative cursor-pointer hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-yellow-400'}
                    `}
                    style={compact ? { 
                        top: `${index * 2}px`, 
                        left: `${index * 2}px`, 
                        zIndex: index 
                    } : {}}
                >
                    {/* Imagem do Verso da Carta */}
                    <img 
                        src={CARD_BACK_URL} 
                        alt="Prize Card" 
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            
            {/* Contador flutuante para o modo compacto */}
            {compact && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow border-2 border-white z-50">
                    {count}
                </div>
            )}
        </div>
    );
};

export default PrizeZone;