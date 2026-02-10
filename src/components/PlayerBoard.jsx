import React from 'react';
import { User, Layers, Shield, Skull, Flame, PlusCircle, Sword, Clock } from 'lucide-react';
import PokemonCard from './PokemonCard';
import { Button } from './UI';
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
        ? 'bg-gradient-to-br from-slate-50 to-blue-50/30' 
        : 'bg-gradient-to-br from-slate-50 to-red-50/30';

    // Renderiza os slots do banco
    const renderBenchSlots = () => {
        const slots = [];
        
        // Pokémons existentes
        player.benchPokemon.forEach((poke, idx) => {
            slots.push(
                <div key={`bench-${idx}`} className="relative group transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                    <div onClick={() => onCardClick('BENCH', idx)}>
                        <PokemonCard card={poke} small={true} className="w-28 h-38 shadow-md hover:shadow-xl transition-shadow" />
                    </div>
                    {/* Sombra holográfica na base */}
                    <div className={`absolute -bottom-2 left-2 right-2 h-1.5 rounded-full blur-sm opacity-60 ${isP1 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                </div>
            );
        });

        // Slots vazios
        for (let i = player.benchCount; i < 5; i++) {
            slots.push(
                <div 
                    key={`empty-${i}`} 
                    onClick={() => onAddPokemon('BENCH')}
                    className={`
                        w-28 h-32 rounded-xl border-2 border-dashed ${borderColor} 
                        flex flex-col items-center justify-center gap-2
                        bg-white/40 hover:bg-white transition-all cursor-pointer group
                    `}
                >
                    <div className={`p-2 rounded-full bg-slate-50 group-hover:bg-${themeColor}-50 transition-colors`}>
                        <PlusCircle size={24} className="text-slate-300 group-hover:text-slate-400"/>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vazio</span>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className={`
            relative rounded-3xl shadow-md transition-all duration-500 mb-5
            ${isCurrent ? `ring-2 ring-${themeColor}-200 shadow-lg` : 'opacity-85 grayscale-[0.1]'}
        `}>
            {/* Container Principal */}
            <div className={`rounded-2xl ${bgGradient} border ${borderColor} overflow-hidden`}>
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center px-5 py-3 bg-white/70 backdrop-blur-sm border-b border-slate-100 h-16">
                    
                    {/* Info do Jogador */}
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shadow-sm
                            ${isP1 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}
                        `}>
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className={`text-base font-black uppercase tracking-tight flex items-center gap-2 ${accentColor}`}>
                                {player.name}
                                {isCurrent && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${themeColor}-400`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${themeColor}-500`}></span>
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${deckInfo.color || 'bg-gray-100'}`}>
                                    {deckInfo.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Layers size={10}/> {player.deckCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* HUD Superior */}
                    <div className="flex gap-3 h-full items-center">
                        <div className="flex flex-col items-center justify-center bg-white px-3 py-1 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all h-12" onClick={actions.onOpenPrizes}>
                            <span className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Prêmios</span>
                            <div className="flex gap-1">
                                {Array.from({length: player.prizes}).map((_, i) => (
                                    <div key={i} className={`w-2.5 h-3.5 rounded-sm shadow-sm ${isP1 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center bg-white w-14 h-12 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xl font-black text-slate-700 leading-none">{player.handCount}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Mão</span>
                        </div>
                    </div>
                </div>

                {/* --- ÁREA DE JOGO --- */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* COLUNA DO ATIVO */}
                    <div className="md:col-span-3 flex flex-col items-center border-r border-slate-200/50 pr-4">
                        <div className="w-full flex justify-between items-center mb-2 px-1">
                             <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                <Shield size={12}/> Zona Ativa
                             </span>
                        </div>

                        {/* Slot do Pokémon Ativo */}
                        <div className="relative w-full flex flex-col items-center">
                            {/* Base Decorativa */}
                            <div className={`absolute top-56 w-32 h-6 rounded-[100%] blur-md opacity-30 ${isP1 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                            
                            {player.activePokemon ? (
                                <>
                                    <div onClick={() => onCardClick('ACTIVE')} className="relative z-10">
                                        <PokemonCard 
                                            card={{
                                                ...player.activePokemon, 
                                                activeCondition: player.activeCondition, 
                                                isPoisoned: player.isPoisoned, 
                                                isBurned: player.isBurned
                                            }} 
                                            className="w-44 h-60 shadow-xl hover:scale-[1.02] transition-transform duration-200"
                                        />
                                    </div>
                                    
                                    {/* Botões de Status */}
                                    <div className="mt-3 flex gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 p-2 rounded-xl shadow-sm z-10 items-center justify-center w-auto whitespace-nowrap">
                                         <button 
                                            className={`p-1.5 rounded-full transition-all ${player.isPoisoned ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500 shadow-sm' : 'hover:bg-slate-100 text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isPoisoned: !player.isPoisoned })}
                                            title="Veneno"
                                         >
                                            <Skull size={16}/>
                                         </button>
                                         <button 
                                            className={`p-1.5 rounded-full transition-all ${player.isBurned ? 'bg-red-100 text-red-600 ring-2 ring-red-500 shadow-sm' : 'hover:bg-slate-100 text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isBurned: !player.isBurned })}
                                            title="Queimadura"
                                         >
                                            <Flame size={16}/>
                                         </button>
                                         
                                         <div className="h-6 w-px bg-slate-200 mx-1"></div>

                                         <select 
                                            className="text-[10px] font-bold uppercase bg-transparent outline-none text-slate-600 cursor-pointer w-auto min-w-[80px] pr-1 py-1"
                                            value={player.activeCondition}
                                            onChange={(e) => onUpdateStatus({ activeCondition: e.target.value })}
                                         >
                                            {Object.values(CONDITIONS).map(c => (
                                                <option key={c} value={c}>
                                                    {c === 'NONE' ? 'NORMAL' : c}
                                                </option>
                                            ))}
                                         </select>
                                    </div>
                                </>
                            ) : (
                                <div 
                                    onClick={() => onAddPokemon('ACTIVE')}
                                    className={`
                                        w-44 h-60 rounded-2xl border-2 border-dashed ${borderColor} bg-white/50 
                                        flex flex-col items-center justify-center gap-3 cursor-pointer 
                                        hover:bg-white hover:border-${themeColor}-400 transition-all shadow-sm z-10
                                    `}
                                >
                                    <div className={`p-4 rounded-full bg-${themeColor}-50 text-${themeColor}-300 shadow-sm`}>
                                        <PlusCircle size={28} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase text-${themeColor}-400`}>Adicionar Ativo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DO BANCO E AÇÕES */}
                    <div className="md:col-span-9 flex flex-col justify-between gap-4 pl-2">
                        
                        {/* AQUI ESTÁ A MUDANÇA:
                           1. Usei 'flex-1' para o container crescer e ocupar o espaço.
                           2. Adicionei 'flex items-center' no interior para centralizar verticalmente.
                           3. Aumentei 'min-h' para garantir altura.
                           4. Mudei 'gap-3' para 'gap-6' (mais espaço entre cartas).
                        */}
                        <div className="bg-white/60 rounded-2xl border border-slate-100 p-3 shadow-inner flex flex-col flex-1 min-h-[180px]">
                            <div className="mb-1 pl-1 flex justify-between items-center shrink-0">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                    <User size={12}/> Banco ({player.benchCount}/5)
                                </span>
                            </div>
                            
                            {/* Container das Cartas - Centralizado Verticalmente e com mais espaço */}
                            <div className="flex-1 flex items-center gap-6 overflow-x-auto custom-scrollbar justify-start lg:justify-center px-4 py-2">
                                {renderBenchSlots()}
                            </div>
                        </div>

                        {/* Painel de Ações */}
                        {isCurrent && gameState.phase === PHASES.ACTION ? (
                            <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-1 shrink-0">
                                <Button variant="ghost" className="bg-white border border-slate-200 hover:border-blue-300 h-10 text-xs font-bold shadow-sm" onClick={actions.playItem}>Item</Button>
                                <Button variant="ghost" className="bg-white border border-slate-200 hover:border-purple-300 h-10 text-xs font-bold shadow-sm" onClick={actions.playSupporter}>Apoiador</Button>
                                <Button variant="ghost" className="bg-white border border-slate-200 hover:border-green-300 h-10 text-xs font-bold shadow-sm" onClick={() => onAddPokemon('BENCH')}>+ Básico</Button>
                                <Button variant="ghost" className="bg-white border border-slate-200 hover:border-orange-300 h-10 text-xs font-bold shadow-sm" onClick={actions.retreat}>Recuar</Button>
                                
                                <Button variant="danger" className="col-span-2 h-11 text-sm font-black shadow-md shadow-red-100/50" icon={Sword} onClick={actions.openAttackModal}>FASE DE COMBATE</Button>
                                <Button variant="secondary" className="col-span-2 h-11 text-sm font-bold border-red-100 text-red-700 bg-red-50 hover:bg-red-100" onClick={actions.reportKnockout}><Skull size={16} className="mr-2"/> Registrar Nocaute</Button>
                            </div>
                        ) : (
                            !isCurrent && (
                                <div className="h-24 flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 shrink-0">
                                    <span className="text-xs font-bold text-slate-400 uppercase italic flex items-center gap-2">
                                        <Clock size={16} className="animate-pulse"/> Aguardando Turno do Oponente...
                                    </span>
                                </div>
                            )
                        )}
                        
                        {/* Mulligan */}
                        {gameState.phase === PHASES.SETUP && (
                             <Button variant="secondary" className="w-full h-10 text-xs font-bold border-slate-300 shrink-0" onClick={actions.handleMulligan}>Registrar Mulligan ({player.mulligans})</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBoard;