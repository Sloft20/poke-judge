import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sword, RefreshCw, AlertTriangle, BookOpen, 
  History, User, CheckCircle, Ban, Skull, Clock,
  ChevronRight, RotateCcw, PlayCircle, PlusCircle, ArrowUpCircle, Layers,
  Settings, Image as ImageIcon, X,
  ChevronsUp, GitMerge, Sparkles, Briefcase,
  Minus, Plus, Crosshair, Coins, Zap, Download, Trophy, BarChart2,
  Users, Play, Pause, Trash2, Edit2, Gift,Edit3,
  // Novos ícones de energia importados do Lucide conforme solicitado
  Flame, Droplets, Leaf, Eye, Dumbbell, Moon, Crown, Circle, Star, Bolt, Origami 
} from 'lucide-react';
import { supabase } from './supabaseClient'; // ADICIONE ESTA LINHA AQUI
import { DECKS } from './data/decks'; 
import { PHASES, CONDITIONS, TOOLS, ENERGY_TYPES, RULES_DB } from './data/constants';
import PokemonCard from './components/PokemonCard';
import { Card, Button, Badge } from './components/UI';
import GameLobby from './components/GameLobby';
import PrizeZone from './components/PrizeZone';



// --- 4. FUNÇÕES UTILITÁRIAS ---

const checkEnergyCost = (cost, attachedEnergies) => {
    if (!cost) return true;
    if (cost[0] === 'Ability') return true;

    const available = [...attachedEnergies];
    
    for (let c of cost) {
        if (c === 'Colorless') {
            if (available.length > 0) {
                available.pop(); 
            } else {
                return false;
            }
        } else {
            const index = available.indexOf(c);
            if (index !== -1) {
                available.splice(index, 1);
            } else {
                return false;
            }
        }
    }
    return true;
};

const calculateDamageModifiers = (attackerType, defenderWeakness, defenderResistance) => {
    let multiplier = 1;
    let modifier = 0;
    
    if (attackerType && defenderWeakness === attackerType) {
        multiplier = 2;
    }
    if (attackerType && defenderResistance === attackerType) {
        modifier = -30;
    }
    return { multiplier, modifier };
};

const calculateStats = () => {
  const history = JSON.parse(localStorage.getItem('pokejudge_history') || '[]');
  
  const deckStats = {};
  const playerStats = {};

  history.forEach(match => {
      // Decks
      [match.winnerDeck, match.loserDeck].forEach(deck => {
          if(!deckStats[deck]) deckStats[deck] = { plays: 0, wins: 0, name: DECKS[deck]?.name || deck };
          deckStats[deck].plays++;
      });
      if(deckStats[match.winnerDeck]) deckStats[match.winnerDeck].wins++;

      // Players
      [match.winnerName, match.loserName].forEach(player => {
          if(!playerStats[player]) playerStats[player] = { plays: 0, wins: 0 };
          playerStats[player].plays++;
      });
      if(playerStats[match.winnerName]) playerStats[match.winnerName].wins++;
  });

  return { deckStats, playerStats };
};



