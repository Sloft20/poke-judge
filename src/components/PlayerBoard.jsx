import React from 'react';
import { User, Layers, Gift, Shield, Zap, Skull, Flame, PlusCircle, Sword } from 'lucide-react';
import PokemonCard from './PokemonCard';
import { Button, Badge } from './UI';
import PrizeZone from './PrizeZone';
import { CONDITIONS, PHASES } from '../data/constants';

const PlayerBoard = ({ 
    player, 
    index, 
    gameState, 
    deckInfo, 
    onCardClick, 
    onAddPokemon, 
    onUpdateStatus, 
    actions 
}) => {
    const isP1 = index === 0;
    const isCurrent = gameState.currentPlayerIndex === index;
    
    // Cores Dinâmicas
    const themeColor = isP1 ? 'blue' : 'red';
    const borderColor = isP1 ? 'border-blue-200' : 'border-red-200';
    const accentColor = isP1 ? 'text-blue-600' : 'text-red-600';
    const bgGradient = isP1 
        ? 'bg-gradient-to-br from-slate-50 to-blue-50/20' 
        : 'bg-gradient-to-br from-slate-50 to-red-50/20';

    // Renderiza os slots do banco (Agora menores: w-20 em vez de w-24)
    const renderBenchSlots = () => {
        const slots = [];
        
        // Pokémons existentes
        player.benchPokemon.forEach((poke, idx) => {
            slots.push(
                <div key={`bench-${idx}`} className="relative group transform hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                    <div onClick={() => onCardClick('BENCH', idx)}>
                        {/* Forçamos o small={true} para garantir tamanho reduzido */}
                        <PokemonCard card={poke} small={true} className="w-20 h-28" />
                    </div>
                    {/* Sombra holográfica */}
                    <div className={`absolute -bottom-1 left-1 right-1 h-0.5 rounded-full blur-sm ${isP1 ? 'bg-blue-400/30' : 'bg-red-400/30'}`}></div>
                </div>
            );
        });

        // Slots vazios (Placeholders Compactos)
        for (let i = player.benchCount; i < 5; i++) {
            slots.push(
                <div 
                    key={`empty-${i}`} 
                    onClick={() => onAddPokemon('BENCH')}
                    className={`
                        w-20 h-28 rounded-lg border border-dashed ${borderColor} 
                        flex flex-col items-center justify-center gap-1
                        bg-white/40 hover:bg-white transition-all cursor-pointer group
                    `}
                >
                    <div className={`p-1.5 rounded-full bg-slate-50 group-hover:bg-${themeColor}-50 transition-colors`}>
                        <PlusCircle size={16} className="text-slate-300 group-hover:text-slate-400"/>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Vazio</span>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className={`
            relative rounded-2xl shadow-sm transition-all duration-500 mb-3
            ${isCurrent ? `ring-2 ring-${themeColor}-100 shadow-md` : 'opacity-80 grayscale-[0.2] scale-[0.99]'}
        `}>
            {/* Container Principal Compacto */}
            <div className={`rounded-xl ${bgGradient} border ${borderColor} overflow-hidden`}>
                
                {/* --- HEADER COMPACTO --- */}
                <div className="flex justify-between items-center px-4 py-2 bg-white/60 backdrop-blur-sm border-b border-slate-100 h-14">
                    
                    {/* Info do Jogador */}
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center shadow-sm
                            ${isP1 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}
                        `}>
                            <User size={18} />
                        </div>
                        <div>
                            <h2 className={`text-sm font-black uppercase tracking-tight flex items-center gap-2 ${accentColor}`}>
                                {player.name}
                                {isCurrent && (
                                    <span className="flex h-1.5 w-1.5 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${themeColor}-400`}></span>
                                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-${themeColor}-500`}></span>
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 rounded-sm ${deckInfo.color || 'bg-gray-100'}`}>
                                    {deckInfo.name}
                                </span>
                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                    <Layers size={9}/> {player.deckCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* HUD Superior (Mão e Prêmios) */}
                    <div className="flex gap-2 h-full items-center">
                         {/* Card de Prêmios */}
                        <div className="flex flex-col items-center bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50" onClick={actions.onOpenPrizes}>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Prêmios</span>
                            <div className="flex gap-0.5">
                                {Array.from({length: player.prizes}).map((_, i) => (
                                    <div key={i} className={`w-2 h-3 rounded-sm ${isP1 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Card da Mão */}
                        <div className="flex flex-col justify-center items-center bg-white w-12 h-10 rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-base font-black text-slate-700 leading-none">{player.handCount}</span>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Mão</span>
                        </div>
                    </div>
                </div>

                {/* --- ÁREA DE JOGO (GRID) --- */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                    
                    {/* COLUNA DO ATIVO (Esquerda - 4 cols) */}
                    <div className="md:col-span-4 flex flex-col items-center border-r border-slate-100/50 pr-2">
                        <div className="w-full flex justify-between items-center mb-1">
                             <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                <Shield size={9}/> Zona Ativa
                             </span>
                        </div>

                        {/* Slot do Pokémon Ativo */}
                        <div className="relative w-full flex justify-center items-start min-h-[220px]">
                            {/* Base Decorativa */}
                            <div className={`absolute bottom-6 w-24 h-4 rounded-[100%] blur-md opacity-30 ${isP1 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                            
                            {player.activePokemon ? (
                                <div className="relative z-10">
                                    <div onClick={() => onCardClick('ACTIVE')}>
                                        {/* Carta Ativa levemente maior que o banco, mas contida */}
                                        <PokemonCard 
                                            card={{
                                                ...player.activePokemon, 
                                                activeCondition: player.activeCondition, 
                                                isPoisoned: player.isPoisoned, 
                                                isBurned: player.isBurned
                                            }} 
                                            className="w-40 h-56 shadow-lg hover:scale-[1.02] transition-transform duration-200"
                                        />
                                    </div>
                                    
                                    {/* Botões de Status (Compactos e Sobrepostos) */}
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-white border border-slate-200 p-1 rounded-full shadow-sm z-20 scale-90">
                                         <button 
                                            className={`p-1 rounded-full ${player.isPoisoned ? 'bg-purple-100 text-purple-600 ring-1 ring-purple-500' : 'text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isPoisoned: !player.isPoisoned })}
                                         >
                                            <Skull size={12}/>
                                         </button>
                                         <button 
                                            className={`p-1 rounded-full ${player.isBurned ? 'bg-red-100 text-red-600 ring-1 ring-red-500' : 'text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isBurned: !player.isBurned })}
                                         >
                                            <Flame size={12}/>
                                         </button>
                                         <select 
                                            className="text-[9px] font-bold uppercase bg-transparent outline-none text-slate-600 cursor-pointer w-16"
                                            value={player.activeCondition}
                                            onChange={(e) => onUpdateStatus({ activeCondition: e.target.value })}
                                         >
                                            {Object.values(CONDITIONS).map(c => <option key={c} value={c}>{c}</option>)}
                                         </select>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => onAddPokemon('ACTIVE')}
                                    className={`
                                        w-36 h-52 rounded-xl border-2 border-dashed ${borderColor} bg-white/40 
                                        flex flex-col items-center justify-center gap-2 cursor-pointer 
                                        hover:bg-white transition-all
                                    `}
                                >
                                    <div className={`p-3 rounded-full bg-${themeColor}-50 text-${themeColor}-300`}>
                                        <PlusCircle size={24} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase text-${themeColor}-300`}>+ Ativo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DO BANCO E AÇÕES (Direita - 8 cols) */}
                    <div className="md:col-span-8 flex flex-col justify-between gap-2">
                        
                        {/* Banco Compacto */}
                        <div className="bg-white/40 rounded-xl border border-slate-50 p-2 shadow-inner">
                            <div className="mb-1 pl-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">
                                    Banco ({player.benchCount}/5)
                                </span>
                            </div>
                            {/* Flex em vez de Grid para melhor ajuste */}
                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar justify-start md:justify-between">
                                {renderBenchSlots()}
                            </div>
                        </div>

                        {/* Painel de Ações Slim */}
                        {isCurrent && gameState.phase === PHASES.ACTION ? (
                            <div className="grid grid-cols-4 gap-1.5 animate-in slide-in-from-bottom-1">
                                <Button variant="ghost" className="bg-white border h-8 text-[10px] px-1" onClick={actions.playItem}>Item</Button>
                                <Button variant="ghost" className="bg-white border h-8 text-[10px] px-1" onClick={actions.playSupporter}>Apoiador</Button>
                                <Button variant="ghost" className="bg-white border h-8 text-[10px] px-1" onClick={() => onAddPokemon('BENCH')}>+ Básico</Button>
                                <Button variant="ghost" className="bg-white border h-8 text-[10px] px-1" onClick={actions.retreat}>Recuar</Button>
                                
                                <Button variant="danger" className="col-span-2 h-9 text-xs shadow-sm" icon={Sword} onClick={actions.openAttackModal}>COMBATE</Button>
                                <Button variant="secondary" className="col-span-2 h-9 text-xs border-red-100 text-red-600 bg-red-50 hover:bg-red-100" onClick={actions.reportKnockout}>NOCAUTE</Button>
                            </div>
                        ) : (
                            !isCurrent && (
                                <div className="h-16 flex items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase italic">Aguardando Oponente...</span>
                                </div>
                            )
                        )}
                        
                        {/* Mulligan (Só aparece no Setup) */}
                        {gameState.phase === PHASES.SETUP && (
                             <Button variant="secondary" className="w-full h-8 text-xs" onClick={actions.handleMulligan}>Registrar Mulligan ({player.mulligans})</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBoard;