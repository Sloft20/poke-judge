// src/components/GameLobby.jsx
import React from 'react';
import { Shield, User, Play, Trophy } from 'lucide-react';
import { Card } from './UI'; // Importando do arquivo novo
import PokemonCard from './PokemonCard'; // Importando o card que movemos antes
import { DECKS } from '../data/decks'; // Importando os dados

const GameLobby = ({ players, onUpdatePlayer, onStartGame, onShowRanking }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gray-100 rounded-full border border-gray-200 shadow-lg">
                             <Shield className="text-blue-600 w-12 h-12" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-gray-800 dark:text-white mb-2 drop-shadow-sm">
                        PokéJudge <span className="text-blue-500">Pro</span>
                    </h1>
                    <p className="text-gray-500 font-mono tracking-wide text-sm">Sistema de Arbitragem Competitiva</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Jogador 1 */}
                    <div className="space-y-5 p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-blue-600 border-b border-blue-200 pb-3">
                            <User size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Jogador 1</h2>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nickname</label>
                            <input 
                                type="text" 
                                value={players[0].name}
                                onChange={(e) => onUpdatePlayer(0, { name: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="Nome do Jogador"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deck Selecionado</label>
                            <select 
                                value={players[0].deckArchetype}
                                onChange={(e) => onUpdatePlayer(0, { deckArchetype: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                {Object.entries(DECKS).map(([key, val]) => (
                                    <option key={key} value={key}>{val.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                            <h3 className="font-bold text-xs text-gray-400 mb-3 uppercase tracking-widest">Deck Preview</h3>
                            {DECKS[players[0].deckArchetype].cards[0] && (
                                <div className="transform scale-90 hover:scale-100 transition-transform duration-300">
                                    <PokemonCard card={DECKS[players[0].deckArchetype].cards[0]} small={true} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Jogador 2 */}
                    <div className="space-y-5 p-6 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-red-600 border-b border-red-200 pb-3">
                            <User size={24} />
                            <h2 className="text-xl font-bold uppercase tracking-wider">Jogador 2</h2>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nickname</label>
                            <input 
                                type="text" 
                                value={players[1].name}
                                onChange={(e) => onUpdatePlayer(1, { name: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="Nome do Jogador"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deck Selecionado</label>
                            <select 
                                value={players[1].deckArchetype}
                                onChange={(e) => onUpdatePlayer(1, { deckArchetype: e.target.value })}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            >
                                {Object.entries(DECKS).map(([key, val]) => (
                                    <option key={key} value={key}>{val.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                            <h3 className="font-bold text-xs text-gray-400 mb-3 uppercase tracking-widest">Deck Preview</h3>
                            {DECKS[players[1].deckArchetype].cards[0] && (
                                <div className="transform scale-90 hover:scale-100 transition-transform duration-300">
                                    <PokemonCard card={DECKS[players[1].deckArchetype].cards[0]} small={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onStartGame}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl uppercase tracking-widest shadow-lg shadow-blue-200 transform transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 border border-blue-500"
                >
                    <Play size={28} fill="currentColor" />
                    Iniciar Partida
                </button>
                
                <button
                    onClick={onShowRanking}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl uppercase tracking-widest shadow-lg shadow-blue-200 transform transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 border border-blue-500 mt-2"
                >
                    <Trophy size={28} className="text-yellow-300" /> {/* Yellow Trophy */}
                    Ranking
                </button>
            </Card>
        </div>
    );
};

export default GameLobby;