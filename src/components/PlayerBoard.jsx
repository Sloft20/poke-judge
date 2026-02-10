import React from 'react';
import { User, Layers, Gift, Shield, Zap, Skull, Flame, EyeOff, PlusCircle, Sword, Play } from 'lucide-react';
import PokemonCard from './PokemonCard';
import { Card, Button, Badge } from './UI';
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
    
    // Cores Dinâmicas (Clean Tech)
    // Azul tecnológico para P1, Vermelho tático para P2
    const themeColor = isP1 ? 'blue' : 'red';
    const borderColor = isP1 ? 'border-blue-200' : 'border-red-200';
    const accentColor = isP1 ? 'text-blue-600' : 'text-red-600';
    const bgGradient = isP1 
        ? 'bg-gradient-to-br from-slate-50 to-blue-50/30' 
        : 'bg-gradient-to-br from-slate-50 to-red-50/30';

    // Renderiza os slots vazios do banco
    const renderBenchSlots = () => {
        const slots = [];
        
        // Pokémons existentes
        player.benchPokemon.forEach((poke, idx) => {
            slots.push(
                <div key={`bench-${idx}`} className="relative group transform hover:-translate-y-2 transition-transform duration-300">
                    <div onClick={() => onCardClick('BENCH', idx)}>
                        <PokemonCard card={poke} small={true} />
                    </div>
                    {/* Sombra holográfica em baixo */}
                    <div className={`absolute -bottom-2 left-2 right-2 h-1 rounded-full blur-sm ${isP1 ? 'bg-blue-400/30' : 'bg-red-400/30'}`}></div>
                </div>
            );
        });

        // Slots vazios (Placeholders Tech)
        for (let i = player.benchCount; i < 5; i++) {
            slots.push(
                <div 
                    key={`empty-${i}`} 
                    onClick={() => onAddPokemon('BENCH')}
                    className={`
                        w-24 h-36 rounded-xl border-2 border-dashed ${borderColor} 
                        flex flex-col items-center justify-center gap-2
                        bg-white/50 hover:bg-white transition-all cursor-pointer group
                    `}
                >
                    <div className={`p-2 rounded-full bg-slate-100 group-hover:bg-${themeColor}-50 transition-colors`}>
                        <PlusCircle size={20} className="text-slate-300 group-hover:text-slate-400"/>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vazio</span>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className={`
            relative rounded-3xl p-1 shadow-xl transition-all duration-500 mb-6
            ${isCurrent ? `ring-4 ring-${themeColor}-100 shadow-${themeColor}-200` : 'opacity-90 grayscale-[0.3]'}
        `}>
            {/* Container Principal "Clean Glass" */}
            <div className={`rounded-[1.4rem] ${bgGradient} border ${borderColor} overflow-hidden`}>
                
                {/* --- HEADER DO JOGADOR --- */}
                <div className="flex justify-between items-start p-5 bg-white/60 backdrop-blur-sm border-b border-slate-100">
                    
                    {/* Info do Jogador */}
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                            ${isP1 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}
                        `}>
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${accentColor}`}>
                                {player.name}
                                {isCurrent && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${themeColor}-400`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${themeColor}-500`}></span>
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${deckInfo.color} border-none shadow-sm text-[10px]`}>
                                    {deckInfo.name}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <Layers size={10}/> {player.deckCount} Cartas
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HUD Superior (Mão e Prêmios) */}
                    <div className="flex gap-3">
                         {/* Card de Prêmios */}
                        <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Prêmios</div>
                            <div onClick={actions.onOpenPrizes} className={isCurrent ? 'cursor-pointer hover:scale-105 transition-transform' : ''}>
                                <PrizeZone count={player.prizes} compact={true} />
                            </div>
                        </div>

                        {/* Card da Mão */}
                        <div className="flex flex-col justify-center items-center bg-white w-16 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-2xl font-black text-slate-700">{player.handCount}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Mão</span>
                        </div>
                    </div>
                </div>

                {/* --- ÁREA DE JOGO (GRID) --- */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* COLUNA DO ATIVO (Esquerda - Maior destaque) */}
                    <div className="md:col-span-4 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-2 px-2">
                             <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                <Shield size={10}/> Zona Ativa
                             </span>
                        </div>

                        {/* Slot do Pokémon Ativo (Plataforma) */}
                        <div className="relative w-full aspect-[3/4] flex justify-center items-center">
                            {/* Base Holográfica (Decoração) */}
                            <div className={`absolute bottom-4 w-32 h-8 rounded-[100%] blur-md opacity-40 ${isP1 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                            
                            {player.activePokemon ? (
                                <div className="relative z-10 w-full flex justify-center">
                                    <div onClick={() => onCardClick('ACTIVE')}>
                                        <PokemonCard 
                                            card={{
                                                ...player.activePokemon, 
                                                activeCondition: player.activeCondition, 
                                                isPoisoned: player.isPoisoned, 
                                                isBurned: player.isBurned
                                            }} 
                                            className="shadow-2xl hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    
                                    {/* Botões de Status Flutuantes */}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-full shadow-lg z-20">
                                         <button 
                                            className={`p-1.5 rounded-full transition-all ${player.isPoisoned ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500' : 'hover:bg-slate-100 text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isPoisoned: !player.isPoisoned })}
                                            title="Veneno"
                                         >
                                            <Skull size={14}/>
                                         </button>
                                         <button 
                                            className={`p-1.5 rounded-full transition-all ${player.isBurned ? 'bg-red-100 text-red-600 ring-2 ring-red-500' : 'hover:bg-slate-100 text-slate-300'}`}
                                            onClick={() => onUpdateStatus({ isBurned: !player.isBurned })}
                                            title="Queimadura"
                                         >
                                            <Flame size={14}/>
                                         </button>
                                         <select 
                                            className="text-[9px] font-bold uppercase bg-transparent outline-none text-slate-600 cursor-pointer"
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
                                        w-48 h-72 rounded-2xl border-2 border-dashed ${borderColor} bg-white/40 
                                        flex flex-col items-center justify-center gap-3 cursor-pointer 
                                        hover:bg-white hover:border-${themeColor}-400 transition-all
                                    `}
                                >
                                    <div className={`p-4 rounded-full bg-${themeColor}-50 text-${themeColor}-300`}>
                                        <PlusCircle size={32} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase text-${themeColor}-300`}>Adicionar Ativo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DO BANCO E AÇÕES (Direita) */}
                    <div className="md:col-span-8 flex flex-col gap-4">
                        
                        {/* Banco */}
                        <div className="bg-white/50 rounded-2xl border border-slate-100 p-4 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                    <User size={10}/> Banco ({player.benchCount}/5)
                                </span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                                {renderBenchSlots()}
                            </div>
                        </div>

                        {/* Painel de Controle (Ações) */}
                        {isCurrent && gameState.phase === PHASES.ACTION && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 animate-in slide-in-from-bottom-2">
                                <Button variant="ghost" className="bg-white border hover:border-blue-300 text-xs shadow-sm" onClick={actions.playItem}>Item</Button>
                                <Button variant="ghost" className="bg-white border hover:border-purple-300 text-xs shadow-sm" onClick={actions.playSupporter}>Apoiador</Button>
                                <Button variant="ghost" className="bg-white border hover:border-green-300 text-xs shadow-sm" onClick={() => onAddPokemon('BENCH')}>+ Básico</Button>
                                <Button variant="ghost" className="bg-white border hover:border-orange-300 text-xs shadow-sm" onClick={actions.retreat}>Recuar</Button>
                                
                                <Button variant="danger" className="col-span-2 shadow-md shadow-red-200" icon={Sword} onClick={actions.openAttackModal}>FASE DE COMBATE</Button>
                                <Button variant="secondary" className="col-span-2 text-red-700 bg-red-50 border-red-100 hover:bg-red-100" onClick={actions.reportKnockout}><Skull size={14} className="mr-1"/> Registrar Nocaute</Button>
                            </div>
                        )}
                        
                        {/* Estado Setup/Espera */}
                        {!isCurrent && (
                            <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <span className="text-xs font-bold text-slate-300 uppercase italic">Aguardando Turno...</span>
                            </div>
                        )}
                         {/* Mulligan Button no Setup */}
                        {gameState.phase === PHASES.SETUP && (
                             <Button variant="secondary" className="w-full" onClick={actions.handleMulligan}>Registrar Mulligan ({player.mulligans})</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBoard;