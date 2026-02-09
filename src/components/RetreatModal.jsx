import React from 'react';
import { RefreshCw, X, Circle, AlertTriangle } from 'lucide-react';
import { ENERGY_TYPES } from '../data/constants';

const RetreatModal = ({ cost, availableEnergies, selectedIndices, onSelect, onConfirm, onCancel }) => {
    // Verifica se já selecionou o suficiente
    const isReady = selectedIndices.length >= cost;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-orange-900/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Header de Alerta */}
                <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 animate-pulse"></div>
                    
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <span className="text-orange-500"><RefreshCw size={24} className={isReady ? "animate-spin-slow" : ""} /></span>
                            MANOBRA DE RECUO
                        </h2>
                        <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-widest">
                            Custo Exigido: <span className="text-orange-400 font-bold text-lg">{cost}</span> Energia(s)
                        </p>
                    </div>
                </div>

                {/* Corpo */}
                <div className="p-6 bg-slate-900 flex flex-col gap-6">
                    
                    {/* Instrução Visual */}
                    <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg flex items-center gap-3">
                        <AlertTriangle size={20} className="text-orange-500 shrink-0"/>
                        <p className="text-xs text-orange-200">
                            Selecione as energias que serão <span className="font-bold text-white">descartadas</span> para permitir a fuga.
                        </p>
                    </div>

                    {/* Grid de Seleção */}
                    <div className="grid grid-cols-4 gap-3 justify-center">
                        {availableEnergies.map((type, idx) => {
                            const isSelected = selectedIndices.includes(idx);
                            const EInfo = ENERGY_TYPES[type] || { icon: Circle, color: 'bg-gray-600' };
                            const Icon = EInfo.icon;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(idx)}
                                    className={`
                                        relative group aspect-square rounded-xl flex items-center justify-center
                                        transition-all duration-300 border-2
                                        ${isSelected 
                                            ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' 
                                            : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700'}
                                    `}
                                >
                                    <div className={`${isSelected ? 'text-white' : 'text-slate-400'} transition-colors`}>
                                        <Icon size={24} />
                                    </div>
                                    
                                    {/* Checkmark animado se selecionado */}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer de Ação */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors uppercase text-xs tracking-wider"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(selectedIndices)}
                        disabled={!isReady}
                        className={`
                            flex-1 py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-lg
                            ${isReady 
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/25 hover:scale-105' 
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                    >
                        Confirmar Recuo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RetreatModal;