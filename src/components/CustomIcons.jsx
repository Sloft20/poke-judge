import React from 'react';

// Função auxiliar para manter o padrão visual do Lucide (bordas arredondadas, espessura, etc)
const IconBase = ({ size = 24, color = "currentColor", className = "", children, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        {...props}
    >
        {children}
    </svg>
);

// 1. Ícone V-STAR (Uma estrela com um "V" estilizado dentro ou cortando)
export const VStarIcon = (props) => (
    <IconBase {...props}>
        {/* O formato da estrela */}
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        {/* Um corte em V no meio para estilizar */}
        <path d="M12 12l-2 2h4l-2-2" strokeWidth="1.5" /> 
    </IconBase>
);

// 2. Ícone DE DANO (Um "Splat" ou impacto)
export const DamageSplat = (props) => (
    <IconBase {...props}>
        <path d="M12 2a10 10 0 1 0 10 10 9 9 0 0 0-10-10zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </IconBase>
);

// 3. Ícone DE ENERGIA DUPLA (Dois orbes conectados)
export const DoubleEnergy = (props) => (
    <IconBase {...props}>
        <circle cx="8" cy="12" r="5" />
        <circle cx="16" cy="12" r="5" />
        <path d="M12 7v10" strokeDasharray="2 2" /> {/* Linha de conexão */}
    </IconBase>
);

// 4. Ícone de CARTA VIRADA (Verso do card)
export const CardBack = (props) => (
    <IconBase {...props}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /> {/* Pokebola meio */}
        <path d="M5 10h14" />
        <path d="M12 10v2" />
    </IconBase>
);