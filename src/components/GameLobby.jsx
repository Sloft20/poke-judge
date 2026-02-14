import React, { useState, useEffect } from 'react';
import { User, Shield, Trophy, Play, Edit3, Layers } from 'lucide-react';
import PokemonCard from './PokemonCard';
import { DECKS } from '../data/decks'; 

// --- COMPONENTE DE INPUT OTIMIZADO (Resolve o bug do foco) ---
const PlayerNameInput = ({ value, onCommit, className, placeholder }) => {
    const [localValue, setLocalValue] = useState(value);

    // Sincroniza se o valor mudar externamente (ex: reset do jogo)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        // Só atualiza o pai se o valor for diferente
        if (localValue !== value) {
            onCommit(localValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Força o onBlur para salvar
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={className}
            placeholder={placeholder}
        />
    );
};

const GameLobby = ({ players, onUpdatePlayer, onStartGame, onShowRanking, availableDecks, onManageDecks }) => {
    
    // Garante que a lista de decks esteja disponível (Supabase ou Local)
    const deckList = (availableDecks && Object.keys(availableDecks).length > 0) ? availableDecks : DECKS;

    // Componente Interno para o Card de cada Jogador
    const PlayerSetup = ({ index }) => {
        const player = players[index];
        const isP1 = index === 0;
        
        // Cores temáticas (Azul vs Vermelho)
        const borderColor = isP1 ? 'border-blue-500' : 'border-red-500';
        const bgColor = isP1 ? 'bg-blue-50' : 'bg-red-50';
        const titleColor = isP1 ? 'text-blue-700' : 'text-red-700';
        const ringColor = isP1 ? 'focus:ring-blue-400' : 'focus:ring-red-400';
        const iconBg = isP1 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600';

        // Tenta pegar a imagem do deck selecionado
        const selectedDeck = deckList[player.deckArchetype];
        const deckImage = selectedDeck?.cards?.[0]?.image;

        return (
            <div className={`flex-1 relative bg-white rounded-2xl shadow-xl border-t-8 ${borderColor} p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01] duration-300`}>
                
                {/* Cabeçalho do Jogador */}
                <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                    <div className={`p-3 rounded-full ${iconBg}`}>
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className={`font-black text-xl uppercase tracking-tighter ${titleColor}`}>
                            {isP1 ? 'Desafiante 1' : 'Desafiante 2'}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Configuração de Perfil</p>
                    </div>
                </div>

                {/* Input de Nome (AGORA CORRIGIDO) */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nickname</label>
                    <PlayerNameInput 
                        value={player.name}
                        onCommit={(newName) => onUpdatePlayer(index, { name: newName })}
                        className={`w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold rounded-lg p-3 outline-none focus:ring-2 ${ringColor} transition-all`}
                        placeholder={`Nome do Jogador ${index + 1}`}
                    />
                </div>

                {/* Select de Deck */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Deck Selecionado</label>
                    <div className="relative">
                        <select 
                            value={player.deckArchetype}
                            onChange={(e) => onUpdatePlayer(index, { deckArchetype: e.target.value })}
                            className={`w-full appearance-none bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-lg p-3 pr-10 outline-none focus:ring-2 ${ringColor} transition-all cursor-pointer shadow-sm`}
                        >
                            {Object.entries(deckList).map(([id, deck]) => (
                                <option key={id} value={id}>
                                    {deck.name} ({deck.cards?.length || 0} cartas)
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                            <Layers size={18}/>
                        </div>
                    </div>
                </div>

                {/* Preview do Deck (Capa Melhorada) */}
                <div className={`mt-2 flex-1 ${bgColor} bg-opacity-30 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed ${isP1 ? 'border-blue-200' : 'border-red-200'} min-h-[220px] relative group p-4`}>
                    {deckImage ? (
                        <div className="relative transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                            {/* Sombra da carta */}
                            <div className="absolute inset-0 bg-black/20 blur-md rounded-lg transform translate-y-2"></div>
                            {/* Carta real */}
                            <PokemonCard card={selectedDeck.cards[0]} />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-4 flex flex-col items-center">
                            <Layers size={48} className="mb-2 opacity-50"/>
                            <p className="text-xs font-bold uppercase">Sem imagem</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            
            {/* Background decorativo sutil */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-6xl space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
                
                {/* Header Principal */}
                <div className="text-center space-y-2 mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-5 rounded-full shadow-2xl shadow-blue-900/50 transform hover:scale-110 transition-transform duration-500">
                            <Shield className="text-blue-600" size={56} fill="currentColor" fillOpacity={0.1} />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">
                        PokéJudge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Pro</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs font-mono">
                        Sistema de Arbitragem Competitiva v3.0
                    </p>
                    
                    <button 
                        onClick={onManageDecks}
                        className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-slate-700 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        <Edit3 size={12}/> Gerenciar Banco de Decks
                    </button>
                </div>

                {/* Área dos Jogadores (Lado a Lado com VS) */}
                <div className="flex flex-col md:flex-row gap-8 relative items-stretch">
                    
                    <PlayerSetup index={0} />

                    {/* Elemento VS Central */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center pointer-events-none">
                        <div className="bg-slate-900 p-3 rounded-full">
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-800 transform rotate-12">
                                <span className="text-white font-black italic text-2xl drop-shadow-md">VS</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Divisor Mobile */}
                    <div className="md:hidden flex justify-center -my-6 z-20 relative">
                        <div className="bg-slate-900 p-2 rounded-full">
                            <div className="bg-yellow-500 w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-800 text-white font-black text-xl">VS</div>
                        </div>
                    </div>

                    <PlayerSetup index={1} />
                </div>

                {/* Botões de Ação (Footer Gigante) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    <button 
                        onClick={onStartGame}
                        className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-6 rounded-2xl font-black text-2xl uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
                    >
                        {/* Brilho animado no fundo */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        
                        <Play size={32} className="fill-current group-hover:scale-110 transition-transform"/> 
                        <span>Iniciar Partida</span>
                    </button>

                    <button 
                        onClick={onShowRanking}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-6 rounded-2xl font-bold text-lg uppercase tracking-widest shadow-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Trophy size={28} className="text-yellow-500 group-hover:rotate-12 transition-transform"/> 
                        Ranking Global
                    </button>
                </div>

            </div>
        </div>
    );
};

export default GameLobby;