const RankingModal = ({ onClose }) => {
    const [tab, setTab] = useState('decks');
    const [selectedMatchLogs, setSelectedMatchLogs] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Busca os dados reais do Supabase
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error(error);
            } else {
                setMatches(data || []); 
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    // 2. FUNÇÃO DE CÁLCULO EM TEMPO REAL: Substitui a antiga calculateStats()
    const calculateLiveStats = () => {
        const deckStats = {};
        const playerStats = {};

        matches.forEach(m => {
            // Processa Estatísticas de Decks
            if (!deckStats[m.winner_deck]) deckStats[m.winner_deck] = { name: m.winner_deck, wins: 0, plays: 0 };
            if (!deckStats[m.loser_deck]) deckStats[m.loser_deck] = { name: m.loser_deck, wins: 0, plays: 0 };
            
            deckStats[m.winner_deck].wins++;
            deckStats[m.winner_deck].plays++;
            deckStats[m.loser_deck].plays++;

            // Processa Estatísticas de Jogadores
            const wName = m.winner_name || "Desconhecido";
            const lName = m.loser_name || "Desconhecido";

            if (!playerStats[wName]) playerStats[wName] = { wins: 0, plays: 0 };
            if (!playerStats[lName]) playerStats[lName] = { wins: 0, plays: 0 };
            
            playerStats[wName].wins++;
            playerStats[wName].plays++;
            playerStats[lName].plays++;
        });

        return { deckStats, playerStats };
    };

    // 3. Gera as listas ordenadas baseadas nos dados do banco
    const { deckStats, playerStats } = calculateLiveStats();
    
    const sortedDecks = Object.values(deckStats).sort((a,b) => (b.wins/b.plays) - (a.wins/a.plays));
    const sortedPlayers = Object.entries(playerStats).map(([name, stat]) => ({name, ...stat})).sort((a,b) => (b.wins/b.plays) - (a.wins/a.plays));

    // O restante do seu código (return) permanece o mesmo...

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          {/* Fundo Branco e Estilo Light conforme a primeira foto */}
          <Card className="w-full max-w-2xl h-[85vh] flex flex-col bg-white border-gray-100 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 px-4 pt-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-800 uppercase tracking-tight">
                      <Trophy className="text-yellow-500" size={28}/> 
                      Ranking & Stats
                  </h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
              
              {/* Abas com fundo cinza claro */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 mx-4 rounded-lg border border-gray-200">
                  <button onClick={() => setTab('decks')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${tab === 'decks' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}>Decks Meta</button>
                  <button onClick={() => setTab('players')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${tab === 'players' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}>Jogadores</button>
                  <button onClick={() => setTab('history')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${tab === 'history' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500'}`}>Histórico</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
                  {tab === 'history' ? (
                      <div className="space-y-2">
                          {loading ? (
                              <p className="text-center py-10 text-gray-400 animate-pulse">Carregando histórico do Supabase...</p>
                          ) : matches.map((m, idx) => (
                              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-all">
                                  <div>
                                      <div className="text-[10px] text-gray-400 font-mono mb-1">{new Date(m.created_at).toLocaleString()}</div>
                                      <div className="text-sm font-bold text-gray-800"><span className="text-green-600">{m.winner_name}</span> vs {m.loser_name}</div>
                                      <div className="text-[10px] italic text-gray-500">{(DECKS[m.winner_deck]?.name || m.winner_deck)} vs {(DECKS[m.loser_deck]?.name || m.loser_deck)}</div>
                                  </div>
                                  <button onClick={() => setSelectedMatchLogs(m.game_logs)} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] uppercase font-bold border border-blue-100">Ver Log</button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                          <tbody className="text-gray-700">
                              {(tab === 'decks' ? sortedDecks : sortedPlayers).map((item, idx) => (
                                  <tr key={idx} className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl overflow-hidden border border-gray-200">
                                      <td className="px-4 py-3 font-bold border-l-4 border-blue-500 rounded-l-xl">{item.name}</td>
                                      <td className="px-4 py-3 text-center text-xs text-gray-500">{item.plays} partidas</td>
                                      <td className="px-4 py-3 text-center font-bold rounded-r-xl">
                                          <span className={`px-2 py-1 rounded-md text-[10px] ${((item.wins / item.plays) * 100) >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {((item.wins / item.plays) * 100).toFixed(1)}% WR
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </Card>

          {/* Sub-modal de Replay com Estilo Light Moderno */}
          {selectedMatchLogs && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-in zoom-in duration-200">
                  <Card className="w-full max-w-lg h-[75vh] flex flex-col bg-white border-gray-200 shadow-2xl rounded-2xl">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 p-4">
                          <h3 className="text-gray-800 font-bold flex items-center gap-2">
                              <History size={18} className="text-blue-500"/> Logs da Partida
                          </h3>
                          <button onClick={() => setSelectedMatchLogs(null)} className="text-gray-400 hover:text-red-500"><X/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 m-4 bg-gray-50 rounded-xl font-mono text-[11px] text-gray-700 leading-relaxed custom-scrollbar whitespace-pre-wrap border border-gray-200">
                          {selectedMatchLogs || "Nenhum log registrado para esta partida antiga."}
                      </div>
                      <div className="p-4 pt-0">
                          <Button variant="primary" className="w-full py-3" onClick={() => setSelectedMatchLogs(null)}>Voltar ao Ranking</Button>
                      </div>
                  </Card>
              </div>
          )}
      </div>
    );
};
// Função auxiliar para embaralhar (Fisher-Yates Shuffle)
const shuffleDeck = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- 7. APLICAÇÃO PRINCIPAL ---

export default function PokeJudgePro() {
  const [coinResult, setCoinResult] = useState(null);
  const [gameState, setGameState] = useState({
    phase: PHASES.LOBBY, 
    turnCount: 0,
    currentPlayerIndex: 0, 
    winner: null,
    setupComplete: false,
    startTime: null
  });

  const [gameTimer, setGameTimer] = useState(0); 
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeAlert, setPrizeAlert] = useState(null); // Estado para o overlay de prêmio
  const [retreatModal, setRetreatModal] = useState(null);

  const INITIAL_PLAYERS = [
    {
      id: 0,
      name: 'Jogador 1',
      deckArchetype: 'CHARIZARD', 
      prizes: 6,
      deck: [],
      hand: [],
      benchCount: 0, 
      activePokemon: null, 
      benchPokemon: [], 
      activeCondition: CONDITIONS.NONE,
      isPoisoned: false, // NEW
      isBurned: false, // NEW
      allowUnlimitedEnergy: false, // NEW
      allowRareCandy: false, // NEW
      energyAttachedThisTurn: false,
      supporterPlayedThisTurn: false,
      retreatedThisTurn: false,
      mulligans: 0
    },
    {
      id: 1,
      name: 'Jogador 2',
      deckArchetype: 'DRAGAPULT', 
      prizes: 6,
      deck: [],
      hand: [],
      benchCount: 0, 
      activePokemon: null, 
      benchPokemon: [], 
      activeCondition: CONDITIONS.NONE,
      isPoisoned: false, // NEW
      isBurned: false, // NEW
      allowUnlimitedEnergy: false, // NEW
      allowRareCandy: false, // NEW
      energyAttachedThisTurn: false,
      supporterPlayedThisTurn: false,
      retreatedThisTurn: false,
      mulligans: 0
    },
  ];

  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [logs, setLogs] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(null); 
  const [showEnergyModal, setShowEnergyModal] = useState(null); 
  const [showAttackModal, setShowAttackModal] = useState(false); 
  const [showToolModal, setShowToolModal] = useState(null); 
  const [damageConfirmation, setDamageConfirmation] = useState(null); 
  const [distributionModal, setDistributionModal] = useState(null);
  const [selectedCardAction, setSelectedCardAction] = useState(null); 
  const [searchRule, setSearchRule] = useState('');
  // --- SISTEMA DE DESFAZER (UNDO) ---
  const [history, setHistory] = useState([]);
  // --- GERENCIADOR DE DECKS (SUPABASE) ---
  const [showDeckManager, setShowDeckManager] = useState(false);
  const [availableDecks, setAvailableDecks] = useState(DECKS); // Começa com os padrões do arquivo

  // Função que vai no Banco e busca os decks novos
  const fetchDecksFromSupabase = async () => {
      try {
          const { data, error } = await supabase
              .from('decks')
              .select(`
                  id, name, color,
                  cards (*)
              `); // O (*) traz as cartas juntas
          
          if (error) throw error;

          if (data) {
              // Transforma a lista do banco no formato que o jogo entende (Objeto)
              const dbDecks = {};
              data.forEach(deck => {
                  dbDecks[deck.id] = {
                      name: deck.name,
                      color: deck.color || 'bg-gray-500',
                      cards: deck.cards || []
                  };
              });
              
              // Junta os decks oficiais (DECKS) com os do banco (dbDecks)
              setAvailableDecks({ ...DECKS, ...dbDecks });
          }
      } catch (error) {
          console.error("Erro ao carregar decks:", error);
      }
  };

  // Carrega os decks assim que o site abre
  useEffect(() => {
      fetchDecksFromSupabase();
  }, []);

  // Função auxiliar para restaurar ferramentas (objetos complexos)
  const rehydrateTools = (playerList) => {
      const fixPokemon = (poke) => {
          // Se tiver ferramenta, reconecta a lógica dela (função condition)
          if (poke && poke.attachedTool && !poke.attachedTool.condition) {
              const originalTool = TOOLS.find(t => t.id === poke.attachedTool.id);
              if (originalTool) return { ...poke, attachedTool: originalTool };
          }
          return poke;
      };

      return playerList.map(p => ({
          ...p,
          activePokemon: fixPokemon(p.activePokemon),
          benchPokemon: p.benchPokemon.map(fixPokemon)
      }));
  };

  const saveGameHistory = () => {
      setHistory(prev => {
          // Salva uma cópia profunda (Deep Copy) do estado atual
          const newHistory = [...prev, {
              players: JSON.parse(JSON.stringify(players)), 
              gameState: JSON.parse(JSON.stringify(gameState))
          }];
          // Limita a 10 passos para não travar o navegador
          if (newHistory.length > 10) return newHistory.slice(1);
          return newHistory;
      });
  };

  const handleUndo = () => {
      if (history.length === 0) {
          addLog("Nada para desfazer.", 'WARN');
          return;
      }
      
      // Pega o último estado salvo
      const lastState = history[history.length - 1];
      
      // Restaura Jogadores (reconectando lógica das ferramentas)
      setPlayers(rehydrateTools(lastState.players));
      
      // Restaura o Estado do Jogo (Fase, Turno, etc)
      setGameState(lastState.gameState);
      
      // Remove esse estado da pilha
      setHistory(prev => prev.slice(0, -1)); 
      
      addLog("↺ Ação desfeita! Voltando no tempo...", 'SUCCESS');
  };
  
  const logsContainerRef = useRef(null);

  useEffect(() => {
    if (logsContainerRef.current) {
        logsContainerRef.current.scrollTo({
            top: logsContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [logs]);

  // Timer Effect
  useEffect(() => {
      let interval;
      if (gameState.phase !== PHASES.LOBBY && gameState.phase !== PHASES.GAME_OVER && !isTimerPaused) {
          interval = setInterval(() => {
              setGameTimer(prev => prev + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [gameState.phase, isTimerPaused]);

  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- ENGINE: Lógica e Validações ---

  const addLog = (message, level = 'INFO', playerIndex = null) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const playerPrefix = playerIndex !== null ? `[${players[playerIndex].name}] ` : '';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setLogs(prev => [...prev, { id: uniqueId, time: timestamp, text: `${playerPrefix}${message}`, level }]);
  };

  const currentPlayer = players[gameState.currentPlayerIndex];
  const opponentPlayer = players[gameState.currentPlayerIndex === 0 ? 1 : 0];

  const updatePlayer = (index, updates) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[index] = { ...newPlayers[index], ...updates };
      return newPlayers;
    });
  };

  const handleStartGameFromLobby = () => {
      // 1. Preparar os Decks
      const newPlayers = players.map(p => {
          // Pega a lista de cartas do arquétipo escolhido
          const originalCards = DECKS[p.deckArchetype]?.cards || [];
          
          // O seu deck.js atual tem poucas cartas (ex: 5). 
          // Para simular um deck de 60, vamos duplicar as cartas até encher.
          let fullDeck = [];
          while (fullDeck.length < 60) {
              fullDeck = [...fullDeck, ...originalCards];
          }
          fullDeck = fullDeck.slice(0, 60); // Garante 60 cartas exatas
          
          // Embaralha
          const shuffledDeck = shuffleDeck(fullDeck);
          
          // Compra as 7 primeiras (Mão Inicial)
          const initialHand = shuffledDeck.splice(0, 7);
          
          return {
              ...p,
              deck: shuffledDeck, // O que sobrou (53 cartas)
              hand: initialHand,  // As 7 cartas na mão
              deckCount: shuffledDeck.length, // Mantemos o contador para compatibilidade visual
              handCount: initialHand.length   // Mantemos o contador para compatibilidade visual
          };
      });

      setPlayers(newPlayers);
      
      setGameState(prev => ({ 
          ...prev, 
          phase: PHASES.SETUP 
      }));
      setGameTimer(0);
      
      // Logs de sistema
      addLog(`Mesa configurada. Decks embaralhados (60 cartas).`, 'INFO');
      addLog(`${newPlayers[0].name} comprou 7 cartas.`, 'INFO');
      addLog(`${newPlayers[1].name} comprou 7 cartas.`, 'INFO');
  };

  const saveMatchResult = async (winnerIndex) => {
    const winner = players[winnerIndex];
    const loser = players[winnerIndex === 0 ? 1 : 0];

    // Converte o array de logs em uma string formatada para leitura
    const fullLogText = logs.map(l => `[${l.time}] ${l.text}`).join('\n');

    const matchData = {
        winner_name: winner.name,
        loser_name: loser.name,
        winner_deck: winner.deckArchetype,
        loser_deck: loser.deckArchetype,
        game_logs: fullLogText, // Aqui enviamos o histórico completo para o Supabase
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('matches')
            .insert([matchData]);

        if (error) throw error;
        console.log("Partida e logs salvos no Supabase com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
    }
};

  const declareWinner = (winnerIndex) => {
      const winnerName = players[winnerIndex].name;
      setGameState(prev => ({ 
          ...prev, 
          phase: PHASES.GAME_OVER, 
          winner: winnerName 
      }));
      saveMatchResult(winnerIndex);
  };

  const resetGame = () => {
      const cleanPlayers = players.map(p => ({
          ...p,
          prizes: 6,
          deckCount: 60,
          handCount: 7,
          benchCount: 0,
          activePokemon: null,
          benchPokemon: [],
          activeCondition: CONDITIONS.NONE,
          isPoisoned: false,
          isBurned: false,
          allowUnlimitedEnergy: false,
          energyAttachedThisTurn: false,
          supporterPlayedThisTurn: false,
          retreatedThisTurn: false,
          mulligans: 0
      }));

      setPlayers(cleanPlayers);
      setGameTimer(0);
      setGameState({
        phase: PHASES.LOBBY,
        turnCount: 0,
        currentPlayerIndex: 0, 
        winner: null,
        setupComplete: false,
        startTime: null
      });
      setLogs([]);
  };

  const handleMulligan = (pIndex) => {
    updatePlayer(pIndex, { mulligans: players[pIndex].mulligans + 1 });
    addLog(`Mulligan declarado. Embaralhando e comprando nova mão.`, 'WARN', pIndex);
  };

 const handleCoinFlip = () => {
    // 1. Caminho atualizado para a nova pasta organizada
    const audio = new Audio('/sounds/coinflip.mp3'); 
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Interação necessária para tocar som"));

    const result = Math.random() < 0.5 ? 'CARA' : 'COROA';
    
    // 2. Mantemos o delay de 600ms para sincronia com o som
    setTimeout(() => {
        setCoinResult(result);
        addLog(`Resultado da Moeda: ${result}`, 'SUCCESS');
    }, 600); 

    setTimeout(() => setCoinResult(null), 3000);
};

  const finishSetup = () => {
    if (!players[0].activePokemon || !players[1].activePokemon) {
        addLog(`ERRO DE SETUP: Ambos jogadores precisam de um Pokémon Ativo.`, 'CRIT');
        return;
    }
    setGameState(prev => ({ 
      ...prev, 
      phase: PHASES.START_TURN, 
      turnCount: 1, 
      startTime: Date.now(),
      setupComplete: true
    }));
    addLog(`--- INÍCIO DA PARTIDA ---`, 'INFO');
    addLog(`Turno 1: Vez de ${players[0].name}`, 'INFO');
  };

  // ... (Demais lógicas de jogo mantidas identicas) ...
  const startTurnLogic = () => {
    setGameState(prev => ({ ...prev, phase: PHASES.DRAW }));
    addLog(`Fase de Início de Turno concluída.`, 'INFO', gameState.currentPlayerIndex);
  };
  const drawCard = () => {
    if (gameState.phase !== PHASES.DRAW) return;
    if (currentPlayer.deckCount <= 0) {
      addLog(`Deck vazio! ${currentPlayer.name} perdeu o jogo.`, 'CRIT', gameState.currentPlayerIndex);
      declareWinner(opponentPlayer.id);
      return;
    }
    updatePlayer(gameState.currentPlayerIndex, { deckCount: currentPlayer.deckCount - 1, handCount: currentPlayer.handCount + 1 });
    setGameState(prev => ({ ...prev, phase: PHASES.ACTION }));
    addLog(`Comprou carta do turno.`, 'INFO', gameState.currentPlayerIndex);
  };

  // --- LÓGICA DE CARTAS E TABULEIRO --- (Mantida)
  // ... (placePokemon, requestEvolution, promoteFromBench, etc... - Igual anterior) ...
  // Substitua a função placePokemon antiga por esta NOVA VERSÃO COM REGRAS
const placePokemon = (card = null, destination = 'BENCH', pIndex = gameState.currentPlayerIndex, evolveTargetIndex = null) => {
    saveGameHistory();
    const player = players[pIndex];
    
    // Criação do objeto da carta
    const cardData = { 
        ...(card || { name: 'Desconhecido', type: 'Colorless', hp: '???', imgColor: 'gray', retreat: 1, isGeneric: true, stage: 0 }), 
        turnPlayed: gameState.turnCount, 
        attachedEnergy: [], 
        attachedTool: null, 
        damage: 0, 
        abilitiesUsedThisTurn: [] 
    };

    // --- REGRA 1: BÁSICOS ---
    // Só pode baixar diretamente se for Básico (Stage 0)
    if ((destination === 'ACTIVE' || destination === 'BENCH') && cardData.stage !== 0) {
        addLog(`JOGADA ILEGAL: ${cardData.name} é Estágio ${cardData.stage} e não pode ser baixado direto.`, 'CRIT', pIndex);
        return;
    }

    if (destination === 'ACTIVE') {
        if (player.activePokemon) { 
            addLog(`Erro: Já existe um Pokémon Ativo.`, 'WARN', pIndex); 
            return; 
        }
        updatePlayer(pIndex, { activePokemon: cardData, activeCondition: CONDITIONS.NONE, handCount: Math.max(0, player.handCount - 1) });
        addLog(`BAIXOU: ${cardData.name} como Ativo.`, 'INFO', pIndex);
    } 
    else if (destination === 'BENCH') {
        if (player.benchCount >= 5) { 
            addLog(`Erro: Banco cheio.`, 'CRIT', pIndex); 
            return; 
        }
        updatePlayer(pIndex, { benchPokemon: [...player.benchPokemon, cardData], benchCount: player.benchCount + 1, handCount: Math.max(0, player.handCount - 1) });
        addLog(`BAIXOU: ${cardData.name} no Banco.`, 'INFO', pIndex);
    } 
    // --- LÓGICA DE EVOLUÇÃO (ATUALIZADA COM RARE CANDY) ---
    else if (destination === 'EVOLVE_ACTIVE' || destination === 'EVOLVE_BENCH') {
        // Identifica o alvo da evolução
        const targetPokemon = destination === 'EVOLVE_ACTIVE' ? player.activePokemon : player.benchPokemon[evolveTargetIndex];
        
        // --- NOVO: VERIFICAÇÃO DE RARE CANDY ---
        // Permite se o botão estiver ligado, for Stage 2 e o alvo for Stage 0
        const isRareCandyAction = player.allowRareCandy && cardData.stage === 2 && targetPokemon.stage === 0;

        // --- REGRA 2: NOME DA EVOLUÇÃO ---
        // Se NÃO for Rare Candy, o nome precisa bater. Se FOR Rare Candy, ignora o nome (mas exige Stage 0 -> Stage 2)
        if (cardData.evolvesFrom !== targetPokemon.name && !isRareCandyAction) {
            addLog(`EVOLUÇÃO INVÁLIDA: ${cardData.name} evolui de ${cardData.evolvesFrom}, mas o alvo é ${targetPokemon.name}.`, 'CRIT', pIndex);
            return;
        }

        const oldName = targetPokemon.name;
        const oldEnergies = targetPokemon.attachedEnergy || []; 
        const oldTool = targetPokemon.attachedTool; 
        const oldDamage = targetPokemon.damage || 0;
        
        // Mantém danos e energias, mas atualiza HP Máximo e Ataques
        const newPokemonStats = { ...cardData, attachedEnergy: oldEnergies, attachedTool: oldTool, damage: oldDamage };
        
        if (destination === 'EVOLVE_ACTIVE') {
            updatePlayer(pIndex, { 
                activePokemon: newPokemonStats, 
                activeCondition: CONDITIONS.NONE, 
                handCount: Math.max(0, player.handCount - 1),
                allowRareCandy: false // Desliga o modo automaticamente após usar
            });

            if (isRareCandyAction) {
                addLog(`🍬 RARE CANDY: ${oldName} evoluiu direto para ${cardData.name} (Ativo).`, 'SUCCESS', pIndex);
            } else {
                addLog(`EVOLUIU: ${oldName} para ${cardData.name} (Ativo).`, 'SUCCESS', pIndex);
            }
        } else {
            const newBench = [...player.benchPokemon];
            newBench[evolveTargetIndex] = newPokemonStats;
            updatePlayer(pIndex, { 
                benchPokemon: newBench, 
                handCount: Math.max(0, player.handCount - 1),
                allowRareCandy: false // Desliga o modo automaticamente após usar
            });

            if (isRareCandyAction) {
                addLog(`🍬 RARE CANDY: ${oldName} evoluiu direto para ${cardData.name} (Banco).`, 'SUCCESS', pIndex);
            } else {
                addLog(`EVOLUIU: ${oldName} para ${cardData.name} (Banco).`, 'SUCCESS', pIndex);
            }
        }
    }
    
    // Fecha o modal após o sucesso
    setShowDeckModal(null); 
};
  const requestEvolution = (pIndex, location, index = null) => {
      const p = players[pIndex]; const targetPokemon = location === 'ACTIVE' ? p.activePokemon : p.benchPokemon[index];
      if (gameState.turnCount === 1 && pIndex === 0) { addLog(`REGRA: J1 não pode evoluir no T1.`, 'CRIT', pIndex); return; }
      if (targetPokemon.turnPlayed === gameState.turnCount) { addLog(`REGRA: Enjoo de invocação.`, 'CRIT', pIndex); return; }
      setShowDeckModal({ deckId: p.deckArchetype, pIndex, target: location === 'ACTIVE' ? 'EVOLVE_ACTIVE' : 'EVOLVE_BENCH', evolveTargetIndex: index }); setSelectedCardAction(null); 
  };
  const promoteFromBench = (benchIndex, pIndex = gameState.currentPlayerIndex) => {
      const p = players[pIndex]; if (p.activePokemon) { addLog(`Erro: Já existe Ativo.`, 'WARN', pIndex); return; }
      const pokemonToPromote = p.benchPokemon[benchIndex]; const newBench = p.benchPokemon.filter((_, i) => i !== benchIndex);
      updatePlayer(pIndex, { activePokemon: pokemonToPromote, benchPokemon: newBench, benchCount: newBench.length, activeCondition: CONDITIONS.NONE });
      addLog(`Promoveu ${pokemonToPromote.name} para Ativo.`, 'INFO', pIndex); setSelectedCardAction(null);
  };
  const requestToolAttachment = (pIndex, location, index) => { setShowToolModal({ pIndex, location, index }); setSelectedCardAction(null); };
  const confirmAttachTool = (tool) => {
      const { pIndex, location, index } = showToolModal; const p = players[pIndex];
      if (location === 'ACTIVE') { updatePlayer(pIndex, { activePokemon: { ...p.activePokemon, attachedTool: tool }, handCount: Math.max(0, p.handCount - 1) }); addLog(`Ligou Ferramenta ao Ativo.`, 'INFO', pIndex); } 
      else { const newBench = [...p.benchPokemon]; newBench[index] = { ...newBench[index], attachedTool: tool }; updatePlayer(pIndex, { benchPokemon: newBench, handCount: Math.max(0, p.handCount - 1) }); addLog(`Ligou Ferramenta ao Banco.`, 'INFO', pIndex); }
      setShowToolModal(null);
  };
  
  const requestEnergyAttachment = (pIndex, location, index = null) => { 
      // Agora verifica se a energia ilimitada está ativa ANTES de bloquear
      if (players[pIndex].energyAttachedThisTurn && !players[pIndex].allowUnlimitedEnergy) { 
          addLog(`Tentativa ILEGAL: Já ligou energia neste turno!`, 'CRIT', pIndex); 
          return; 
      } 
      setShowEnergyModal({ pIndex, location, index }); 
      setSelectedCardAction(null); 
  };
  const confirmAttachEnergy = (energyType) => {
    saveGameHistory();
    if (!showEnergyModal) return; const { pIndex, location, index } = showEnergyModal; const p = players[pIndex];
    let eKey = 'Colorless'; Object.entries(ENERGY_TYPES).forEach(([key, val]) => { if(val.name === energyType.name) eKey = key; });
    if (location === 'ACTIVE') { updatePlayer(pIndex, { activePokemon: { ...p.activePokemon, attachedEnergy: [...(p.activePokemon.attachedEnergy || []), eKey] }, energyAttachedThisTurn: true, handCount: Math.max(0, p.handCount - 1) }); addLog(`Ligou Energia ao Ativo.`, 'INFO', pIndex); } 
    else { const newBench = [...p.benchPokemon]; newBench[index] = { ...newBench[index], attachedEnergy: [...(newBench[index].attachedEnergy || []), eKey] }; updatePlayer(pIndex, { benchPokemon: newBench, energyAttachedThisTurn: true, handCount: Math.max(0, p.handCount - 1) }); addLog(`Ligou Energia ao Banco.`, 'INFO', pIndex); }
    
  };
  const handleRemoveEnergy = (energyIndex) => {
     // Remove energy logic inside selectedCardAction context
     const { pIndex, location, index, card } = selectedCardAction;
     const newEnergies = [...card.attachedEnergy];
     const removed = newEnergies.splice(energyIndex, 1);
     
     // UPDATE MAIN STATE
     if (location === 'ACTIVE') {
         updatePlayer(pIndex, { activePokemon: { ...card, attachedEnergy: newEnergies } });
     } else {
         const newBench = [...players[pIndex].benchPokemon];
         newBench[index] = { ...card, attachedEnergy: newEnergies };
         updatePlayer(pIndex, { benchPokemon: newBench });
     }

     // UPDATE LOCAL MODAL STATE
     setSelectedCardAction(prev => ({
         ...prev,
         card: { ...prev.card, attachedEnergy: newEnergies }
     }));

     addLog(`Removeu Energia ${removed[0]} de ${card.name}`, 'WARN', pIndex);
  };

  const handleManualDamage = (amount) => {
    saveGameHistory();
    const { pIndex, location, index, card } = selectedCardAction;
    const currentDmg = card.damage || 0;
    const newDmg = Math.max(0, currentDmg + amount);
    
    // Calcula HP Máximo considerando Ferramentas
    let maxHP = card.hp;
    if (card.attachedTool?.type === 'hp' && card.attachedTool.condition(card)) {
        maxHP += card.attachedTool.value;
    }

    const updatedCard = { ...card, damage: newDmg };
    const isKnockout = newDmg >= maxHP;

    if (location === 'ACTIVE') {
        if (isKnockout) {
            updatePlayer(pIndex, { activePokemon: null, activeCondition: CONDITIONS.NONE });
            addLog(`AJUSTE MANUAL: ${card.name} (Ativo) atingiu 0 HP e foi removido.`, 'CRIT', pIndex);
            reportKnockout(pIndex); // Dispara prêmios e checa derrota
            setSelectedCardAction(null); // Fecha o modal pois o pokemon sumiu
        } else {
            updatePlayer(pIndex, { activePokemon: updatedCard });
            setSelectedCardAction(prev => ({ ...prev, card: updatedCard }));
        }
    } else {
        if (isKnockout) {
            const newBench = players[pIndex].benchPokemon.filter((_, i) => i !== index);
            updatePlayer(pIndex, { 
                benchPokemon: newBench, 
                benchCount: newBench.length 
            });
            addLog(`AJUSTE MANUAL: ${card.name} (Banco) atingiu 0 HP e foi removido.`, 'CRIT', pIndex);
            
            // Define prêmios (ex/V valem 2)
            const prizeCount = (card.name.includes('ex') || card.name.includes(' V')) ? 2 : 1;
            const attackerIndex = pIndex === 0 ? 1 : 0;
            setPrizeAlert({ player: players[attackerIndex].name, count: prizeCount });
            
            setSelectedCardAction(null);
        } else {
            const newBench = [...players[pIndex].benchPokemon];
            newBench[index] = updatedCard;
            updatePlayer(pIndex, { benchPokemon: newBench });
            setSelectedCardAction(prev => ({ ...prev, card: updatedCard }));
        }
    }

    addLog(`Ajuste Manual de Dano: ${amount > 0 ? '+' : ''}${amount} em ${card.name}`, 'WARN', pIndex);
};

  // ... (useAbility, playItem, playSupporter, retreat, openAttackModal, confirmAttack, finalizeAttack, endTurn, performCheckup, takePrize, reportKnockout, applyCondition, handleExistingCardClick - Mantidos) ...
  const useAbility = (abilityName, pIndex, location, index) => { 
      const p = players[pIndex]; 
      const card = location === 'ACTIVE' ? p.activePokemon : p.benchPokemon[index]; 
      const locLabel = location === 'ACTIVE' ? 'Ativo' : `Banco ${index + 1}`; 
      
      if (card.abilitiesUsedThisTurn && card.abilitiesUsedThisTurn.includes(abilityName)) { 
          addLog(`ATENÇÃO: Habilidade ${abilityName} já foi usada!`, 'CRIT', pIndex); 
      } 
      
      const newUsed = [...(card.abilitiesUsedThisTurn || []), abilityName]; 
      if (location === 'ACTIVE') { 
          updatePlayer(pIndex, { activePokemon: { ...card, abilitiesUsedThisTurn: newUsed } }); 
      } else { 
          const newBench = [...p.benchPokemon]; 
          newBench[index] = { ...card, abilitiesUsedThisTurn: newUsed }; 
          updatePlayer(pIndex, { benchPokemon: newBench }); 
      } 
      
      // SPECIAL LOGIC FOR ENERGY ACCELERATION ABILITIES
      if (abilityName === 'Infernal Reign' || abilityName === 'Psychic Embrace') {
          updatePlayer(pIndex, { allowUnlimitedEnergy: true });
          addLog(`Habilidade Especial: Restrição de energia manual removida para este turno.`, 'SUCCESS', pIndex);
      }

      addLog(`USOU HABILIDADE: ${abilityName} [${card.name} - ${locLabel}]`, 'RULE', pIndex); 
      setSelectedCardAction(null); 
  };
  const playItem = () => { updatePlayer(gameState.currentPlayerIndex, { handCount: Math.max(0, currentPlayer.handCount - 1) }); addLog(`Jogou Carta de Item.`, 'INFO', gameState.currentPlayerIndex); };
  const playSupporter = () => { if (currentPlayer.supporterPlayedThisTurn) { addLog(`Tentativa ILEGAL: Já usou Apoiador!`, 'CRIT', gameState.currentPlayerIndex); return; } if (gameState.turnCount === 1 && gameState.currentPlayerIndex === 0) { addLog(`Tentativa ILEGAL: J1 não usa Apoiador no T1.`, 'CRIT', gameState.currentPlayerIndex); return; } updatePlayer(gameState.currentPlayerIndex, { supporterPlayedThisTurn: true, handCount: Math.max(0, currentPlayer.handCount - 1) }); addLog(`Jogou Apoiador.`, 'INFO', gameState.currentPlayerIndex); };
  const retreat = () => {
    if (currentPlayer.retreatedThisTurn) { 
        addLog(`Já recuou neste turno!`, 'CRIT', gameState.currentPlayerIndex); 
        return; 
    }
    if ([CONDITIONS.ASLEEP, CONDITIONS.PARALYZED].includes(currentPlayer.activeCondition)) { 
        addLog(`AÇÃO INVÁLIDA: Condição Especial impede recuo.`, 'CRIT', gameState.currentPlayerIndex); 
        return; 
    }
    if (currentPlayer.benchCount === 0) { 
        addLog(`IMPOSSÍVEL RECUAR: Banco vazio.`, 'CRIT', gameState.currentPlayerIndex); 
        return; 
    }

    let retreatCost = currentPlayer.activePokemon.retreat;
    if (currentPlayer.activePokemon.attachedTool?.type === 'retreat') {
        retreatCost = Math.max(0, retreatCost + currentPlayer.activePokemon.attachedTool.value);
    }

    const attachedEnergies = currentPlayer.activePokemon.attachedEnergy || [];
    if (attachedEnergies.length < retreatCost) { 
        addLog(`Energia insuficiente (Custo: ${retreatCost}).`, 'CRIT', gameState.currentPlayerIndex); 
        return; 
    }

    if (retreatCost === 0) {
        confirmRetreat([]); // Recuo grátis
    } else {
        setRetreatModal({ 
            cost: retreatCost, 
            selectedIndices: [], 
            availableEnergies: attachedEnergies 
        });
    }
};
  const openAttackModal = () => { if (gameState.turnCount === 1 && gameState.currentPlayerIndex === 0) { addLog(`Tentativa ILEGAL: J1 não ataca no T1.`, 'CRIT', gameState.currentPlayerIndex); return; } if ([CONDITIONS.ASLEEP, CONDITIONS.PARALYZED].includes(currentPlayer.activeCondition)) { addLog(`AÇÃO BLOQUEADA: Condição Especial.`, 'CRIT', gameState.currentPlayerIndex); return; } if (!currentPlayer.activePokemon) { addLog(`ERRO: Sem Ativo.`, 'CRIT', gameState.currentPlayerIndex); return; } 
    // Check Confusion
    if (currentPlayer.activeCondition === CONDITIONS.CONFUSED) {
        if (Math.random() > 0.5) {
            addLog(`Confusão: Moeda Cara! Ataque prossegue.`, 'SUCCESS', gameState.currentPlayerIndex);
        } else {
            addLog(`Confusão: Moeda Coroa! Ataque falhou e recebeu 30 de dano.`, 'CRIT', gameState.currentPlayerIndex);
            const currentDmg = currentPlayer.activePokemon.damage || 0;
            updatePlayer(gameState.currentPlayerIndex, { activePokemon: { ...currentPlayer.activePokemon, damage: currentDmg + 30 } });
            setTimeout(() => { endTurn(); }, 1500);
            return;
        }
    }
    setShowAttackModal(true); 
  };
  const confirmRetreat = (selectedIndices) => {
    const attachedEnergies = [...currentPlayer.activePokemon.attachedEnergy];
    const attackerName = currentPlayer.activePokemon.name;
    
    // Identifica os nomes das energias que serão descartadas para o log
    const discardedNames = selectedIndices.map(idx => {
        const type = attachedEnergies[idx];
        return ENERGY_TYPES[type]?.name || type;
    });

    // Remove as energias selecionadas
    selectedIndices.sort((a, b) => b - a).forEach(idx => attachedEnergies.splice(idx, 1));

    const oldActive = { ...currentPlayer.activePokemon, attachedEnergy: attachedEnergies };
    
    updatePlayer(gameState.currentPlayerIndex, { 
        retreatedThisTurn: true, 
        activeCondition: CONDITIONS.NONE, 
        isPoisoned: false, 
        isBurned: false, 
        activePokemon: null, 
        benchPokemon: [...currentPlayer.benchPokemon, oldActive], 
        benchCount: currentPlayer.benchCount + 1 
    });

    // Log ultra detalhado
    const energyList = discardedNames.length > 0 ? ` (Descartou: ${discardedNames.join(', ')})` : ' (Custo Zero)';
    addLog(`RECUOU: ${attackerName} foi para o banco.${energyList}. Selecione novo Ativo.`, 'WARN', gameState.currentPlayerIndex);
    
    setRetreatModal(null);
};
  const applyDamageToOpponentActive = (damageAmount) => { const opIndex = gameState.currentPlayerIndex === 0 ? 1 : 0; const opPlayer = players[opIndex]; if (!opPlayer.activePokemon) { addLog(`Ataque falhou: Oponente sem Ativo!`, 'CRIT'); return false; } const currentDmg = opPlayer.activePokemon.damage || 0; const newDmg = currentDmg + damageAmount; const newActive = { ...opPlayer.activePokemon, damage: newDmg }; updatePlayer(opIndex, { activePokemon: newActive }); addLog(`Causou ${damageAmount} de dano!`, 'WARN', gameState.currentPlayerIndex); let maxHP = newActive.hp; if (newActive.attachedTool && newActive.attachedTool.type === 'hp' && newActive.attachedTool.condition(newActive)) { maxHP += newActive.attachedTool.value; } const willKnockout = (maxHP - newDmg) <= 0; if (willKnockout) { setTimeout(() => { addLog(`NOCAUTE! ${newActive.name} perdeu todo o HP!`, 'CRIT', opIndex); reportKnockout(opIndex); }, 1000); } return willKnockout; };
  const confirmAttack = (attack) => { 
    setGameState(prev => ({ ...prev, phase: PHASES.ATTACK })); 
    let baseDamage = parseInt(attack.damage) || 0; 
    const opIndex = gameState.currentPlayerIndex === 0 ? 1 : 0; 
    const opActive = players[opIndex].activePokemon; 
    const myActive = currentPlayer.activePokemon; 

    // Log detalhado do início do ataque
    addLog(`DECLAROU ATAQUE: ${myActive.name} usou ${attack.name}.`, 'WARN', gameState.currentPlayerIndex);

    if (opActive && baseDamage > 0) { 
        const { multiplier, modifier } = calculateDamageModifiers(myActive.type, opActive.weakness, opActive.resistance); 
        if (multiplier === 2) addLog(`Fraqueza Detectada! Dano x2 contra ${opActive.name}.`, 'WARN', gameState.currentPlayerIndex); 
        if (modifier === -30) addLog(`Resistência Detectada! Dano -30 de ${opActive.name}.`, 'INFO', opIndex); 
        baseDamage = (baseDamage * multiplier) + modifier; 
    } 

    if (baseDamage > 0 || attack.damage.includes('x') || attack.damage.includes('+') || attack.cost.length === 0) { 
        setDamageConfirmation({ 
            attackName: attack.name, 
            attackerName: myActive.name, // Guardamos o nome do atacante para o log final
            baseDamage: Math.max(0, baseDamage), 
            actualDamage: Math.max(0, baseDamage), 
            attackRef: attack 
        }); 
        setShowAttackModal(false); 
    } else { 
        // Para ataques de efeito sem dano (como busca ou status)
        setShowAttackModal(false); 
        if (attack.effectType === 'distribute_damage') { 
            const opIndex = gameState.currentPlayerIndex === 0 ? 1 : 0; 
            if (players[opIndex].benchPokemon.length > 0) { 
                setDistributionModal({ total: attack.effectValue || 0, allocated: Array(players[opIndex].benchPokemon.length).fill(0), opponentIndex: opIndex }); 
                return; 
            } 
        } 
        setTimeout(() => { endTurn(); }, 1500); 
    } 
};
  const finalizeAttack = () => { 
    saveGameHistory();
    const finalDamage = damageConfirmation.actualDamage; 
    const attack = damageConfirmation.attackRef; 
    const attackerName = damageConfirmation.attackerName; // Recuperado do estado
    const opActiveName = opponentPlayer.activePokemon?.name || "Oponente";
    
    let isKo = false; 
    if (finalDamage > 0) { 
        isKo = applyDamageToOpponentActive(finalDamage);
        // Log específico com nomes
        addLog(`${attackerName} causou ${finalDamage} de dano em ${opActiveName} com ${attack.name}.`, 'SUCCESS', gameState.currentPlayerIndex);
    } else { 
        addLog(`${attackerName} realizou ${attack.name} (0 dano/efeito).`, 'INFO', gameState.currentPlayerIndex); 
    } 

    if (attack && attack.effectType === 'distribute_damage') { 
        const opIndex = gameState.currentPlayerIndex === 0 ? 1 : 0; 
        const opBenchCount = players[opIndex].benchPokemon.length; 
        if (opBenchCount > 0) { 
            setDistributionModal({ total: attack.effectValue || 0, allocated: Array(opBenchCount).fill(0), opponentIndex: opIndex }); 
            setDamageConfirmation(null); 
            return; 
        } 
    } 
    
    setDamageConfirmation(null); 
    if (!isKo) { 
        setTimeout(() => { endTurn(); }, 1500); 
    } 
};
  const handleDistributionChange = (idx, delta) => { const currentAllocated = distributionModal.allocated[idx]; const currentTotalAllocated = distributionModal.allocated.reduce((a, b) => a + b, 0); if (delta > 0) { if (currentTotalAllocated + 10 <= distributionModal.total) { const newAllocated = [...distributionModal.allocated]; newAllocated[idx] += 10; setDistributionModal(prev => ({ ...prev, allocated: newAllocated })); } } else { if (currentAllocated > 0) { const newAllocated = [...distributionModal.allocated]; newAllocated[idx] -= 10; setDistributionModal(prev => ({ ...prev, allocated: newAllocated })); } } };
  
  // FIX: Atualizar BenchCount ao remover pokemons e checar Game Over
  const confirmDistribution = () => { 
    const { opponentIndex, allocated } = distributionModal; 
    const opPlayer = players[opponentIndex]; 
    const newBench = [...opPlayer.benchPokemon]; 
    let prizesToTake = 0;

    allocated.forEach((dmg, idx) => { 
        if (dmg > 0) { 
            const currentDmg = newBench[idx].damage || 0; 
            newBench[idx] = { ...newBench[idx], damage: currentDmg + dmg }; 
            
            let maxHP = newBench[idx].hp; 
            if (newBench[idx].attachedTool?.type === 'hp' && newBench[idx].attachedTool.condition(newBench[idx])) { 
                maxHP += newBench[idx].attachedTool.value; 
            } 

            if (maxHP - newBench[idx].damage <= 0) { 
                addLog(`NOCAUTE NO BANCO! ${newBench[idx].name} foi removido do jogo.`, 'CRIT', opponentIndex); 
                // Define quantos prêmios vale (ex/V valem 2)
                prizesToTake += (newBench[idx].name.includes('ex') || newBench[idx].name.includes(' V')) ? 2 : 1;
            } 
        } 
    }); 

    // Filtra apenas os que sobreviveram (HP > 0)
    const survivors = newBench.filter(p => { 
        let maxHP = p.hp; 
        if (p.attachedTool?.type === 'hp' && p.attachedTool.condition(p)) maxHP += p.attachedTool.value; 
        return (maxHP - (p.damage || 0)) > 0; 
    }); 

    // Atualiza o banco do oponente e a contagem
    updatePlayer(opponentIndex, { 
        benchPokemon: survivors, 
        benchCount: survivors.length 
    }); 

    // Se houver nocaute, avisa para pegar os prêmios
    if (prizesToTake > 0) {
        setPrizeAlert({ player: players[gameState.currentPlayerIndex].name, count: prizesToTake });
        addLog(`REGRA: Pegue ${prizesToTake} prêmios pelo nocaute no banco.`, 'PRIZE', gameState.currentPlayerIndex); 
    }

    // Verifica se o oponente ficou sem Pokémon no jogo inteiro
    if (!opPlayer.activePokemon && survivors.length === 0) {
        declareWinner(gameState.currentPlayerIndex);
    }
    
    setDistributionModal(null); 
    setTimeout(() => { endTurn(); }, 1500); 
};
  
  // FIX: Adicionando verificação de Game Over antes de avançar turno
  const endTurn = () => { 
      setGameState(prev => { 
          if (prev.phase === PHASES.GAME_OVER) return prev; // Se o jogo acabou, NÃO avance o turno
          addLog(`Turno encerrado. Iniciando Checkup Pokémon.`, 'INFO'); 
          return { ...prev, phase: PHASES.CHECKUP }; 
      }); 
  };

  const performCheckup = () => { addLog(`--- CHECKUP INICIADO ---`, 'RULE'); [0, 1].forEach(pIdx => { const p = players[pIdx]; if (!p.activePokemon) return; let newDamage = p.activePokemon.damage || 0; let newCondition = p.activeCondition; let didChange = false; 
    // Poison (Independent)
    if (p.isPoisoned) { newDamage += 10; addLog(`Veneno: ${p.activePokemon.name} sofreu 10 de dano.`, 'WARN', pIdx); didChange = true; } 
    // Burn (Independent)
    if (p.isBurned) { newDamage += 20; addLog(`Queimadura: ${p.activePokemon.name} sofreu 20 de dano.`, 'WARN', pIdx); if (Math.random() > 0.5) { updatePlayer(pIdx, { isBurned: false }); addLog(`Queimadura: ${p.activePokemon.name} curou-se.`, 'SUCCESS', pIdx); } else { addLog(`Queimadura: ${p.activePokemon.name} continua.`, 'INFO', pIdx); } didChange = true; } 
    // Sleep (Rotational)
    if (p.activeCondition === CONDITIONS.ASLEEP) { if (Math.random() > 0.5) { newCondition = CONDITIONS.NONE; addLog(`Sono: ${p.activePokemon.name} acordou.`, 'SUCCESS', pIdx); } else { addLog(`Sono: ${p.activePokemon.name} dorme.`, 'INFO', pIdx); } didChange = true; } 
    // Paralysis (Rotational - Cures at end of YOUR turn, so during checkup if it was your turn)
    if (p.activeCondition === CONDITIONS.PARALYZED && gameState.currentPlayerIndex === pIdx) { newCondition = CONDITIONS.NONE; addLog(`Paralisia: ${p.activePokemon.name} curado.`, 'SUCCESS', pIdx); didChange = true; } 
    
    // Reset abilities used this turn for active
    const resetActive = { ...p.activePokemon, abilitiesUsedThisTurn: [] };
    // Reset abilities used this turn for bench
    const resetBench = p.benchPokemon.map(b => ({ ...b, abilitiesUsedThisTurn: [] }));

    // Reset unlimited energy flag here too
    const resetUnlimited = false; 

    if (didChange) { const updatedActive = { ...resetActive, damage: newDamage }; updatePlayer(pIdx, { activePokemon: updatedActive, benchPokemon: resetBench, activeCondition: newCondition, allowUnlimitedEnergy: resetUnlimited }); let maxHP = updatedActive.hp; if (updatedActive.attachedTool && updatedActive.attachedTool.type === 'hp' && updatedActive.attachedTool.condition(updatedActive)) { maxHP += updatedActive.attachedTool.value; } if (maxHP - newDamage <= 0) { addLog(`NOCAUTE POR CONDIÇÃO ESPECIAL!`, 'CRIT', pIdx); reportKnockout(pIdx); } } 
    else { updatePlayer(pIdx, { activePokemon: resetActive, benchPokemon: resetBench, allowUnlimitedEnergy: resetUnlimited }); } 

  }); 
  
  // FIX: Verificação de segurança no timeout do checkup
  const nextPlayerIndex = gameState.currentPlayerIndex === 0 ? 1 : 0; 
  updatePlayer(gameState.currentPlayerIndex, { energyAttachedThisTurn: false, supporterPlayedThisTurn: false, retreatedThisTurn: false }); 
  
  setTimeout(() => { 
      setGameState(prev => {
          if (prev.phase === PHASES.GAME_OVER) return prev; // Se o jogo acabou durante o checkup (ex: veneno), pare.
          return { ...prev, phase: PHASES.START_TURN, turnCount: prev.turnCount + 1, currentPlayerIndex: nextPlayerIndex };
      }); 
      if (gameState.phase !== PHASES.GAME_OVER) {
          addLog(`--- Turno ${gameState.turnCount + 1}: Vez de ${players[nextPlayerIndex].name} ---`, 'INFO'); 
      }
  }, 1000); 
};
  
  const takePrize = (count) => { 
      const current = players[gameState.currentPlayerIndex].prizes; 
      const newCount = Math.max(0, current - count); 
      updatePlayer(gameState.currentPlayerIndex, { prizes: newCount }); 
      addLog(`Pegou ${count} carta(s) de prêmio. Restantes: ${newCount}`, 'WARN', gameState.currentPlayerIndex); 
      if (newCount === 0) { declareWinner(gameState.currentPlayerIndex); } 
  };
  
  const reportKnockout = (victimIndex) => { 
    const victim = players[victimIndex]; 
    const attackerIndex = victimIndex === 0 ? 1 : 0; 
    
    // Check if multi prize rule box
    let prizeCount = 1;
    if (victim.activePokemon && (victim.activePokemon.name.includes('ex') || victim.activePokemon.name.includes(' V'))) {
        prizeCount = 2;
    }
    
    addLog(`${victim.activePokemon ? victim.activePokemon.name : 'Ativo'} foi Nocauteado!`, 'CRIT', victimIndex); 
    
    // Trigger Prize Alert
    setPrizeAlert({ player: players[attackerIndex].name, count: prizeCount });

    updatePlayer(victimIndex, { activePokemon: null, activeCondition: CONDITIONS.NONE }); 
    
    // Check bench out win condition
    // FIX: Using length directly is safer than relying on potentially stale benchCount
    if (victim.benchPokemon.length === 0) { 
        addLog(`SEM POKÉMON NO BANCO! ${victim.name} perdeu o jogo.`, 'CRIT', victimIndex); 
        declareWinner(attackerIndex); 
        return; 
    } 
    
    addLog(`Atenção: ${victim.name} deve promover um Pokémon do Banco.`, 'WARN', victimIndex); 
    
    // Warning about prizes
    setTimeout(() => { 
        addLog(`Após resolver o Nocaute e Prêmios, encerre o turno manualmente.`, 'INFO'); 
    }, 1000); 
  };
  const applyCondition = (pIndex, condition) => { updatePlayer(pIndex, { activeCondition: condition }); addLog(`Condição Especial aplicada: ${condition}`, 'WARN', pIndex); };
  const updateStatus = (pIndex, updates) => {
      // updates can be { activeCondition: ... } or { isPoisoned: ... } etc
      updatePlayer(pIndex, updates);
      addLog(`Status atualizado para ${players[pIndex].name}`, 'WARN', pIndex);
  };
  const handleExistingCardClick = (pIndex, location, index = null) => { if (gameState.phase === PHASES.SETUP) return; const p = players[pIndex]; const card = location === 'ACTIVE' ? p.activePokemon : p.benchPokemon[index]; setSelectedCardAction({ pIndex, location, index, card }); };
  const downloadLog = () => { if (logs.length === 0) { alert("Não há logs para exportar."); return; } const content = logs.map(l => `[${l.time}] [${l.level}] ${l.text}`).join('\n'); const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `pokejudge-log-${new Date().toISOString().slice(0,10)}.txt`; a.click(); URL.revokeObjectURL(url); };

  // --- RENDERIZADORES ---
  const renderBench = (pIndex) => { const p = players[pIndex]; const slots = []; p.benchPokemon.forEach((poke, idx) => { slots.push( <div key={`bench-${idx}`} className="relative group"> <div onClick={() => handleExistingCardClick(pIndex, 'BENCH', idx)}> <PokemonCard card={poke} small={true} /> </div> </div> ); }); for(let i=p.benchCount; i<5; i++) { slots.push( <div key={`empty-${i}`} className="w-24 h-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white/20 cursor-pointer hover:bg-white/40 transition-colors group" onClick={() => setShowDeckModal({ deckId: p.deckArchetype, pIndex, target: 'BENCH' })}> <PlusCircle className="text-gray-300 group-hover:text-gray-400" size={24}/> </div> ); } return <div className="flex gap-2 mt-2 overflow-x-auto pb-2 min-h-[170px]">{slots}</div>; };
  const renderPlayerSide = (pIndex) => { 
        const p = players[pIndex]; 
        const isCurrent = gameState.currentPlayerIndex === pIndex; 
        const isSetup = gameState.phase === PHASES.SETUP; 
        const deckInfo = DECKS[p.deckArchetype]; 
        
        return ( 
            <Card className={`border-l-4 ${isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} mb-4 relative transition-all duration-300 ${pIndex === 0 ? 'bg-slate-50' : 'bg-red-50'}`}> 
                <div className="flex justify-between items-start mb-4"> 
                    <div> 
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}> 
                            <User size={20} /> {p.name} {isCurrent && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TURNO ATIVO</span>} 
                        </h2> 
                        <div className="mt-1 flex gap-2 items-center"> 
                            <Badge className={deckInfo.color}>{deckInfo.name}</Badge> 
                            <button onClick={() => setShowDeckModal({ deckId: p.deckArchetype, pIndex, target: null })} className="text-xs text-blue-600 flex items-center hover:underline bg-white/50 px-2 py-0.5 rounded border border-blue-200"> 
                                <ImageIcon size={12} className="mr-1"/> Ver Cartas 
                            </button> 
                        </div> 
                    </div> 
                    
                    <div className="flex gap-2"> 
                        {/* --- SUBSTITUIÇÃO DO PASSO 2 (PRÊMIOS VISUAIS) --- */}
                        <div className="flex flex-col items-center bg-white p-2 rounded shadow-sm min-w-[70px]">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Prêmios</div>
                            <div onClick={() => isCurrent ? setShowPrizeModal(true) : null} className={isCurrent ? 'cursor-pointer hover:scale-105 transition-transform' : ''}>
                                <PrizeZone count={p.prizes} compact={true} />
                            </div>
                        </div>
                        {/* ------------------------------------------------ */}

                        <div className="text-center p-2 bg-white rounded shadow-sm min-w-[60px] flex flex-col justify-center">
                            <div className="text-xs text-gray-500">Mão</div>
                            <div className="font-mono text-xl">{p.handCount}</div>
                        </div> 
                    </div> 
                </div> 
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> 
                    <div className="bg-white/60 p-3 rounded border border-gray-200 flex flex-col items-center justify-center min-h-[320px]"> 
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2 w-full text-left">Pokémon Ativo</p> 
                        {p.activePokemon ? ( 
                            <div className="relative"> 
                                <div onClick={() => handleExistingCardClick(pIndex, 'ACTIVE')}><PokemonCard card={{...p.activePokemon, activeCondition: p.activeCondition, isPoisoned: p.isPoisoned, isBurned: p.isBurned}} /></div> 
                                <div className="absolute -bottom-10 left-0 right-0 p-2 bg-white rounded border shadow-lg z-20 flex gap-2 justify-center"> 
                                    {/* STATUS CONTROLS */} 
                                    <select className={`w-1/2 text-[10px] rounded border p-1 font-bold ${p.activeCondition !== CONDITIONS.NONE ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50'}`} value={p.activeCondition} onChange={(e) => updateStatus(pIndex, {activeCondition: e.target.value})}> 
                                        {Object.values(CONDITIONS).map(c => <option key={c} value={c}>{c}</option>)} 
                                    </select> 
                                    <button className={`p-1 rounded border ${p.isPoisoned ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`} onClick={() => updateStatus(pIndex, {isPoisoned: !p.isPoisoned})} title="Veneno"><Skull size={14}/></button> 
                                    <button className={`p-1 rounded border ${p.isBurned ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`} onClick={() => updateStatus(pIndex, {isBurned: !p.isBurned})} title="Queimadura"><Flame size={14}/></button> 
                                </div> 
                            </div> 
                        ) : ( 
                            <div className="w-48 h-72 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center bg-white/40 text-red-400 p-4 text-center cursor-pointer hover:bg-white/80 transition-colors" onClick={() => setShowDeckModal({ deckId: p.deckArchetype, pIndex, target: 'ACTIVE' })}> 
                                <PlusCircle size={32} className="mb-2 opacity-50"/> 
                                <span className="font-bold text-sm">Adicionar Ativo</span> 
                            </div> 
                        )} 
                    </div> 
                    <div className="flex flex-col gap-2"> 
                        <div className="bg-white/60 p-3 rounded border border-gray-200 flex-1 overflow-x-auto"> 
                            <div className="flex justify-between items-center mb-1"><p className="text-xs text-gray-500 uppercase font-bold">Banco ({p.benchCount}/5)</p></div> 
                            {renderBench(pIndex)} 
                        </div> 
                        <div className="bg-white/60 p-3 rounded border border-gray-200 text-sm space-y-1"> 
                            <div className="flex justify-between"><span>Energia Manual:</span>{p.energyAttachedThisTurn ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-gray-400">-</span>}</div> 
                            <div className="flex justify-between"><span>Apoiador:</span>{p.supporterPlayedThisTurn ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-gray-400">-</span>}</div> 
                            <div className="flex justify-between"><span>Recuou:</span>{p.retreatedThisTurn ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-gray-400">-</span>}</div> 
                        </div> 
                    </div> 
                </div> 
                {isSetup ? ( 
                    <div className="flex gap-2"><Button variant="secondary" onClick={() => handleMulligan(pIndex)}>Registrar Mulligan ({p.mulligans})</Button></div> 
                ) : ( 
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2"> 
                        <Button variant="ghost" className="border bg-white" disabled={!isCurrent || gameState.phase !== PHASES.ACTION} onClick={playItem}>Jogar Item</Button> 
                        <Button variant="ghost" className="border bg-white" disabled={!isCurrent || gameState.phase !== PHASES.ACTION} onClick={playSupporter}>Apoiador</Button> 
                        <Button variant="ghost" className="border bg-white" disabled={!isCurrent || gameState.phase !== PHASES.ACTION || p.benchCount >= 5} onClick={() => setShowDeckModal({ deckId: p.deckArchetype, pIndex, target: 'BENCH' })}>+ Básico</Button> 
                        <Button variant="ghost" className="border bg-white" disabled={!isCurrent || gameState.phase !== PHASES.ACTION} onClick={retreat}>Recuar</Button> 
                        <Button variant="danger" className="col-span-2 text-xs" icon={Sword} disabled={!isCurrent || gameState.phase !== PHASES.ACTION} onClick={openAttackModal}>Fase de Ataque</Button> 
                        <Button variant="warning" className="col-span-2 text-xs" disabled={p.prizes <= 0} onClick={() => setShowPrizeModal(true)}>Pegar Prêmios</Button> 
                        <Button variant="secondary" className="col-span-2 text-xs md:col-span-4 mt-1 bg-red-100 hover:bg-red-200 text-red-800 border-red-200" onClick={() => reportKnockout(pIndex)}><Skull size={14} className="mr-1"/> Registrar Nocaute</Button> 
                    </div> 
                )} 
            </Card> 
        ); 
    };
    if (gameState.phase === PHASES.LOBBY) {
        return (
            <>
            <GameLobby 
                players={players} 
                onUpdatePlayer={updatePlayer} 
                onStartGame={handleStartGameFromLobby} 
                onShowRanking={() => setShowRanking(true)} 
                availableDecks={availableDecks} 
                onManageDecks={() => setShowDeckManager(true)}
            />
            
            {/* O MODAL PRECISA ESTAR AQUI TAMBÉM PARA APARECER NO LOBBY */}
            {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
            </>
        );
    }

  return (
  <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans relative">
    
    {/* 1. TELA DE LOBBY (SÓ APARECE SE A FASE FOR LOBBY) */}
    {gameState.phase === PHASES.LOBBY && (
      <div className="max-w-4xl mx-auto space-y-8 py-20 animate-in fade-in duration-500">
          <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                  <Shield className="text-blue-600" size={80} />
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">
                  POKÉ<span className="text-blue-600">JUDGE</span> PRO
              </h1>
              <p className="text-slate-500 font-medium uppercase tracking-widest text-sm font-mono">
                  Assistente de Arbitragem Profissional v2.5
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
                  <Button 
                      variant="primary" 
                      className="px-10 py-8 text-xl shadow-xl hover:scale-105 transition-transform"
                      onClick={() => setGameState(prev => ({...prev, phase: PHASES.SETUP}))}
                  >
                      <PlayCircle className="mr-2" size={24} /> NOVA PARTIDA
                  </Button>

                  
              </div>
          </div>
      </div>
    )}

    {/* 2. INTERFACE DE JOGO (SÓ APARECE SE NÃO ESTIVER NO LOBBY) */}
    {gameState.phase !== PHASES.LOBBY && (
      <>
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">PokéJudge Pro</h1>
                <button onClick={() => setShowDeckManager(true)} className="mb-6 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full underline">
                    <Edit3 size={12}/> Gerenciar Decks (Supabase)
                </button>
                <p className="text-xs text-slate-400 font-mono">Assistente de Arbitragem v2.5</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 mr-4 bg-gray-100 px-3 py-1 rounded">
                   <Clock size={16} className={isTimerPaused ? 'text-red-500' : 'text-green-600'}/>
                   <span className="font-mono font-bold text-lg">{formatTime(gameTimer)}</span>
                   <button onClick={() => setIsTimerPaused(!isTimerPaused)} className="ml-2 text-xs text-blue-600 hover:underline">
                    {isTimerPaused ? <Play size={12}/> : <Pause size={12}/>}
                   </button>
               </div>
               <div className="text-right">
                <div className="text-xs uppercase font-bold text-gray-500">Fase Atual</div>
                <div className="text-xl font-bold text-blue-600">{gameState.phase}</div>
               </div>
               <Button variant="ghost" onClick={handleCoinFlip} className="border border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                <Coins className="mr-1" size={16}/> Moeda
               </Button>
               <Button variant="ghost" onClick={() => setShowRanking(true)} className="border border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100">
                <BarChart2 className="mr-1" size={16}/> Ranking
               </Button>
              <Button variant="secondary" icon={BookOpen} onClick={() => setShowRules(true)}>Regras</Button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-400"/>
                    <span className="font-mono text-lg font-bold text-slate-100">Turno: {gameState.turnCount}</span>
                  </div>
                  {gameState.phase === PHASES.SETUP && (<Button variant="success" icon={PlayCircle} onClick={finishSetup}>Iniciar Partida</Button>)}
                  {gameState.phase === PHASES.START_TURN && (<div className="animate-pulse"><Button variant="primary" icon={ChevronRight} onClick={startTurnLogic}>Confirmar Início de Turno</Button></div>)}
                  {gameState.phase === PHASES.DRAW && (<div className="animate-pulse"><Button variant="primary" icon={History} onClick={drawCard}>COMPRAR CARTA (Obrigatório)</Button></div>)}
                  {(gameState.phase === PHASES.ACTION || gameState.phase === PHASES.ATTACK) && (<div className="flex gap-2"><Button variant="secondary" onClick={endTurn}>Encerrar Turno</Button></div>)}
                  {gameState.phase === PHASES.CHECKUP && (<Button variant="primary" icon={RotateCcw} onClick={performCheckup}>Concluir Checkup & Iniciar Próx. Turno</Button>)}
              </div>
              {renderPlayerSide(0)}
              {renderPlayerSide(1)}
          </div>

          <div className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="font-bold flex items-center gap-2"><History size={18}/> Linha do Tempo</h3>
                    <Badge color="gray">Live</Badge>
                  </div>
                  <div ref={logsContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-sm">
                      {logs.map((log) => (
                        <div key={log.id} className={`p-2 rounded border-l-4 bg-gray-50 dark:bg-gray-700/50 ${log.level === 'CRIT' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : log.level === 'WARN' ? 'border-yellow-500' : log.level === 'RULE' ? 'border-purple-500 bg-purple-50' : log.level === 'SUCCESS' ? 'border-green-500 bg-green-50' : log.level === 'PRIZE' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-400'}`}>
                          <div className="text-xs text-gray-500 mb-1">{log.time}</div>
                          <div>{log.text}</div>
                        </div>
                      ))}
                  </div>
              </Card>
              <Card>
                  <h3 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Alertas de Juiz</h3>
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="ghost" className="border text-xs" onClick={() => addLog('Aviso: Jogo Lento (Slow Play).', 'WARN')}>Slow Play</Button>
                      <Button variant="ghost" className="border text-xs" onClick={() => addLog('Erro de Procedimento Menor.', 'WARN')}>Erro Menor</Button>
                      <Button variant="ghost" className="border text-xs" onClick={() => addLog('Game State Irreparável.', 'CRIT')}>Irreparável</Button>
                      <Button 
                          variant={currentPlayer.allowUnlimitedEnergy ? "success" : "ghost"} 
                          className="border text-[10px]" 
                          onClick={() => {
                              updatePlayer(gameState.currentPlayerIndex, { allowUnlimitedEnergy: !currentPlayer.allowUnlimitedEnergy });
                              addLog(`${currentPlayer.allowUnlimitedEnergy ? 'Restringiu' : 'LIBEROU'} uso de energia ilimitada.`, 'RULE', gameState.currentPlayerIndex);
                          }}
                      >
                          {currentPlayer.allowUnlimitedEnergy ? "Energia: Ilimitada" : "Energia: 1 p/ Turno"}
                      </Button>
                      <Button variant="secondary" className="text-xs" icon={Download} onClick={downloadLog}>Exportar .txt</Button>
                      <Button 
                        variant={currentPlayer.allowRareCandy ? "warning" : "ghost"} 
                        className={`border text-[10px] ${currentPlayer.allowRareCandy ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}`}
                        onClick={() => {
                            updatePlayer(gameState.currentPlayerIndex, { allowRareCandy: !currentPlayer.allowRareCandy });
                            addLog(`${currentPlayer.allowRareCandy ? 'DESATIVOU' : 'ATIVOU'} modo Rare Candy (Pular Estágio).`, 'RULE', gameState.currentPlayerIndex);
                        }}
                      >
                        <Sparkles size={14} className={currentPlayer.allowRareCandy ? "text-blue-600" : "text-gray-400"}/>
                        {currentPlayer.allowRareCandy ? "Rare Candy: ON" : "Rare Candy: OFF"}
                      </Button>
                  </div>
              </Card>
          </div>
        </main>
      </>
    )}

    {/* --- OVERLAY DE MOEDA IMERSIVO --- */}
    {coinResult && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] animate-in zoom-in duration-300">
            <div className={`
                p-8 rounded-full shadow-2xl border-4 flex flex-col items-center gap-4 bg-white
                ${coinResult === 'CARA' ? 'border-yellow-400' : 'border-slate-400'}
            `}>
                <div className={`
                    w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-inner
                    ${coinResult === 'CARA' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}
                `}>
                    <Coins size={48} className="animate-bounce" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800">
                    {coinResult}
                </h2>
            </div>
        </div>
    )}

    {/* --- MODAL DE AÇÕES (VISUAL "DASHBOARD" MODERNO) --- */}
    {selectedCardAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            {/* Container Principal */}
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-800">
                
                {/* COLUNA DA ESQUERDA: VISUALIZAÇÃO DA CARTA */}
                <div className="bg-slate-100 dark:bg-slate-950 p-8 flex flex-col items-center justify-center md:w-1/3 border-r border-gray-200 relative group">
                    <div className="transform transition-transform hover:scale-105 duration-300 shadow-2xl rounded-xl">
                        <PokemonCard card={selectedCardAction.card} />
                    </div>
                    {/* Botão Fechar Mobile (só aparece em telas pequenas) */}
                    <button 
                        onClick={() => setSelectedCardAction(null)} 
                        className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-full shadow-lg text-gray-500"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* COLUNA DA DIREITA: PAINEL DE CONTROLE */}
                <div className="flex-1 flex flex-col h-full bg-white">
                    {/* Cabeçalho do Painel */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white z-10">
                        <div>
                            <h3 className="text-3xl font-black text-gray-800 tracking-tighter italic uppercase mb-1">
                                {selectedCardAction.card.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-gray-400">
                                <span className={`w-2 h-2 rounded-full ${selectedCardAction.location === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></span>
                                {selectedCardAction.location === 'ACTIVE' ? 'Posição: Ativo' : `Posição: Banco ${selectedCardAction.index + 1}`}
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">Turno {selectedCardAction.card.turnPlayed}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedCardAction(null)} 
                            className="hidden md:block p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-300"
                        >
                            <X size={28}/>
                        </button>
                    </div>

                    {/* Conteúdo Rolável */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        
                        {/* 1. SEÇÃO DE DANO (AJUSTE DE JUIZ) */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14}/> Contador de Dano
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono">HP Máx: {selectedCardAction.card.hp}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                <button onClick={() => handleManualDamage(-10)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                    <Minus size={24}/>
                                </button>
                                <div className="text-center">
                                    <span className={`text-4xl font-black ${selectedCardAction.card.damage > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                                        {selectedCardAction.card.damage || 0}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dano Atual</p>
                                </div>
                                <button onClick={() => handleManualDamage(10)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                    <Plus size={24}/>
                                </button>
                            </div>
                        </div>

                        {/* 2. SEÇÃO DE ENERGIAS LIGADAS */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap size={14}/> Energias Ligadas
                            </h4>
                            {selectedCardAction.card.attachedEnergy && selectedCardAction.card.attachedEnergy.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedCardAction.card.attachedEnergy.map((e, idx) => {
                                        const EInfo = ENERGY_TYPES[e] || { icon: Circle, color: 'bg-gray-400', text: 'text-white' };
                                        const EIcon = EInfo.icon;
                                        return (
                                            <div key={idx} className={`relative group pl-2 pr-8 py-2 rounded-lg border flex items-center gap-2 shadow-sm transition-all hover:shadow-md ${EInfo.color} bg-opacity-10 border-gray-200`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${EInfo.color} ${EInfo.text} shadow-sm`}>
                                                    <EIcon size={14}/>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{EInfo.name}</span>
                                                <button 
                                                    onClick={() => handleRemoveEnergy(idx)}
                                                    className="absolute right-1 top-1 bottom-1 w-6 bg-white/50 hover:bg-red-500 hover:text-white rounded text-gray-400 flex items-center justify-center transition-colors"
                                                    title="Remover Energia"
                                                >
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200 text-center">
                                    Nenhuma energia ligada.
                                </div>
                            )}
                        </div>

                        {/* 3. AÇÕES RÁPIDAS (GRID DE BOTÕES) */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <PlayCircle size={14}/> Ações Disponíveis
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Habilidades (Destaque Especial) */}
                                {selectedCardAction.card.attacks && selectedCardAction.card.attacks.filter(atk => atk.cost[0] === 'Ability').map((ability, idx) => (
                                    <button 
                                        key={`ab-${idx}`} 
                                        onClick={() => useAbility(ability.name, selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}
                                        className="col-span-1 md:col-span-2 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between hover:shadow-md hover:border-yellow-400 transition-all group text-left"
                                    >
                                        <div>
                                            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider block mb-1">Habilidade</span>
                                            <span className="font-bold text-gray-800 group-hover:text-yellow-700 transition-colors">{ability.name}</span>
                                        </div>
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                                            <Sparkles size={20}/>
                                        </div>
                                    </button>
                                ))}

                                {/* Botões Padrão */}
                                <Button 
                                    variant="ghost" 
                                    className="h-14 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 justify-start px-4"
                                    onClick={() => requestEnergyAttachment(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}
                                >
                                    <Zap className="mr-3 text-gray-400" size={20}/> Ligar Energia
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    className="h-14 border border-gray-200 bg-gray-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 justify-start px-4"
                                    onClick={() => requestToolAttachment(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}
                                >
                                    <Briefcase className="mr-3 text-gray-400" size={20}/> Ligar Ferramenta
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    className="h-14 border border-gray-200 bg-gray-50 hover:bg-green-50 hover:border-green-300 hover:text-green-600 justify-start px-4" 
                                    onClick={() => requestEvolution(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}
                                >
                                    <GitMerge className="mr-3 text-gray-400" size={20}/> Evoluir Pokémon
                                </Button>

                                {/* Botão de Promover (Só aparece se estiver no Banco e não tiver Ativo) */}
                                {!players[selectedCardAction.pIndex].activePokemon && selectedCardAction.location === 'BENCH' && (
                                    <Button 
                                        variant="success" 
                                        className="h-14 col-span-1 md:col-span-2 justify-center shadow-lg shadow-green-200" 
                                        onClick={() => promoteFromBench(selectedCardAction.index, selectedCardAction.pIndex)}
                                    >
                                        <ChevronsUp className="mr-2" size={20}/> Promover para Ativo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Rodapé do Painel */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <Button variant="secondary" onClick={() => setSelectedCardAction(null)}>
                            Fechar Painel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )}

    {/* --- MODAL VISUAL DE PRÊMIOS --- */}
    {showPrizeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
            <div className="bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 text-center max-w-2xl w-full">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-widest flex items-center gap-3">
                        <Gift className="text-yellow-400 animate-bounce" size={32}/> 
                        Pegar Prêmio
                    </h3>
                    <button onClick={() => setShowPrizeModal(false)} className="bg-white/20 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-white">
                        <X size={24}/>
                    </button>
                </div>
                
                <p className="text-gray-300 mb-6 text-lg">
                    Você tem <span className="font-bold text-white text-2xl">{currentPlayer.prizes}</span> prêmios restantes.
                    <br/>Clique em uma carta para pegá-la!
                </p>

                {/* Renderiza as cartas grandes lado a lado */}
                <div className="flex justify-center">
                    <PrizeZone 
                        count={currentPlayer.prizes} 
                        compact={false} // Modo expandido!
                        onClick={() => { 
                            takePrize(1); // Clicar = Pegar 1 prêmio
                            // Se quiser pegar mais, o usuário clica de novo depois, ou fechamos o modal se for o comportamento padrão
                            // Para UX melhor: Se pegou 1, avisa e fecha se só precisava de 1.
                            // Mas como TCG às vezes pega 2, vamos manter aberto ou fechar? 
                            // Vamos manter aberto rapidinho ou fechar. Simplicidade: Pega 1 e fecha.
                            setShowPrizeModal(false); 
                        }} 
                    />
                </div>
                
                <div className="mt-8 text-sm text-gray-400">
                    (Se precisar pegar 2 prêmios, abra este menu novamente)
                </div>
            </div>
        </div>
    )}

    {damageConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <Card className="w-full max-w-sm border-2 border-red-500 shadow-2xl">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-700">Confirmar Dano Principal</h3>
                    <p className="text-sm text-gray-500">{damageConfirmation.attackName}</p>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                    <button 
                      onClick={() => setDamageConfirmation(prev => ({...prev, actualDamage: Math.max(0, prev.actualDamage - 10)}))}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                        <Minus size={20}/>
                    </button>
                    <div className="text-4xl font-black text-red-600 w-24 text-center">
                        {damageConfirmation.actualDamage}
                    </div>
                    <button 
                      onClick={() => setDamageConfirmation(prev => ({...prev, actualDamage: prev.actualDamage + 10}))}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                        <Plus size={20}/>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={() => setDamageConfirmation(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={finalizeAttack}>Confirmar</Button>
                </div>
            </Card>
        </div>
    )}

    {distributionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl border-2 border-purple-500 shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-purple-800">
                        <Crosshair size={24}/> Efeito de Distribuição
                    </h3>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 uppercase font-bold">Restante</span>
                        <div className="text-2xl font-black text-purple-600">
                            {distributionModal.total - distributionModal.allocated.reduce((a,b)=>a+b, 0)}
                        </div>
                    </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 bg-purple-50 p-2 rounded border border-purple-100">
                    Distribua o dano ({distributionModal.total}) nos Pokémon do banco do oponente da maneira que desejar.
                </p>

                <div className="flex-1 overflow-y-auto space-y-3 p-2">
                    {players[distributionModal.opponentIndex].benchPokemon.map((poke, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <PokemonCard card={poke} small={true} className="transform scale-75 origin-left" />
                                <div>
                                    <div className="font-bold text-sm">{poke.name}</div>
                                    <div className="text-xs text-gray-500">HP: {Math.max(0, poke.hp - (poke.damage||0))}/{poke.hp}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleDistributionChange(idx, -1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30"><Minus size={16}/></button>
                                <span className="font-bold w-8 text-center">{distributionModal.allocated[idx]}</span>
                                <button onClick={() => handleDistributionChange(idx, 1)} className="p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-30"><Plus size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-2 border-t flex justify-end gap-2">
                    <Button variant="primary" disabled={distributionModal.total - distributionModal.allocated.reduce((a,b)=>a+b, 0) !== 0} onClick={confirmDistribution}>
                        Confirmar Distribuição
                    </Button>
                </div>
            </Card>
        </div>
    )}

    {showEnergyModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <Card className="w-full max-w-lg">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div>
                    <h3 className="text-lg font-bold">Selecionar Tipo de Energia</h3>
                    <p className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                      Total no Pokémon: {
                        showEnergyModal.location === 'ACTIVE' 
                        ? players[showEnergyModal.pIndex].activePokemon?.attachedEnergy?.length || 0
                        : players[showEnergyModal.pIndex].benchPokemon[showEnergyModal.index]?.attachedEnergy?.length || 0
                      }
                    </p>
                </div>
                <button onClick={() => setShowEnergyModal(null)}><X/></button>
              </div>
              <div className="grid grid-cols-3 gap-2">{Object.entries(ENERGY_TYPES).map(([key, val]) => (<button key={key} onClick={() => confirmAttachEnergy(val)} className={`${val.color} p-3 rounded-lg flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}><val.icon size={24} className={val.text === 'text-white' ? 'text-white' : 'text-black'} /><span className={`text-xs font-bold ${val.text}`}>{val.name}</span></button>))}</div>
           </Card>
      </div>
    )}

    {showToolModal && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <Card className="w-full max-w-lg">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Selecionar Ferramenta</h3><button onClick={() => setShowToolModal(null)}><X/></button></div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {TOOLS.map((tool) => (
                      <button key={tool.id} onClick={() => confirmAttachTool(tool)} className="w-full p-3 bg-white border border-gray-200 rounded hover:bg-blue-50 flex justify-between items-center">
                          <span className="font-bold text-sm">{tool.name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{tool.effect}</span>
                      </button>
                  ))}
              </div>
           </Card>
      </div>
    )}

    {/* --- MODAL DE ATAQUE (VISUAL DE BATALHA) --- */}
    {showAttackModal && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200">
           <Card className="w-full max-w-lg border-none shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
              
              {/* Cabeçalho de Batalha */}
              <div className="flex justify-between items-center p-4 bg-red-600 shadow-md">
                 <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
                    <Sword className="text-white animate-pulse"/> 
                    Fase de Batalha
                 </h3>
                 <button onClick={() => setShowAttackModal(false)} className="hover:bg-red-700 p-1 rounded transition-colors"><X/></button>
              </div>

              <div className="p-6 space-y-4">
                 <div className="text-center mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Atacante</p>
                    <h2 className="text-2xl font-bold">{currentPlayer.activePokemon.name}</h2>
                 </div>

                 <div className="space-y-3">
                     {currentPlayer.activePokemon.attacks.filter(atk => atk.cost[0] !== 'Ability').map((atk, idx) => {
                          const canAfford = checkEnergyCost(atk.cost, currentPlayer.activePokemon.attachedEnergy || []);
                          
                          return (
                            <button 
                                key={idx} 
                                disabled={!canAfford} 
                                onClick={() => confirmAttack(atk)} 
                                className={`
                                    w-full p-4 rounded-xl border-l-8 flex justify-between items-center transition-all group relative overflow-hidden
                                    ${canAfford 
                                        ? 'bg-white text-gray-800 border-red-500 hover:bg-gray-50 hover:translate-x-1 shadow-lg' 
                                        : 'bg-gray-700 text-gray-500 border-gray-600 opacity-50 cursor-not-allowed grayscale'}
                                `}
                            >
                                {/* Fundo sutil animado ao passar o mouse */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>

                                <div className="flex flex-col items-start z-10">
                                    <span className={`font-black text-lg uppercase tracking-tight ${canAfford ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {atk.name}
                                    </span>
                                    
                                    {/* Bolinhas de Energia Coloridas */}
                                    <div className="flex gap-1 mt-1.5">
                                        {atk.cost.map((c, i) => { 
                                            // Usa as cores reais do constants.js
                                            const typeInfo = ENERGY_TYPES[c] || { color: 'bg-gray-400' }; 
                                            return (
                                                <div key={i} className={`w-4 h-4 rounded-full ${typeInfo.color} shadow-sm border border-black/10`} title={c}></div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="z-10 flex flex-col items-end">
                                    <span className={`text-3xl font-black ${canAfford ? 'text-red-600' : 'text-gray-600'}`}>
                                        {atk.damage}
                                    </span>
                                    {atk.damage && <span className="text-[10px] font-bold uppercase text-gray-400">Dano</span>}
                                </div>
                            </button>
                          );
                     })
                 }
                 
                 {currentPlayer.activePokemon.attacks.filter(atk => atk.cost[0] !== 'Ability').length === 0 && (
                     <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-xl text-gray-500">
                        Este Pokémon não possui ataques válidos.
                     </div>
                 )}
                 </div>
              </div>
           </Card>
      </div>
    )}

    {retreatModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
          <Card className="w-full max-w-sm border-2 border-blue-500">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-700">
                  <RefreshCw size={20}/> Pagar Custo de Recuo
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                  Selecione {retreatModal.cost} energia(s) para descartar:
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                  {retreatModal.availableEnergies.map((type, idx) => {
                      const isSelected = retreatModal.selectedIndices.includes(idx);
                      const EIcon = ENERGY_TYPES[type]?.icon || Circle;
                      return (
                          <button
                              key={idx}
                              onClick={() => {
                                  const newIndices = isSelected 
                                      ? retreatModal.selectedIndices.filter(i => i !== idx)
                                      : [...retreatModal.selectedIndices, idx].slice(0, retreatModal.cost);
                                  setRetreatModal(prev => ({ ...prev, selectedIndices: newIndices }));
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isSelected ? 'border-red-500 scale-110 shadow-lg' : 'border-transparent opacity-60'
                              } ${ENERGY_TYPES[type]?.color}`}
                          >
                              <EIcon size={20} className="text-white" />
                          </button>
                      );
                  })}
              </div>

              <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setRetreatModal(null)}>Cancelar</Button>
                  <Button 
                      variant="primary" 
                      className="flex-1" 
                      disabled={retreatModal.selectedIndices.length !== retreatModal.cost}
                      onClick={() => confirmRetreat(retreatModal.selectedIndices)}
                  >
                      Recuar
                  </Button>
              </div>
          </Card>
      </div>
    )}
    

    {showDeckModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-2 border-b"><div><h2 className="text-xl font-bold flex items-center gap-2">{DECKS[showDeckModal.deckId].name}</h2><p className="text-sm text-gray-500">{showDeckModal.target && showDeckModal.target.includes('EVOLVE') ? 'Selecione a carta para evoluir' : 'Selecione uma carta'}</p></div><button onClick={() => setShowDeckModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button></div>
              <div className="flex-1 overflow-y-auto p-2"><div className="flex flex-wrap gap-4 justify-center">{DECKS[showDeckModal.deckId].cards.map((card, idx) => (<PokemonCard key={idx} card={card} onClick={showDeckModal.target ? () => placePokemon(card, showDeckModal.target, showDeckModal.pIndex, showDeckModal.evolveTargetIndex) : undefined} actions={showDeckModal.target ? (<div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all"><span className="bg-white text-black font-bold px-3 py-1 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform opacity-0 group-hover:opacity-100">{showDeckModal.target.includes('EVOLVE') ? 'Evoluir' : 'Selecionar'}</span></div>) : null} />))}</div></div>
          </Card>
        </div>
    )}

    {gameState.phase === PHASES.GAME_OVER && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center max-w-md w-full shadow-2xl border-4 border-yellow-400"><h2 className="text-4xl font-black text-yellow-500 mb-4">FIM DE JOGO!</h2><p className="text-2xl mb-6">Vencedor: <span className="font-bold text-blue-600">{gameState.winner}</span></p><Button variant="primary" onClick={resetGame}>Nova Partida</Button></div></div>)}
    {showRules && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><Card className="w-full max-w-2xl h-[80vh] flex flex-col"><div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-xl font-bold">Guia Rápido de Regras</h2><button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-red-500"><Ban/>
    </button></div><input type="text" placeholder="Buscar regra..." className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600" value={searchRule} onChange={(e) => setSearchRule(e.target.value)} /><div className="flex-1 overflow-y-auto space-y-4">{RULES_DB.filter(r => r.title.toLowerCase().includes(searchRule.toLowerCase()) || r.text.toLowerCase().includes(searchRule.toLowerCase())).map(rule => (<div key={rule.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800"><h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">{rule.title}</h4><p className="text-sm text-black-700 dark:text-black-300">{rule.text}</p></div>))}</div></Card></div>)}
    
    {/* --- O RANKING GLOBAL AGORA PODE SER VISTO NO LOBBY OU NO JOGO --- */}
    {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
    {/* --- MODAL DO GERENCIADOR DE DECKS --- */}
    {showDeckManager && (
        <DeckManager 
            decks={availableDecks} 
            onClose={() => setShowDeckManager(false)}
            onUpdate={fetchDecksFromSupabase} // Recarrega quando você salva algo novo
        />
    )}
        
    {/* --- BOTÃO FLUTUANTE DE DESFAZER (UNDO) --- */}
    {history.length > 0 && gameState.phase !== PHASES.LOBBY && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <button 
                onClick={handleUndo}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl border border-gray-700 hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all group"
                title="Desfazer última ação"
            >
                <RotateCcw size={20} className="text-yellow-400 group-hover:-rotate-180 transition-transform duration-500"/>
                <span className="font-bold text-xs uppercase tracking-widest">Desfazer</span>
            </button>
        </div>
    )}
  </div>
); };