// src/components/UI.jsx
import React from 'react';

// Componente de Cartão Branco (Fundo)
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
    {children}
  </div>
);

// Componente de Botão (com variantes de cor)
export const Button = ({ onClick, disabled, variant = 'primary', icon: Icon, children, className = '' }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-all text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400",
    secondary: "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// Componente de Etiqueta (Badge)
export const Badge = ({ children, className = '' }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
};