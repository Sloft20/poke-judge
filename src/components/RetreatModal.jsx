import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// --- IMAGENS OFICIAIS DAS ENERGIAS (Mesmas do EnergyModal) ---
const ENERGY_IMAGES = {
    'Fire': 'https://archives.bulbagarden.net/media/upload/thumb/a/ad/Fire-attack.png/60px-Fire-attack.png',
    'Water': 'https://archives.bulbagarden.net/media/upload/thumb/1/11/Water-attack.png/60px-Water-attack.png',
    'Grass': 'https://archives.bulbagarden.net/media/upload/thumb/2/2e/Grass-attack.png/60px-Grass-attack.png',
    'Lightning': 'https://archives.bulbagarden.net/media/upload/thumb/0/04/Lightning-attack.png/60px-Lightning-attack.png',
    'Psychic': 'https://archives.bulbagarden.net/media/upload/thumb/e/ef/Psychic-attack.png/60px-Psychic-attack.png',
    'Fighting': 'https://archives.bulbagarden.net/media/upload/thumb/4/4c/Fighting-attack.png/60px-Fighting-attack.png',
    'Darkness': 'https://archives.bulbagarden.net/media/upload/thumb/8/8f/Darkness-attack.png/60px-Darkness-attack.png',
    'Metal': 'https://archives.bulbagarden.net/media/upload/thumb/f/f1/Metal-attack.png/60px-Metal-attack.png',
    'Dragon': 'https://archives.bulbagarden.net/media/upload/thumb/d/d7/Dragon-attack.png/60px-Dragon-attack.png',
    'Fairy': 'https://archives.bulbagarden.net/media/upload/thumb/c/c3/Fairy-attack.png/60px-Fairy-attack.png',
    'Colorless': 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/60px-Colorless-attack.png',
    // Fallback caso venha algo estranho
    'undefined': 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/60px-Colorless-attack.png'
};

const RetreatModal = ({ cost, availableEnergies, selectedIndices, onSelect, onConfirm, onCancel }) => {
    // Verifica se já selecionou a quantidade necessária
    const isReady = selectedIndices.length === cost;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-orange-900/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Header */}
                <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative overflow-hidden">
                    {/* Efeito de barra pulsante */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 animate-pulse"></div>
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <span className="text-orange-500 bg-orange-900/20 p-2 rounded-lg border border-orange-500/20 shadow-lg shadow-orange-500/10">
                                <RefreshCw size={24} className={isReady ? "animate-spin-slow" : ""} />
                            </span>
                            MANOBRA DE RECUO
                        </h2>
                        <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-widest pl-1">
                            Custo Exigido: <span className="text-orange-400 font-bold text-lg">{cost}</span> Energia(s)
                        </p>
                    </div>
                </div>

                {/* Corpo */}
                <div className="p-6 bg-slate-900 flex flex-col gap-6">
                    
                    {/* Aviso */}
                    <div className="bg-orange-950/30 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3 shadow-inner">
                        <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5 animate-pulse"/>
                        <p className="text-xs text-orange-200/80 leading-relaxed">
                            Selecione as energias que serão <span className="font-bold text-orange-100 border-b border-orange-500">descartadas</span> para permitir a retirada.
                        </p>
                    </div>

                    {/* Grid de Seleção (IMAGENS REAIS) */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 justify-center">
                        {availableEnergies.map((type, idx) => {
                            const isSelected = selectedIndices.includes(idx);
                            
                            // Pega a imagem baseada no nome da energia, ou usa Incolor como fallback
                            const imgUrl = ENERGY_IMAGES[type] || ENERGY_IMAGES['Colorless'];

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(idx)}
                                    className={`
                                        relative group aspect-square rounded-xl flex items-center justify-center
                                        transition-all duration-300 border-2
                                        ${isSelected 
                                            ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-105' 
                                            : 'border-slate-800 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700'}
                                    `}
                                >
                                    {/* Imagem da Energia */}
                                    <div className={`w-10 h-10 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'}`}>
                                        <img 
                                            src={imgUrl} 
                                            alt={type} 
                                            className="w-full h-full object-contain drop-shadow-md"
                                        />
                                    </div>

                                    {/* Checkmark de Seleção */}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-0.5 shadow-sm border-2 border-slate-900 animate-in zoom-in duration-200">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        
                        {/* Se não houver energias (caso raro de abrir modal sem energia) */}
                        {availableEnergies.length === 0 && (
                            <div className="col-span-full text-center py-4">
                                <span className="text-xs text-slate-600 italic">Nenhuma energia disponível.</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Contador de Seleção */}
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            Selecionado: <span className={isReady ? 'text-green-400' : 'text-slate-300'}>{selectedIndices.length}</span> / {cost}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                    <button 
                        onClick={onCancel} 
                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-800 hover:text-white transition-colors uppercase text-xs tracking-wider border border-transparent hover:border-slate-700"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(selectedIndices)} 
                        disabled={!isReady} 
                        className={`
                            flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
                            ${isReady 
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/25 hover:scale-[1.02]' 
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}
                        `}
                    >
                        <RefreshCw size={16} className={isReady ? "animate-spin-once" : ""} /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RetreatModal;