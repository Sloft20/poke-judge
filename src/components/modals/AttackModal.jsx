import React, { useState, useEffect } from 'react';
import { Swords, Shield, Zap, Crosshair, Edit2, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { Modal, Button } from '../UI'; 
import PokemonCard from '../PokemonCard'; 
import { ENERGY_TYPES } from '../../data/constants';

// Mapeamento Português -> Inglês (TCG Standard)
const ENERGY_TRANSLATION = {
    'fogo': 'fire',
    'água': 'water',
    'planta': 'grass',
    'elétrico': 'lightning',
    'psíquico': 'psychic',
    'luta': 'fighting',
    'escuridão': 'darkness',
    'metal': 'metal',
    'fada': 'fairy',
    'dragão': 'dragon',
    'incolor': 'colorless'
};

const AttackModal = ({ isOpen, onClose, attacker, defender, onConfirmAttack }) => {
    const [selectedAttack, setSelectedAttack] = useState(null);
    const [damageOverride, setDamageOverride] = useState(0);
    const [ignoreEnergy, setIgnoreEnergy] = useState(false); // NOVO: Permite forçar ataque

    useEffect(() => {
        if (isOpen) {
            setSelectedAttack(null);
            setDamageOverride(0);
            setIgnoreEnergy(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedAttack && attacker && defender) {
            const calculated = calculateDamage(selectedAttack);
            setDamageOverride(calculated);
        }
    }, [selectedAttack, attacker, defender]);

    if (!attacker || !defender) return null;

    // --- LÓGICA DE ENERGIA COM TRADUÇÃO ---
    const hasSufficientEnergy = (attackCost) => {
        if (ignoreEnergy) return true; // Se o modo Juiz estiver ativo, ignora tudo
        if (!attackCost || attackCost.length === 0) return true;
        
        // 1. Traduz e normaliza as energias que estão no Pokémon
        const attached = (attacker.energy || []).map(e => {
            const lower = e.toLowerCase();
            return ENERGY_TRANSLATION[lower] || lower; // Tenta traduzir, se não der, usa o original
        });

        // 2. Traduz e normaliza o custo do ataque
        const cost = attackCost.map(c => {
            const lower = c.toLowerCase();
            return ENERGY_TRANSLATION[lower] || lower;
        });

        // 3. Algoritmo de verificação
        for (let i = cost.length - 1; i >= 0; i--) {
            const typeNeeded = cost[i];
            if (typeNeeded !== 'colorless') {
                const indexFound = attached.indexOf(typeNeeded);
                if (indexFound !== -1) {
                    attached.splice(indexFound, 1); // Consome energia
                    cost.splice(i, 1); // Remove do custo
                } else {
                    return false; // Falta energia específica
                }
            }
        }

        // 4. Verifica custo incolor com o que sobrou
        const colorlessNeeded = cost.filter(c => c === 'colorless').length;
        if (attached.length >= colorlessNeeded) {
            return true;
        }

        return false;
    };

    const calculateDamage = (attack) => {
        if (!attack || !attack.damage) return 0;
        let damageString = attack.damage.toString().replace(/\D/g, ''); 
        let damage = parseInt(damageString) || 0;
        
        if (defender.weakness && defender.weakness.type === attacker.type) {
            damage *= 2;
        }
        if (defender.resistance && defender.resistance.type === attacker.type) {
            damage = Math.max(0, damage - 30);
        }
        return damage;
    };

    const handleAttack = () => {
        if (selectedAttack) {
            onConfirmAttack(selectedAttack, parseInt(damageOverride));
            onClose();
        }
    };

    const canAfford = selectedAttack ? hasSufficientEnergy(selectedAttack.cost) : false;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="FASE DE COMBATE" maxWidth="max-w-4xl">
            <div className="flex flex-col gap-6 relative">
                
                {/* --- MODO JUIZ (OVERRIDE) --- */}
                <div className="absolute top-0 right-12 z-20">
                    <button 
                        onClick={() => setIgnoreEnergy(!ignoreEnergy)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                            ignoreEnergy 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 animate-pulse' 
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                    >
                        {ignoreEnergy ? <Unlock size={10}/> : <Lock size={10}/>}
                        Ignorar Energia (Juiz)
                    </button>
                </div>

                {/* --- ARENA VS --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
                    
                     {/* LADO ESQUERDO: ATACANTE */}
                     <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                        <span className="text-cyan-400 font-black tracking-widest text-xs uppercase flex items-center gap-2">
                            <Crosshair size={14}/> Atacante
                        </span>
                        <div className="relative group scale-90 md:scale-100 transition-transform">
                             <PokemonCard card={attacker} className="w-40 h-56 shadow-2xl relative" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold text-sm">{attacker.name}</h3>
                             {/* VISUALIZADOR DE ENERGIA (DEBUG) */}
                            <div className="flex gap-1 justify-center mt-1 flex-wrap max-w-[120px] min-h-[12px]">
                                {(attacker.energy || []).map((e, i) => {
                                    // Tenta encontrar a cor baseada no nome traduzido ou original
                                    const translated = ENERGY_TRANSLATION[e.toLowerCase()] || e.toLowerCase();
                                    // Procura no objeto ENERGY_TYPES pela chave em inglês (ex: Fire) ou tenta a chave direta
                                    const typeKey = Object.keys(ENERGY_TYPES).find(k => k.toLowerCase() === translated);
                                    const colorClass = typeKey ? ENERGY_TYPES[typeKey].color : 'bg-gray-500';
                                    
                                    return (
                                        <div key={i} className={`w-3 h-3 rounded-full ${colorClass} border border-black/50 shadow-sm`} title={e}></div>
                                    );
                                })}
                                {(attacker.energy || []).length === 0 && (
                                    <span className="text-[9px] text-red-500 font-mono bg-red-900/20 px-1 rounded">
                                        ⚠ 0 Energias Detectadas
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CENTRO: INPUT DE DANO */}
                    <div className="flex flex-col items-center justify-center z-10 w-1/3 space-y-4">
                        <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-600 drop-shadow-lg transform -skew-x-12">VS</div>
                        {selectedAttack ? (
                            <div className="flex flex-col items-center w-full animate-in zoom-in">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">Dano Final <Edit2 size={10}/></span>
                                <input 
                                    type="number"
                                    value={damageOverride}
                                    onChange={(e) => setDamageOverride(e.target.value)}
                                    className="bg-slate-800 border-2 border-slate-600 focus:border-red-500 text-white text-4xl font-black text-center w-32 rounded-lg p-2 shadow-inner focus:outline-none"
                                />
                            </div>
                        ) : (
                            <div className="text-slate-600 text-xs text-center italic opacity-50">Selecione um ataque</div>
                        )}
                    </div>

                    {/* LADO DIREITO: DEFENSOR */}
                    <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                        <span className="text-red-400 font-black tracking-widest text-xs uppercase flex items-center gap-2"><Shield size={14}/> Alvo</span>
                         <div className="relative group scale-90 md:scale-100">
                             <PokemonCard card={defender} className="w-40 h-56 shadow-2xl relative grayscale-[0.2]" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold text-sm">{defender.name}</h3>
                            <span className="text-xs text-slate-400 font-mono">HP: {defender.hp - (defender.damage || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* --- SELEÇÃO DE ATAQUE --- */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500"/> Ataques Disponíveis
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                        {(attacker.attacks || []).map((atk, idx) => {
                            const affordable = hasSufficientEnergy(atk.cost);
                            const isSelected = selectedAttack === atk;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAttack(atk)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left group relative overflow-hidden
                                        ${isSelected ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20 z-10' : 'border-slate-700 bg-slate-800 hover:bg-slate-750'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${affordable ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
                                        <div>
                                            <div className={`font-black text-sm flex items-center gap-2 ${isSelected ? 'text-red-400' : 'text-slate-200'}`}>
                                                {atk.name}
                                                {!affordable && !ignoreEnergy && <span className="text-[9px] bg-red-900 text-red-200 px-1.5 rounded border border-red-700 uppercase">Sem Energia</span>}
                                                {ignoreEnergy && <span className="text-[9px] bg-yellow-900 text-yellow-200 px-1.5 rounded border border-yellow-700 uppercase">Ignorado</span>}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {(atk.cost || []).map((c, i) => (
                                                    <div key={i} className={`w-3 h-3 rounded-full shadow-sm ${ENERGY_TYPES[c]?.color || 'bg-gray-400'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${isSelected ? 'text-red-400' : 'text-slate-500'}`}>{atk.damage || '-'}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- RODAPÉ DE AÇÃO --- */}
                <div className="flex justify-end gap-3 pt-2 items-center">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    
                    <div className="relative group/btn">
                        <Button 
                            variant="danger" 
                            onClick={handleAttack} 
                            disabled={!selectedAttack || (!canAfford && !ignoreEnergy)}
                            className={`
                                h-12 px-8 text-lg font-black tracking-widest shadow-lg shadow-red-500/20
                                ${(!selectedAttack || (!canAfford && !ignoreEnergy)) ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400' : 'hover:scale-105 transition-transform'}
                            `}
                            icon={(!selectedAttack || (!canAfford && !ignoreEnergy)) ? Lock : Swords}
                        >
                            CONFIRMAR ({damageOverride})
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AttackModal;