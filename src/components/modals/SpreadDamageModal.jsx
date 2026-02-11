import React, { useState } from 'react';
import { Target, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '../UI';
import PokemonCard from '../PokemonCard';

const SpreadDamageModal = ({ isOpen, onClose, opponentBench, maxCounters = 6, onConfirm }) => {
    // Estado local para contar quanto dano vai em cada banco
    // Ex: { 0: 2, 1: 4 } (Index do banco : qtd de contadores)
    const [distribution, setDistribution] = useState({});

    // Total já distribuído
    const totalDistributed = Object.values(distribution).reduce((a, b) => a + b, 0);
    const remaining = maxCounters - totalDistributed;

    const handleAdjust = (index, delta) => {
        const current = distribution[index] || 0;
        
        // Validações
        if (delta > 0 && remaining <= 0) return; // Não pode passar do limite total
        if (delta < 0 && current <= 0) return; // Não pode ser negativo

        setDistribution(prev => ({
            ...prev,
            [index]: current + delta
        }));
    };

    const handleConfirm = () => {
        onConfirm(distribution);
        setDistribution({}); // Reseta ao confirmar
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Distribuir Dano (${remaining} Restantes)`} maxWidth="max-w-5xl">
            <div className="flex flex-col gap-6">
                
                <div className="bg-slate-800 p-4 rounded-lg text-center border border-slate-700">
                    <p className="text-slate-300 text-sm mb-2">Clique nos botões abaixo para colocar marcadores de dano.</p>
                    <div className="text-4xl font-black text-cyan-400">{remaining}</div>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Marcadores Restantes</span>
                </div>

                {/* LISTA DO BANCO INIMIGO */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                    {opponentBench.map((poke, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                            {/* Carta Miniatura */}
                            <div className="w-24 relative opacity-90 hover:opacity-100 transition-opacity">
                                <PokemonCard card={poke} className="w-full h-auto text-[8px]" />
                                {/* Overlay de Dano Atual */}
                                {(distribution[idx] || 0) > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-[1px]">
                                        <span className="text-3xl font-black text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">
                                            {(distribution[idx] * 10)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Controles (+ / -) */}
                            <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1 border border-slate-700">
                                <button 
                                    onClick={() => handleAdjust(idx, -1)}
                                    className="p-1 hover:bg-red-900/50 rounded text-red-400 disabled:opacity-30"
                                    disabled={(distribution[idx] || 0) <= 0}
                                >
                                    <Minus size={16}/>
                                </button>
                                <span className="font-mono text-white font-bold w-6 text-center">
                                    {distribution[idx] || 0}
                                </span>
                                <button 
                                    onClick={() => handleAdjust(idx, 1)}
                                    className="p-1 hover:bg-green-900/50 rounded text-green-400 disabled:opacity-30"
                                    disabled={remaining <= 0}
                                >
                                    <Plus size={16}/>
                                </button>
                            </div>
                            <span className="text-xs text-slate-400 truncate w-full text-center">{poke.name}</span>
                        </div>
                    ))}

                    {opponentBench.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-500 italic">
                            Oponente não tem Pokémon no banco para receber dano.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleConfirm}
                        disabled={totalDistributed === 0 && remaining > 0} // Obriga a distribuir algo? (opcional)
                        icon={CheckCircle2}
                    >
                        CONFIRMAR DISTRIBUIÇÃO
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SpreadDamageModal;