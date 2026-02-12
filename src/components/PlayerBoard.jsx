import React from 'react';
import { User, Layers, Shield, Skull, Flame, PlusCircle, Sword, Clock, Anchor } from 'lucide-react';
import PokemonCard from './PokemonCard';
import { Button } from './UI';
import { CONDITIONS, PHASES } from '../data/constants';

// --- IMAGENS OFICIAIS DAS ENERGIAS ---
const ENERGY_IMAGES = {
    'Grass': 'https://archives.bulbagarden.net/media/upload/thumb/2/2e/Grass-attack.png/20px-Grass-attack.png',
    'Fire': 'https://archives.bulbagarden.net/media/upload/thumb/a/ad/Fire-attack.png/20px-Fire-attack.png',
    'Water': 'https://archives.bulbagarden.net/media/upload/thumb/1/11/Water-attack.png/20px-Water-attack.png',
    'Lightning': 'https://archives.bulbagarden.net/media/upload/thumb/0/04/Lightning-attack.png/20px-Lightning-attack.png',
    'Psychic': 'https://archives.bulbagarden.net/media/upload/thumb/e/ef/Psychic-attack.png/20px-Psychic-attack.png',
    'Fighting': 'https://archives.bulbagarden.net/media/upload/thumb/4/4c/Fighting-attack.png/20px-Fighting-attack.png',
    'Darkness': 'https://archives.bulbagarden.net/media/upload/thumb/8/8f/Darkness-attack.png/20px-Darkness-attack.png',
    'Metal': 'https://archives.bulbagarden.net/media/upload/thumb/f/f1/Metal-attack.png/20px-Metal-attack.png',
    'Dragon': 'https://archives.bulbagarden.net/media/upload/thumb/d/d7/Dragon-attack.png/20px-Dragon-attack.png',
    'Fairy': 'https://archives.bulbagarden.net/media/upload/thumb/c/c3/Fairy-attack.png/20px-Fairy-attack.png',
    'Colorless': 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/20px-Colorless-attack.png',
    'Ability': 'https://limitlesstcg.com/img/symbols/energy/ability.png'
};

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

    // --- NOVA FUNÇÃO: CALCULA O HP REAL (COM BUFFS) ---
    const calculateMaxHP = (pokemon) => {
        if (!pokemon) return 0;
        
        // 1. Pega o HP Base da carta
        let totalHP = parseInt(pokemon.hp);

        // 2. Verifica se tem ferramenta acoplada e aplica efeitos
        if (pokemon.attachedTool) {
            // Garante que pegamos o nome correto (seja objeto ou string)
            const toolName = typeof pokemon.attachedTool === 'object' 
                ? pokemon.attachedTool.name 
                : pokemon.attachedTool;

            // Lógica do Pingente da Bravura (Bravery Charm): +50 HP
            if (toolName === 'Pingente da Bravura' || toolName === 'Bravery Charm') {
                totalHP += 50;
            }
            
            // Adicione aqui outros itens que aumentam HP no futuro (ex: Capa de Gigante)
        }

        return totalHP;
    };

    // Renderiza os slots do banco
    const renderBenchSlots = () => {
        const slots = [];
        
        // Pokémons existentes
        player.benchPokemon.forEach((poke, idx) => {
            slots.push(
                <div key={`bench-${idx}`} className="relative group transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer shrink-0">
                    <div onClick={() => onCardClick('BENCH', idx)}>
                        <PokemonCard 
                            card={poke} 
                            location="bench" 
                            getMaxHP={calculateMaxHP} // Passando a calculadora para o banco
                            className="shadow-md hover:shadow-xl transition-shadow" 
                        />
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
                        w-[120px] h-[167px] md:w-[145px] md:h-[202px] rounded-xl border-2 border-dashed ${borderColor} 
                        flex flex-col items-center justify-center gap-2 shrink-0
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
                    
                    {/* COLUNA DO ATIVO + HUD DO JUIZ */}
                    <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center border-r border-slate-200/50 pr-4">
                        <div className="w-full flex justify-between items-center mb-2 px-1">
                             <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                <Shield size={12}/> Zona Ativa
                             </span>
                        </div>

                        {/* Area Flexível: Carta + Painel */}
                        <div className="relative w-full flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center gap-4">
                            
                            {player.activePokemon ? (
                                <>
                                    {/* 1. A CARTA */}
                                    <div onClick={() => onCardClick('ACTIVE')} className="relative z-10 group cursor-pointer shrink-0">
                                        <PokemonCard 
                                            card={{
                                                ...player.activePokemon, 
                                                activeCondition: player.activeCondition, 
                                                isPoisoned: player.isPoisoned, 
                                                isBurned: player.isBurned
                                            }} 
                                            location="active" 
                                            getMaxHP={calculateMaxHP} // Passando a calculadora para o Ativo
                                            className="shadow-2xl hover:scale-[1.01] transition-transform duration-200"
                                        />
                                        
                                        {/* Botões de Status Rápidos (Mobile) */}
                                        <div className="mt-2 flex gap-2 justify-center lg:hidden">
                                             <button 
                                                className={`p-1.5 rounded-full transition-all ${player.isPoisoned ? 'bg-purple-100 text-purple-600 ring-1 ring-purple-500' : 'bg-white border border-slate-200 text-slate-300'}`}
                                                onClick={() => onUpdateStatus({ isPoisoned: !player.isPoisoned })}
                                             >
                                                <Skull size={14}/>
                                             </button>
                                             <button 
                                                className={`p-1.5 rounded-full transition-all ${player.isBurned ? 'bg-red-100 text-red-600 ring-1 ring-red-500' : 'bg-white border border-slate-200 text-slate-300'}`}
                                                onClick={() => onUpdateStatus({ isBurned: !player.isBurned })}
                                             >
                                                <Flame size={14}/>
                                             </button>
                                        </div>
                                    </div>

                                    {/* 2. O PAINEL DO JUIZ (HUD) */}
                                    <div className="w-full max-w-[160px] bg-slate-900/90 border border-slate-700 rounded-xl p-2 shadow-xl backdrop-blur-md flex flex-col gap-2 animate-in slide-in-from-left-2 shrink-0">
                                        
                                        <div className="border-b border-slate-700 pb-0.5 mb-0.5">
                                            <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">
                                                Dados de Combate
                                            </span>
                                        </div>

                                        {/* A. ENERGIAS (Com Imagens Oficiais) */}
                                        <div className="bg-black/40 rounded-lg p-1.5">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[9px] text-slate-300 font-bold uppercase">Energias</span>
                                                <span className="text-[9px] bg-slate-700 text-white px-1.5 rounded font-mono leading-none">
                                                    {player.activePokemon.attachedEnergy?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                 {(player.activePokemon.attachedEnergy || []).map((energy, idx) => {
                                                     const imgUrl = ENERGY_IMAGES[energy] || ENERGY_IMAGES['Colorless'];
                                                     return (
                                                        <div key={idx} title={energy} className="w-5 h-5 transition-transform hover:scale-110 relative">
                                                            <img 
                                                                src={imgUrl} 
                                                                alt={energy}
                                                                className="w-full h-full object-contain drop-shadow-sm"
                                                            />
                                                        </div>
                                                     );
                                                 })}
                                                 {(!player.activePokemon.attachedEnergy || player.activePokemon.attachedEnergy.length === 0) && (
                                                     <span className="text-[8px] text-slate-600 italic">Vazio</span>
                                                 )}
                                            </div>
                                        </div>

                                        {/* B. CONDIÇÃO ESPECIAL */}
                                        <div className={`
                                            rounded-lg p-1.5 border text-center transition-colors duration-300 flex flex-col gap-0.5
                                            ${player.activeCondition && player.activeCondition !== 'NONE' 
                                                ? 'bg-red-900/20 border-red-500/30' 
                                                : 'bg-slate-800/50 border-slate-700'}
                                        `}>
                                            <span className="text-[8px] uppercase text-slate-500 block">Status</span>
                                            <select 
                                                className={`
                                                    bg-transparent text-center font-black uppercase text-[10px] outline-none cursor-pointer w-full leading-tight
                                                    ${player.activeCondition && player.activeCondition !== 'NONE' ? 'text-red-400' : 'text-slate-400'}
                                                `}
                                                value={player.activeCondition}
                                                onChange={(e) => onUpdateStatus({ activeCondition: e.target.value })}
                                            >
                                                 {Object.values(CONDITIONS).map(c => (
                                                    <option key={c} value={c} className="bg-slate-900 text-slate-300">
                                                        {c === 'NONE' ? 'NORMAL' : c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* C. FERRAMENTA (ATUALIZADO: Visual Destacado) */}
                                        {player.activePokemon.attachedTool && (
                                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-1.5 flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-2">
                                                <div className="bg-blue-500/20 p-1 rounded-full">
                                                    <Anchor size={10} className="text-blue-400 shrink-0 animate-pulse"/>
                                                </div>
                                                <div className="overflow-hidden flex flex-col">
                                                    <span className="text-[7px] font-bold text-blue-300 uppercase tracking-wider leading-none">
                                                        Ferramenta
                                                    </span>
                                                    <span className="text-[9px] font-black text-white truncate block leading-tight shadow-black drop-shadow-md">
                                                        {typeof player.activePokemon.attachedTool === 'object' 
                                                            ? player.activePokemon.attachedTool.name 
                                                            : player.activePokemon.attachedTool}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                         {/* D. DANO TOTAL */}
                                         <div className="flex justify-between items-center px-0.5 mt-0.5 border-t border-white/5 pt-1.5">
                                            <span className="text-[8px] text-slate-500 font-bold uppercase">Dano Total</span>
                                            <span className="text-sm font-black text-red-500 leading-none">
                                                {player.activePokemon.damage || 0}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div 
                                    onClick={() => onAddPokemon('ACTIVE')}
                                    className={`
                                        w-[160px] h-[222px] md:w-[200px] md:h-[278px] rounded-2xl border-2 border-dashed ${borderColor} bg-white/50 
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
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between gap-4 pl-2">
                        
                        {/* Container do Banco */}
                        <div className="bg-white/60 rounded-2xl border border-slate-100 p-3 shadow-inner flex flex-col flex-1 min-h-[180px]">
                            <div className="mb-1 pl-1 flex justify-between items-center shrink-0">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                    <User size={12}/> Banco ({player.benchCount}/5)
                                </span>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-4 overflow-x-auto custom-scrollbar justify-start px-2 py-2">
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