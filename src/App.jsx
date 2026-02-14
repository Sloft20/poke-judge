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
import DeckManager from './components/DeckManager';
import RuleBookModal from './components/RuleBookModal';
import EnergyModal from './components/EnergyModal'; // Adicione esta linha
import RetreatModal from './components/RetreatModal';
import ToolsModal from './components/ToolsModal';
import PlayerBoard from './components/PlayerBoard';
import GameLog from './components/GameLog';
import GameHeader from './components/GameHeader';




const ENERGY_IMAGES_SRC = {
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
    'Colorless': 'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Colorless-attack.png/60px-Colorless-attack.png'
};

// --- 4. FUNÇÕES UTILITÁRIAS ---

// --- FUNÇÃO AVANÇADA DE VERIFICAÇÃO DE ENERGIA ---
  // --- FUNÇÃO DE VERIFICAÇÃO DE ENERGIA (ROBUSTA) ---
  const checkEnergyCost = (cost, attachedEnergies) => {
    // 1. Se não tiver custo ou for array vazio, é GRÁTIS
    if (!cost || cost.length === 0) return true;
    
    // 2. Habilidades são grátis de energia
    if (cost[0] === 'Ability') return true;

    // 3. NORMALIZAÇÃO (O SEGREDO DA CORREÇÃO)
    // Garante que temos um array, e converte Objetos de energia ({type: 'Fire'}) em Strings ('Fire')
    const rawAttached = attachedEnergies || [];
    const available = rawAttached.map(e => (typeof e === 'object' && e?.type) ? e.type : e);

    // 4. Ordenar o custo: Específicos primeiro, Incolor por último
    const sortedCost = [...cost].sort((a, b) => {
        if (a === 'Colorless') return 1;
        if (b === 'Colorless') return -1;
        return 0;
    });
    
    // 5. Verificar item por item
    for (const reqType of sortedCost) {
        if (reqType === 'Colorless') {
            // Para Incolor, qualquer energia serve
            if (available.length > 0) {
                available.pop(); // Remove a última disponível (tanto faz qual)
            } else {
                return false; // Faltou energia
            }
        } else {
            // Para Específica (Fogo, Água...), precisa ser exata
            const index = available.indexOf(reqType);
            if (index !== -1) {
                available.splice(index, 1); // Remove a energia usada
            } else {
                return false; // Não tem a energia específica exigida
            }
        }
    }
    
    return true; // Pagou todos os custos
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

    // 1. Busca os dados
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

    // 2. Cálculos
    const calculateLiveStats = () => {
        const deckStats = {};
        const playerStats = {};

        matches.forEach(m => {
            // Stats Decks
            if (!deckStats[m.winner_deck]) deckStats[m.winner_deck] = { name: m.winner_deck, wins: 0, plays: 0 };
            if (!deckStats[m.loser_deck]) deckStats[m.loser_deck] = { name: m.loser_deck, wins: 0, plays: 0 };
            deckStats[m.winner_deck].wins++;
            deckStats[m.winner_deck].plays++;
            deckStats[m.loser_deck].plays++;

            // Stats Jogadores
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

    const { deckStats, playerStats } = calculateLiveStats();
    const sortedDecks = Object.values(deckStats).sort((a,b) => (b.wins/b.plays) - (a.wins/a.plays));
    const sortedPlayers = Object.entries(playerStats).map(([name, stat]) => ({name, ...stat})).sort((a,b) => (b.wins/b.plays) - (a.wins/a.plays));

    // --- ÍCONES DE TROFÉU (RESTAURADOS) ---
    const getRankIcon = (index) => {
        if (index === 0) return <Trophy size={20} className="text-yellow-500 drop-shadow-sm" fill="currentColor"/>; // Ouro
        if (index === 1) return <Trophy size={18} className="text-gray-400 drop-shadow-sm" fill="currentColor"/>;   // Prata
        if (index === 2) return <Trophy size={16} className="text-orange-400 drop-shadow-sm" fill="currentColor"/>; // Bronze
        return <span className="text-gray-400 font-mono font-bold text-sm">#{index + 1}</span>;
    };

    // --- COMPONENTE DE LOG (TERMINAL DARK COM TEXTO BRANCO) ---
    const LogTerminal = ({ logs }) => {
        if (!logs) return <div className="text-gray-500">Log vazio.</div>;
        
        return (
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed custom-scrollbar bg-[#0f172a] text-gray-100">
                {logs.split('\n').map((line, i) => {
                    // Estilos de Destaque
                    let lineStyle = "text-gray-300"; // Padrão Branco/Cinza
                    let icon = null;

                    if (line.includes('NOCAUTE') || line.includes('Nocauteado')) {
                        lineStyle = "text-red-400 font-bold bg-red-900/20 py-1 px-2 rounded border-l-2 border-red-500 block mb-1";
                        icon = "💀 ";
                    } else if (line.includes('EVOLUIU') || line.includes('Rare Candy')) {
                        lineStyle = "text-cyan-300 font-bold bg-cyan-900/20 py-1 px-2 rounded border-l-2 border-cyan-500 block mb-1";
                        icon = "✨ ";
                    } else if (line.includes('Vencedor') || line.includes('Vitória')) {
                        lineStyle = "text-yellow-400 font-black text-sm border-b border-yellow-500/50 pb-1 block mt-2";
                        icon = "🏆 ";
                    } else if (line.includes('Turno')) {
                        lineStyle = "text-blue-400 font-bold mt-2 block border-t border-slate-700 pt-2";
                    }

                    const match = line.match(/^\[(.*?)\](.*)/);
                    if (match) {
                        return (
                            <div key={i} className={`${lineStyle} break-words`}>
                                <span className="text-slate-500 mr-2 select-none">[{match[1]}]</span>
                                {icon}{match[2]}
                            </div>
                        );
                    }
                    return <div key={i} className={lineStyle}>{line}</div>;
                })}
            </div>
        );
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          
          {/* --- CARD PRINCIPAL: TEMA CLARO (LIGHT) --- */}
          <Card className="w-full max-w-4xl h-[85vh] flex flex-col bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
              
              {/* Header Claro */}
              <div className="bg-white p-6 flex justify-between items-center border-b border-gray-100">
                  <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-gray-800">
                      <Trophy className="text-yellow-500" size={32}/> 
                      Ranking <span className="text-blue-600">Pro</span>
                  </h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 p-2 rounded-full">
                      <X size={24}/>
                  </button>
              </div>
              
              {/* Abas Claras */}
              <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200">
                  {['decks', 'players', 'history'].map(t => (
                      <button 
                          key={t}
                          onClick={() => setTab(t)} 
                          className={`
                              flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                              ${tab === t 
                                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200 translate-y-[-2px]' 
                                  : 'bg-transparent text-gray-500 hover:bg-gray-200/50'}
                          `}
                      >
                          {t === 'decks' ? '🔥 Decks' : t === 'players' ? '👤 Jogadores' : '📜 Histórico'}
                      </button>
                  ))}
              </div>

              {/* Conteúdo (Tabelas Claras) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-4">
                  {tab === 'history' ? (
                      <div className="space-y-3">
                          {loading ? (
                              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500"/></div>
                          ) : matches.length === 0 ? (
                              <p className="text-center text-gray-400 mt-10">Sem histórico.</p>
                          ) : matches.map((m, idx) => (
                              // Card Histórico (Estilo Clean)
                              <div key={idx} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row overflow-hidden group">
                                  <div className="bg-gray-50 p-4 w-32 flex flex-col justify-center items-center border-r border-gray-100">
                                      <span className="text-xs font-bold text-gray-500">{new Date(m.created_at).toLocaleDateString()}</span>
                                      <span className="text-[10px] text-gray-400">{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <div className="flex-1 p-4 flex justify-between items-center">
                                      <div className="text-right flex-1">
                                          <div className="font-bold text-gray-800 flex items-center justify-end gap-2">
                                              {m.winner_name} <Crown size={14} className="text-yellow-500"/>
                                          </div>
                                          <div className="text-[10px] bg-green-100 text-green-700 px-2 rounded inline-block font-bold">{m.winner_deck}</div>
                                      </div>
                                      <div className="mx-4 text-xs font-black text-gray-300">VS</div>
                                      <div className="text-left flex-1 opacity-60">
                                          <div className="font-bold text-gray-600">{m.loser_name}</div>
                                          <div className="text-[10px] text-gray-500">{m.loser_deck}</div>
                                      </div>
                                  </div>
                                  <button onClick={() => setSelectedMatchLogs(m.game_logs)} className="p-4 bg-gray-50 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors border-l border-gray-100 font-bold text-xs uppercase tracking-wider">
                                      Ver Log
                                  </button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      // Tabela Ranking (Estilo Clean com Troféus)
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                  <tr>
                                      <th className="px-6 py-4 text-center">Posição</th>
                                      <th className="px-6 py-4">{tab === 'decks' ? 'Deck' : 'Jogador'}</th>
                                      <th className="px-6 py-4 text-center">Partidas</th>
                                      <th className="px-6 py-4 text-center">Vitórias</th>
                                      <th className="px-6 py-4 text-right">Win Rate</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 bg-white">
                                  {(tab === 'decks' ? sortedDecks : sortedPlayers).map((item, idx) => {
                                      const wr = ((item.wins / item.plays) * 100);
                                      return (
                                          <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                              <td className="px-6 py-4 flex justify-center items-center">
                                                  {getRankIcon(idx)}
                                              </td>
                                              <td className="px-6 py-4 font-bold text-gray-800">
                                                  {item.name}
                                              </td>
                                              <td className="px-6 py-4 text-center text-gray-600 font-mono">
                                                  {item.plays}
                                              </td>
                                              <td className="px-6 py-4 text-center text-gray-600 font-mono">
                                                  {item.wins}
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${wr >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                      {wr.toFixed(1)}%
                                                  </span>
                                              </td>
                                          </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          </Card>

          {/* --- TERMINAL DE LOGS (MANTIDO O NOVO, COMO PEDIDO) --- */}
          {selectedMatchLogs && (
              <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 animate-in zoom-in duration-200">
                  <div className="w-full max-w-3xl h-[85vh] flex flex-col bg-[#0f172a] rounded-xl shadow-2xl border border-slate-600 overflow-hidden font-mono">
                      
                      {/* Barra do Terminal */}
                      <div className="bg-[#1e293b] p-3 flex justify-between items-center border-b border-slate-700">
                          <span className="text-slate-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                              <History size={14}/> Registro de Combate
                          </span>
                          <button onClick={() => setSelectedMatchLogs(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
                      </div>

                      {/* Conteúdo do Terminal (Texto Branco/Colorido) */}
                      <LogTerminal logs={selectedMatchLogs} />

                      {/* Footer */}
                      <div className="p-4 bg-[#1e293b] border-t border-slate-700 flex justify-end">
                          <button 
                              onClick={() => setSelectedMatchLogs(null)}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase transition-colors shadow-lg"
                          >
                              Fechar Log
                          </button>
                      </div>
                  </div>
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
  // Estado para controlar a visibilidade da barra lateral (Log + Controles)
  const [showSidebar, setShowSidebar] = useState(true);
  // --- SISTEMA DE DESFAZER (UNDO) ---
  const [history, setHistory] = useState([]);
  // --- GERENCIADOR DE DECKS (SUPABASE) ---
  const [showDeckManager, setShowDeckManager] = useState(false);
  const [availableDecks, setAvailableDecks] = useState({});
  const decksRef = useRef({}); // Começa vazio
  // --- CARREGA OS DADOS ASSIM QUE O SITE ABRE ---
  useEffect(() => {
    fetchDecksFromSupabase();
  }, []); // <--- Os colchetes vazios [] garantem que rode ao iniciar

  // Função que vai no Banco e busca os decks novos
// --- FUNÇÃO DE BUSCA ROBUSTA (Busca Separada) ---
  // --- FUNÇÃO DE BUSCA SEGURA (Versão Simplificada) ---
  const fetchDecksFromSupabase = async () => {
      // addLog("🔄 Sincronizando dados...", "INFO"); // Opcional se tiver log
      console.log("🔄 Buscando Decks e Cartas...");

      try {
          // 1. Busca TUDO de novo (sem cache)
          const { data: decksData } = await supabase.from('decks').select('*');
          const { data: cardsData } = await supabase.from('cards').select('*');

          if (decksData && cardsData) {
              const dbDecks = {};

              // Monta a estrutura
              decksData.forEach(d => {
                  dbDecks[d.id] = { ...d, cards: [] };
              });

              cardsData.forEach(c => {
                  if (dbDecks[c.deck_id]) {
                      dbDecks[c.deck_id].cards.push(c);
                  }
              });

              // ATUALIZA O ESTADO DO APP
              setAvailableDecks(dbDecks);
              decksRef.current = dbDecks; // <--- ADICIONE ISSO (Salva no cofre)
              console.log("✅ Dados carregados no App:", Object.keys(dbDecks).length, "decks.");
              
              // --- CORREÇÃO DO "STATUS STALE" (MOCHILA VELHA) ---
              // Se os jogadores já selecionaram decks, atualizamos a mão deles com a versão nova
              setPlayers(prevPlayers => prevPlayers.map(p => {
                  if (p.deckArchetype && dbDecks[p.deckArchetype]) {
                      return { ...p, activeDeck: dbDecks[p.deckArchetype] }; // Força atualização
                  }
                  return p;
              }));
          }
      } catch (error) {
          console.error("Erro fatal na busca:", error);
      }
  };
  // --- FUNÇÃO DE MIGRAÇÃO (USAR UMA VEZ) ---
  const migrateDecksToSupabase = async () => {
      if (!window.confirm("Posso copiar os decks locais para o Banco de Dados agora?")) return;
      
      console.log("🚀 Iniciando migração...");
      
      // 1. Itera sobre cada deck do arquivo local
      for (const [key, deck] of Object.entries(DECKS)) {
          console.log(`Processando deck: ${deck.name}...`);

          // Salva o Deck
          const { error: deckError } = await supabase
              .from('decks')
              .upsert([{ id: key, name: deck.name, color: deck.color || 'bg-gray-500' }]);

          if (deckError) {
              console.error(`Erro no deck ${deck.name}:`, deckError);
              continue; // Pula se der erro
          }

          // Salva as Cartas
          const cardsToInsert = deck.cards.map(c => ({
              deck_id: key,
              name: c.name,
              type: c.type,
              hp: c.hp,
              stage: c.stage,
              image: c.image || '',
              retreat: c.retreat || 1,
              attacks: c.attacks || []
          }));

          // Limpa cartas antigas desse deck para não duplicar
          await supabase.from('cards').delete().eq('deck_id', key);
          
          const { error: cardError } = await supabase.from('cards').insert(cardsToInsert);
          
          if (cardError) console.error(`Erro nas cartas de ${deck.name}:`, cardError);
      }
      
      alert("✅ Migração Concluída! Verifique o Supabase.");
      fetchDecksFromSupabase(); // Tenta puxar do banco para testar
  };

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

  // No App.jsx, localize e SUBSTITUA a função handleStartGameFromLobby por esta:

const handleStartGameFromLobby = () => {
    console.log("🚀 Iniciando partida...");

    // 1. Define a fonte de dados com SEGURANÇA
    // Tenta pegar do Cofre (Ref) > Estado (Supabase) > Arquivo Local (DECKS)
    let sourceDecks = {};
    
    if (decksRef.current && Object.keys(decksRef.current).length > 0) {
        sourceDecks = decksRef.current;
    } else if (availableDecks && Object.keys(availableDecks).length > 0) {
        sourceDecks = availableDecks;
    } else {
        // FALLBACK FINAL: Se nada carregou do banco, usa os decks locais para não travar
        console.warn("⚠️ Usando decks locais (Fallback) pois o banco ainda não respondeu.");
        sourceDecks = DECKS;
    }

    const newPlayers = players.map(p => {
        // Tenta achar o deck pelo ID. Se não achar, tenta buscar no local DECKS pelo ID padrão (ex: 'CHARIZARD')
        let freshDeckData = sourceDecks[p.deckArchetype];

        if (!freshDeckData) {
            console.warn(`Deck ${p.deckArchetype} não encontrado na fonte principal. Tentando fallback local...`);
            freshDeckData = DECKS[p.deckArchetype];
        }

        if (!freshDeckData) {
            addLog(`ERRO FATAL: Deck ${p.deckArchetype} não existe!`, 'CRIT');
            return { ...p, deck: [], deckCount: 0 };
        }

        const originalCards = freshDeckData?.cards || [];
        
        // Simular deck de 60 cartas
        let fullDeck = [];
        if (originalCards.length > 0) {
            while (fullDeck.length < 60) {
                // deep clone simples para evitar referência cruzada
                const clone = originalCards.map(c => ({...c, uniqueId: Math.random().toString(36)}));
                fullDeck = [...fullDeck, ...clone];
            }
            fullDeck = fullDeck.slice(0, 60); 
        }
        
        const shuffledDeck = shuffleDeck([...fullDeck]);
        
        // Separa a mão inicial (7 cartas)
        const initialHand = shuffledDeck.splice(0, 7);
        
        // Separa as cartas de prêmio (6 cartas) - IMPORTANTE: Isso faltava e altera a conta do deck!
        // No Pokémon real, prêmios saem do topo DEPOIS da mão.
        const prizeCards = shuffledDeck.splice(0, 6);

        return {
            ...p,
            deckName: freshDeckData?.name || p.deckArchetype,
            deck: shuffledDeck, // Deck restante (aprox 47 cartas)
            hand: initialHand,
            prizes: 6, // Contador visual
            prizeCards: prizeCards, // Array real dos prêmios (futuro uso)
            deckCount: shuffledDeck.length, 
            handCount: initialHand.length 
        };
    });

    // TRAVA DE SEGURANÇA: Se o deck ficou vazio, não inicia!
    if (newPlayers[0].deckCount === 0 || newPlayers[1].deckCount === 0) {
        alert("Erro de Carregamento: Os decks estão vazios. Aguarde o carregamento do banco ou verifique sua internet e tente novamente.");
        return; // Cancela o início do jogo
    }

    setPlayers(newPlayers);
    
    setGameState(prev => ({ 
        ...prev, 
        phase: PHASES.SETUP 
    }));
    setGameTimer(0);
    
    addLog(`Mesa configurada. Decks carregados com ${newPlayers[0].deckCount} cartas.`, 'INFO');
    addLog(`${newPlayers[0].name} comprou 7 cartas.`, 'INFO');
    addLog(`${newPlayers[1].name} comprou 7 cartas.`, 'INFO');
};

  const saveMatchResult = async (winnerIndex) => {
    const winner = players[winnerIndex];
    const loser = players[winnerIndex === 0 ? 1 : 0];

    // --- CORREÇÃO: Traduzir ID para Nome ---
    // Tenta ler do cofre (decksRef) para garantir dados atualizados, ou usa availableDecks
    const currentDecks = (typeof decksRef !== 'undefined' && decksRef.current && Object.keys(decksRef.current).length > 0) 
        ? decksRef.current 
        : availableDecks;

    // Busca o nome do deck usando o ID. Se não achar (ex: deck deletado), usa o próprio ID como reserva.
    const winnerDeckName = currentDecks[winner.deckArchetype]?.name || winner.deckArchetype;
    const loserDeckName = currentDecks[loser.deckArchetype]?.name || loser.deckArchetype;
    // ---------------------------------------

    // Converte o array de logs em uma string formatada para leitura
    const fullLogText = logs.map(l => `[${l.time}] ${l.text}`).join('\n');

    const matchData = {
        winner_name: winner.name,
        loser_name: loser.name,
        winner_deck: winnerDeckName, // <--- Salva o NOME ("Charizard ex")
        loser_deck: loserDeckName,   // <--- Salva o NOME ("Dragapult ex")
        game_logs: fullLogText,
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
    // --- BLOQUEIO DE SEGURANÇA ---
    // Se o jogador não tem um Pokémon Ativo (ex: acabou de ser nocauteado),
    // ele NÃO pode iniciar o turno (comprar carta) até promover alguém do banco.
    if (!currentPlayer.activePokemon) {
        addLog(`REGRA: Você precisa promover um Pokémon do banco para o Ativo antes de começar!`, 'CRIT', gameState.currentPlayerIndex);
        return; // <--- O código para aqui e não deixa avançar
    }

    // Se tiver ativo, segue o jogo normal:
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
// SUBSTITUA A FUNÇÃO placePokemon INTEIRA POR ESTA:
  const placePokemon = (card = null, destination = 'BENCH', pIndex = gameState.currentPlayerIndex, evolveTargetIndex = null) => {
    saveGameHistory();
    const player = players[pIndex];
    
    // Proteção contra cartas vazias
    if (!card) { console.error("Erro: Carta inválida."); return; }

    // Criação do objeto da carta
    const cardData = { 
        ...card, 
        turnPlayed: gameState.turnCount, 
        attachedEnergy: [], 
        attachedTool: null, 
        damage: 0, 
        abilitiesUsedThisTurn: [] 
    };

    console.log(`Tentando jogar ${cardData.name} em ${destination}...`); // Debug

    // --- REGRA 1: BÁSICOS ---
    // Só pode baixar diretamente se for Básico (Stage 0)
    if ((destination === 'ACTIVE' || destination === 'BENCH') && parseInt(cardData.stage) !== 0) {
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
    // --- LÓGICA DE EVOLUÇÃO ---
    else if (destination === 'EVOLVE_ACTIVE' || destination === 'EVOLVE_BENCH') {
        // Identifica o alvo da evolução com segurança
        const targetPokemon = destination === 'EVOLVE_ACTIVE' ? player.activePokemon : player.benchPokemon[evolveTargetIndex];
        
        if (!targetPokemon) {
             console.error("Erro: Alvo da evolução não encontrado.");
             return;
        }

        // --- CORREÇÃO DO NOME DO PAI (IMPORTANTE) ---
        // Lê tanto do Supabase (evolves_from) quanto do App antigo (evolvesFrom)
        const requiredName = cardData.evolves_from || cardData.evolvesFrom;
        const targetName = targetPokemon.name;

        console.log(`Evoluindo: ${cardData.name} (Pede: ${requiredName}) -> Alvo: ${targetName}`); // Debug

        // --- VERIFICAÇÃO DE RARE CANDY ---
        const isRareCandyAction = player.allowRareCandy && parseInt(cardData.stage) === 2 && parseInt(targetPokemon.stage) === 0;

        // Se NÃO for Rare Candy, o nome precisa bater.
        // Se requiredName for nulo (carta não salva direito), avisa.
        if (!requiredName && !isRareCandyAction) {
             addLog(`ERRO NA CARTA: ${cardData.name} não tem o campo "Evolui de" configurado no Deck Manager.`, 'CRIT', pIndex);
             return;
        }

        if (requiredName !== targetName && !isRareCandyAction) {
            addLog(`EVOLUÇÃO INVÁLIDA: ${cardData.name} evolui de ${requiredName}, mas o alvo é ${targetName}.`, 'CRIT', pIndex);
            return;
        }

        const oldEnergies = targetPokemon.attachedEnergy || []; 
        const oldTool = targetPokemon.attachedTool; 
        const oldDamage = targetPokemon.damage || 0;
        
        // Mantém danos e energias
        const newPokemonStats = { ...cardData, attachedEnergy: oldEnergies, attachedTool: oldTool, damage: oldDamage };
        
        if (destination === 'EVOLVE_ACTIVE') {
            updatePlayer(pIndex, { 
                activePokemon: newPokemonStats, 
                activeCondition: CONDITIONS.NONE, 
                handCount: Math.max(0, player.handCount - 1),
                allowRareCandy: false 
            });
            addLog(`EVOLUIU: ${targetName} para ${cardData.name} (Ativo).`, 'SUCCESS', pIndex);
        } else {
            const newBench = [...player.benchPokemon];
            if (typeof evolveTargetIndex === 'number' && newBench[evolveTargetIndex]) {
                newBench[evolveTargetIndex] = newPokemonStats;
                updatePlayer(pIndex, { 
                    benchPokemon: newBench, 
                    handCount: Math.max(0, player.handCount - 1),
                    allowRareCandy: false 
                });
                addLog(`EVOLUIU: ${targetName} para ${cardData.name} (Banco).`, 'SUCCESS', pIndex);
            } else {
                console.error("Erro: Índice do banco inválido para evolução.");
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
    if (!showEnergyModal) return;

    const { pIndex, location, index } = showEnergyModal;
    const p = players[pIndex];

    // Identifica a chave da energia (ex: 'Fire', 'Water') baseada no nome
    let eKey = 'Colorless';
    Object.entries(ENERGY_TYPES).forEach(([key, val]) => {
      if (val.name === energyType.name) eKey = key;
    });

    if (location === 'ACTIVE') {
      // 1. Atualiza o estado do Ativo
      updatePlayer(pIndex, {
        activePokemon: {
          ...p.activePokemon,
          attachedEnergy: [...(p.activePokemon.attachedEnergy || []), eKey]
        },
        energyAttachedThisTurn: true,
        handCount: Math.max(0, p.handCount - 1)
      });

      // 2. LOG DETALHADO (Nome da Energia + Nome do Pokémon Ativo)
      addLog(`⚡ Ligou Energia de ${energyType.name} em ${p.activePokemon.name} (Ativo).`, 'INFO', pIndex);

    } else {
      // 1. Atualiza o estado do Banco
      const newBench = [...p.benchPokemon];
      newBench[index] = {
        ...newBench[index],
        attachedEnergy: [...(newBench[index].attachedEnergy || []), eKey]
      };

      updatePlayer(pIndex, {
        benchPokemon: newBench,
        energyAttachedThisTurn: true,
        handCount: Math.max(0, p.handCount - 1)
      });

      // 2. LOG DETALHADO (Nome da Energia + Nome do Pokémon do Banco)
      // Usamos newBench[index].name para garantir que pegamos o nome correto do alvo
      addLog(`⚡ Ligou Energia de ${energyType.name} em ${newBench[index].name} (Banco).`, 'INFO', pIndex);
    }
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
  // --- NOVA FUNÇÃO DE REGISTRO: DESCARTE MANUAL ---
  const handleManualDiscard = () => {
      saveGameHistory(); // Salva para poder desfazer (Ctrl+Z)
      const { pIndex, location, index, card } = selectedCardAction;
      
      // 1. Remove da origem (Ativo ou Banco)
      if (location === 'ACTIVE') {
          updatePlayer(pIndex, { 
              activePokemon: null, 
              activeCondition: CONDITIONS.NONE,
              // Adiciona ao histórico de descarte do jogador
              discardPile: [...(players[pIndex].discardPile || []), card]
          });
      } else {
          const newBench = players[pIndex].benchPokemon.filter((_, i) => i !== index);
          updatePlayer(pIndex, { 
              benchPokemon: newBench, 
              benchCount: newBench.length,
              discardPile: [...(players[pIndex].discardPile || []), card]
          });
      }

      addLog(`REGISTRO: ${card.name} foi enviado para o Descarte.`, 'WARN', pIndex);
      setSelectedCardAction(null); // Fecha o menu
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
  
  // SUBSTITUA A FUNÇÃO takePrize POR ESTA:
  const takePrize = (count) => { 
      const current = players[gameState.currentPlayerIndex].prizes; 
      const newCount = Math.max(0, current - count); 
      
      updatePlayer(gameState.currentPlayerIndex, { 
          prizes: newCount,
          handCount: players[gameState.currentPlayerIndex].handCount + count // Adiciona à mão visualmente
      }); 
      
      addLog(`Pegou carta de prêmio. Restantes: ${newCount}`, 'SUCCESS', gameState.currentPlayerIndex); 
      
      // Fecha o modal automaticamente após pegar 1 prêmio para agilizar
      

      if (newCount === 0) { 
          declareWinner(gameState.currentPlayerIndex); 
      } 
  };
  
  // SUBSTITUA A FUNÇÃO reportKnockout POR ESTA:
  const reportKnockout = (victimIndex) => { 
    const victim = players[victimIndex]; 
    const attackerIndex = victimIndex === 0 ? 1 : 0; 
    const attacker = players[attackerIndex];

    // 1. Lógica de Prêmios: Ex/V valem 2, outros valem 1
    let prizeCount = 1;
    if (victim.activePokemon && (victim.activePokemon.name.includes('ex') || victim.activePokemon.name.includes(' V'))) {
        prizeCount = 2;
    }
    
    addLog(`${victim.activePokemon ? victim.activePokemon.name : 'Ativo'} foi Nocauteado!`, 'CRIT', victimIndex); 

    // 2. Limpa o Pokémon Nocauteado
    updatePlayer(victimIndex, { activePokemon: null, activeCondition: CONDITIONS.NONE }); 

    // 3. Verifica Vitória por Falta de Banco (Bench Out)
    // Se o oponente não tem ninguém no banco para substituir, o atacante ganha na hora.
    if (victim.benchPokemon.length === 0) { 
        addLog(`SEM POKÉMON NO BANCO! ${victim.name} perdeu o jogo.`, 'CRIT', victimIndex); 
        declareWinner(attackerIndex); 
        return; 
    } 
    
    // 4. Verifica Vitória por Prêmios (Se pegar os prêmios agora, ganha?)
    if (attacker.prizes - prizeCount <= 0) {
        addLog(`PEGOU TODOS OS PRÊMIOS! ${attacker.name} venceu o jogo!`, 'SUCCESS', attackerIndex);
        declareWinner(attackerIndex);
        return;
    }

    // 5. Automação: Abre o modal de prêmios para o Vencedor
    // Setamos o estado para mostrar o modal e definimos quantos prêmios ele DEVE pegar.
    if (gameState.currentPlayerIndex === attackerIndex) {
        setShowPrizeModal(true);
        // Opcional: Você pode criar um estado temporário 'prizesToTake' se quiser forçar a pegar a quantidade exata
        addLog(`Pegue ${prizeCount} carta(s) de prêmio.`, 'WARN', attackerIndex);
    } else {
        // Se foi dano de veneno/queimadura no turno do oponente, avisa para ele pegar depois
        addLog(`${attacker.name} deve pegar ${prizeCount} prêmio(s).`, 'WARN', attackerIndex);
    }
    
    addLog(`Atenção: ${victim.name} deve promover um Pokémon do Banco.`, 'WARN', victimIndex); 
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
        const deckInfo = availableDecks[p.deckArchetype] || { name: 'Carregando...', color: 'bg-gray-400' }; 
        
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
    // --- RENDERIZAÇÃO DO LOBBY (COM O GERENCIADOR JUNTO) ---
  if (gameState.phase === PHASES.LOBBY) {
    return (
      <> {/* <--- Atenção: Adicionamos este fragmento para agrupar os dois */}
        <GameLobby 
          players={players} 
          onUpdatePlayer={updatePlayer} 
          onStartGame={handleStartGameFromLobby} 
          onShowRanking={() => setShowRanking(true)}
          availableDecks={availableDecks} 
          onManageDecks={() => setShowDeckManager(true)}
        />

        {/* --- O GERENCIADOR PRECISA ESTAR AQUI TAMBÉM --- */}
        {showDeckManager && (
            <DeckManager 
                decks={availableDecks} 
                onClose={() => setShowDeckManager(false)}
                onUpdate={fetchDecksFromSupabase}
            />
        )}
        
        {/* --- E O RANKING TAMBÉM (Se tiver) --- */}
        {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
      </> 
    );
  }

 // ... (código anterior)

  return (
  <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans relative overflow-x-hidden">
    
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
          
           {/* COMPONENTES DE LOBBY */}
           <GameLobby 
                players={players} 
                onUpdatePlayer={updatePlayer} 
                onStartGame={handleStartGameFromLobby} 
                onShowRanking={() => setShowRanking(true)}
                availableDecks={availableDecks} 
                onManageDecks={() => setShowDeckManager(true)}
           />

            {showDeckManager && (
                <DeckManager 
                    decks={availableDecks} 
                    onClose={() => setShowDeckManager(false)}
                    onUpdate={fetchDecksFromSupabase}
                />
            )}
            {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
      </div>
    )}

    {/* 2. INTERFACE DE JOGO (SÓ APARECE SE NÃO ESTIVER NO LOBBY) */}
    {gameState.phase !== PHASES.LOBBY && (
      <>
        {/* --- NOVO HEADER (MÓDULO DE COMANDO) --- */}
        <div className="mb-6 sticky top-0 z-40">
            <GameHeader 
                gameState={gameState}
                gameTimer={gameTimer}
                isTimerPaused={isTimerPaused}
                onToggleTimer={() => setIsTimerPaused(!isTimerPaused)}
                onCoinFlip={handleCoinFlip}
                onOpenDeckManager={() => setShowDeckManager(true)}
                onOpenRanking={() => setShowRanking(true)}
                onOpenRules={() => setShowRules(true)}
                
                // NOVAS PROPS PARA O SIDEBAR
                showSidebar={showSidebar}
                onToggleSidebar={() => setShowSidebar(!showSidebar)}
            />
        </div>

        {/* --- LAYOUT PRINCIPAL (FLEXBOX PARA SIDEBAR RETRÁTIL) --- */}
        <main className="flex gap-6 h-[calc(100vh-140px)] items-start">
          
          {/* COLUNA ESQUERDA: TABULEIROS (EXPANSÍVEL) */}
          <div className={`
                flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full transition-all duration-500 ease-in-out
                ${showSidebar ? 'w-full lg:w-3/4' : 'w-full'} 
          `}>
              {/* Barra de Status do Turno */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center sticky top-0 z-30">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-400"/>
                    <span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-100">Turno: {gameState.turnCount}</span>
                  </div>
                  {/* Botões de Fase (Mantidos iguais) */}
                  <div className="flex gap-2">
                      {gameState.phase === PHASES.SETUP && (<Button variant="success" icon={PlayCircle} onClick={finishSetup}>Iniciar Partida</Button>)}
                      {gameState.phase === PHASES.START_TURN && (<div className="animate-pulse"><Button variant="primary" icon={ChevronRight} onClick={startTurnLogic}>Confirmar Início</Button></div>)}
                      {gameState.phase === PHASES.DRAW && (<div className="animate-pulse"><Button variant="primary" icon={History} onClick={drawCard}>COMPRAR (Obrigatório)</Button></div>)}
                      {(gameState.phase === PHASES.ACTION || gameState.phase === PHASES.ATTACK) && (<Button variant="secondary" onClick={endTurn}>Encerrar Turno</Button>)}
                      {gameState.phase === PHASES.CHECKUP && (<Button variant="primary" icon={RotateCcw} onClick={performCheckup}>Concluir Checkup</Button>)}
                  </div>
              </div>

              {/* --- ÁREA DO JOGADOR 1 --- */}
              <PlayerBoard 
                  player={players[0]} 
                  index={0}
                  gameState={gameState}
                  deckInfo={availableDecks[players[0].deckArchetype] || { name: 'Carregando...', color: 'bg-gray-400' }}
                  onCardClick={(loc, idx) => handleExistingCardClick(0, loc, idx)}
                  onAddPokemon={(target) => setShowDeckModal({ deckId: players[0].deckArchetype, pIndex: 0, target })}
                  onUpdateStatus={(updates) => updateStatus(0, updates)}
                  actions={{
                      playItem, playSupporter, retreat, openAttackModal, reportKnockout,
                      handleMulligan: () => handleMulligan(0),
                      onOpenPrizes: () => gameState.currentPlayerIndex === 0 ? setShowPrizeModal(true) : null
                  }}
              />

              {/* --- ÁREA DO JOGADOR 2 --- */}
              <PlayerBoard 
                  player={players[1]} 
                  index={1}
                  gameState={gameState}
                  deckInfo={availableDecks[players[1].deckArchetype] || { name: 'Carregando...', color: 'bg-gray-400' }}
                  onCardClick={(loc, idx) => handleExistingCardClick(1, loc, idx)}
                  onAddPokemon={(target) => setShowDeckModal({ deckId: players[1].deckArchetype, pIndex: 1, target })}
                  onUpdateStatus={(updates) => updateStatus(1, updates)}
                  actions={{
                      playItem, playSupporter, retreat, openAttackModal, reportKnockout,
                      handleMulligan: () => handleMulligan(1),
                      onOpenPrizes: () => gameState.currentPlayerIndex === 1 ? setShowPrizeModal(true) : null
                  }}
              />
          </div>

          {/* COLUNA DIREITA: LOGS (RETRÁTIL) */}
          <div className={`
                h-full flex flex-col transition-all duration-500 ease-in-out overflow-hidden
                ${showSidebar ? 'w-full lg:w-1/4 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20'}
          `}>
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
                  <GameLog 
                      logs={logs}
                      onAddLog={addLog}
                      onDownload={downloadLog}
                      currentPlayer={currentPlayer}
                      currentPlayerIndex={gameState.currentPlayerIndex}
                      onUpdatePlayer={updatePlayer}
                  />
              </div>
          </div>
        </main>
      </>
    )}

    {/* --- MODAIS GERAIS (MOEDA, AÇÕES, ATAQUE, ETC) --- */}
    
    {/* MOEDA */}
    {coinResult && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] animate-in zoom-in duration-300 pointer-events-none">
            <div className={`
                p-8 rounded-full shadow-2xl border-4 flex flex-col items-center gap-4 bg-white pointer-events-auto
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
                <button onClick={() => setCoinResult(null)} className="text-xs text-gray-400 underline mt-2">Fechar</button>
            </div>
        </div>
    )}

    {/* MODAL DE AÇÕES (DASHBOARD) */}
    {selectedCardAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-800">
                 
                 {/* COLUNA ESQUERDA: CARTA */}
                 <div className="bg-slate-100 dark:bg-slate-950 p-8 flex flex-col items-center justify-center md:w-1/3 border-r border-gray-200 relative group">
                    <div className="transform transition-transform hover:scale-105 duration-300 shadow-2xl rounded-xl">
                        <PokemonCard card={selectedCardAction.card} />
                    </div>
                    {/* Botão Fechar Mobile */}
                    <button onClick={() => setSelectedCardAction(null)} className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-full text-gray-500 shadow-lg"><X size={20}/></button>
                 </div>

                 {/* COLUNA DIREITA: CONTROLES */}
                 <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                         <div>
                             <h3 className="text-2xl font-black italic uppercase text-gray-800">{selectedCardAction.card.name}</h3>
                             <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-gray-400 mt-1">
                                <span className={`w-2 h-2 rounded-full ${selectedCardAction.location === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></span>
                                {selectedCardAction.location === 'ACTIVE' ? 'Posição: Ativo' : `Posição: Banco ${selectedCardAction.index + 1}`}
                             </div>
                         </div>
                         <button onClick={() => setSelectedCardAction(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300 hover:text-slate-500"><X size={24}/></button>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                         
                         {/* 1. CONTADOR DE DANO */}
                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Shield size={14}/> Dano</h4>
                                <span className="text-[10px] text-slate-400 font-mono">HP: {selectedCardAction.card.hp}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                <button onClick={() => handleManualDamage(-10)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><Minus/></button>
                                <span className={`text-4xl font-black ${selectedCardAction.card.damage > 0 ? 'text-red-500' : 'text-slate-300'}`}>{selectedCardAction.card.damage||0}</span>
                                <button onClick={() => handleManualDamage(10)} className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"><Plus/></button>
                            </div>
                         </div>

                         {/* 2. SEÇÃO DE ENERGIAS LIGADAS (A PARTE QUE FALTAVA) */}
                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Zap size={14}/> Energias Ligadas
                             </h4>
                             
                             {selectedCardAction.card.attachedEnergy && selectedCardAction.card.attachedEnergy.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedCardAction.card.attachedEnergy.map((energyName, idx) => (
                                        <div key={idx} className="relative group w-10 h-10 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center transition-transform hover:scale-105">
                                            {/* Imagem da Energia */}
                                            <img 
                                                src={ENERGY_IMAGES_SRC[energyName] || ENERGY_IMAGES_SRC['Colorless']} 
                                                alt={energyName} 
                                                className="w-8 h-8 object-contain drop-shadow-sm"
                                                title={energyName}
                                            />
                                            
                                            {/* Botão de Remover (Aparece no Hover) */}
                                            <button 
                                                onClick={() => handleRemoveEnergy(idx)} 
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 cursor-pointer"
                                                title="Remover Energia"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-center py-3 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
                                    <span className="text-[10px] text-slate-400 italic">Nenhuma energia ligada</span>
                                </div>
                             )}
                         </div>

                         {/* 3. AÇÕES DE JOGO */}
                         <div className="space-y-3 pt-4 border-t border-slate-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><PlayCircle size={14}/> Ações</h4>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {/* Botões de Ação */}
                                 <Button variant="ghost" className="justify-start border h-12 bg-white hover:border-yellow-300 hover:text-yellow-600 group" onClick={() => requestEnergyAttachment(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}>
                                     <Zap className="mr-2 text-yellow-500 group-hover:scale-110 transition-transform" size={18}/> Ligar Energia
                                 </Button>
                                 <Button variant="ghost" className="justify-start border h-12 bg-white hover:border-purple-300 hover:text-purple-600 group" onClick={() => requestToolAttachment(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}>
                                     <Briefcase className="mr-2 text-purple-500 group-hover:scale-110 transition-transform" size={18}/> Ferramenta
                                 </Button>
                                 <Button variant="ghost" className="justify-start border h-12 bg-white hover:border-green-300 hover:text-green-600 group" onClick={() => requestEvolution(selectedCardAction.pIndex, selectedCardAction.location, selectedCardAction.index)}>
                                     <GitMerge className="mr-2 text-green-500 group-hover:scale-110 transition-transform" size={18}/> Evoluir
                                 </Button>
                                 
                                 {/* Botão de Descarte */}
                                 <Button variant="ghost" className="justify-start border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 h-12" onClick={handleManualDiscard}>
                                     <Trash2 className="mr-2" size={18}/> Descartar
                                 </Button>

                                 {/* Botão de Promover (Só aparece se estiver no Banco) */}
                                 {selectedCardAction.location === 'BENCH' && (
                                     <Button 
                                        variant="success" 
                                        className="col-span-1 md:col-span-2 h-14 mt-2 shadow-lg shadow-green-100 border border-green-200 font-bold tracking-wider"
                                        onClick={() => promoteFromBench(selectedCardAction.index, selectedCardAction.pIndex)}
                                     >
                                         <ChevronsUp className="mr-2 animate-bounce" size={20}/> 
                                         PROMOVER PARA ATIVO
                                     </Button>
                                 )}
                             </div>
                         </div>
                    </div>
                 </div>
             </div>
        </div>
    )}

    {/* MODAL DE PRÊMIOS */}
    {showPrizeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
            <div className="bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 text-center max-w-2xl w-full">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-widest flex items-center gap-3">
                        <Gift className="text-yellow-400 animate-bounce" size={32}/> Pegar Prêmio
                    </h3>
                    <button onClick={() => setShowPrizeModal(false)} className="bg-white/20 p-2 rounded-full text-white"><X size={24}/></button>
                </div>
                <div className="flex justify-center">
                    <PrizeZone count={currentPlayer.prizes} compact={false} onClick={() => { takePrize(1); setShowPrizeModal(false); }} />
                </div>
            </div>
        </div>
    )}

    {/* OUTROS MODAIS (CONFIRMAÇÃO, DISTRIBUIÇÃO, ETC) */}
    {damageConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
             <Card className="w-full max-w-sm border-2 border-red-500 shadow-2xl text-center p-6">
                 <h3 className="text-lg font-bold">Confirmar Dano</h3>
                 <div className="text-4xl font-black text-red-600 my-4">{damageConfirmation.actualDamage}</div>
                 <div className="flex gap-2 justify-center">
                    <Button variant="secondary" onClick={() => setDamageConfirmation(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={finalizeAttack}>Confirmar</Button>
                 </div>
             </Card>
        </div>
    )}

    {/* MODAL DE ENERGIA (SEU MODAL NOVO) */}
    {showEnergyModal && (
       (() => {
           const { pIndex, location, index } = showEnergyModal;
           const targetPokemon = location === 'ACTIVE' ? players[pIndex].activePokemon : players[pIndex].benchPokemon[index];
           if (!targetPokemon) return null;
           return (
               <EnergyModal
                   onClose={() => setShowEnergyModal(null)}
                   onConfirm={confirmAttachEnergy}
                   pokemonName={targetPokemon.name}
                   currentEnergyCount={targetPokemon.attachedEnergy?.length || 0}
               />
           );
       })()
    )}

    {/* MODAL DE FERRAMENTAS */}
    {showToolModal && <ToolsModal onSelect={confirmAttachTool} onClose={() => setShowToolModal(null)} />}

    {/* MODAL DE ATAQUE (CORRIGIDO E SEGURO) */}
    {showAttackModal && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
             <div className="w-full max-w-lg bg-slate-900 border border-red-900/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                 
                 {/* Header */}
                 <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase text-white">Fase de Batalha</h3>
                        <p className="text-slate-500 text-xs mt-1">Atacante: <span className="text-red-400 font-bold">{currentPlayer.activePokemon.name}</span></p>
                    </div>
                    <button onClick={() => setShowAttackModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
                 </div>

                 {/* Lista de Ataques */}
                 <div className="p-6 bg-slate-900 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {currentPlayer.activePokemon.attacks.filter(atk => atk.cost[0] !== 'Ability').map((atk, idx) => {
                           
                           // --- AQUI ESTÁ A CORREÇÃO: VERIFICA SE PODE PAGAR ---
                           const canAfford = checkEnergyCost(atk.cost, currentPlayer.activePokemon.attachedEnergy);

                           return (
                               <button 
                                    key={idx} 
                                    disabled={!canAfford} // <--- TRAVA O CLIQUE SE NÃO TIVER ENERGIA
                                    onClick={() => confirmAttack(atk)} 
                                    className={`
                                        group relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300
                                        ${canAfford 
                                            ? 'bg-slate-800 border-slate-700 hover:border-red-500 cursor-pointer hover:bg-slate-800/80' 
                                            : 'bg-slate-900/50 border-slate-800 opacity-40 grayscale cursor-not-allowed' // <--- VISUAL DESATIVADO
                                        }
                                    `}
                               >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`font-black text-lg uppercase ${canAfford ? 'text-white' : 'text-slate-500'}`}>{atk.name}</span>
                                            
                                            {/* Custo de Energia */}
                                            <div className="flex gap-1 mt-2">
                                                 {atk.cost.map((c, i) => (
                                                     <img 
                                                        key={i} 
                                                        src={ENERGY_IMAGES_SRC[c] || ENERGY_IMAGES_SRC['Colorless']} 
                                                        alt={c} 
                                                        className="w-5 h-5 object-contain drop-shadow-md"
                                                        title={c}
                                                     />
                                                 ))}
                                            </div>
                                        </div>
                                        <span className={`text-3xl font-black ${canAfford ? 'text-white' : 'text-slate-600'}`}>{atk.damage}</span>
                                    </div>

                                    {/* Aviso se faltar energia */}
                                    {!canAfford && (
                                        <div className="absolute top-2 right-2 text-[10px] font-bold text-red-500 bg-red-950/50 px-2 py-1 rounded border border-red-900/50 uppercase tracking-wider">
                                            Energia Insuficiente
                                        </div>
                                    )}
                               </button>
                           );
                      })}

                      {currentPlayer.activePokemon.attacks.filter(atk => atk.cost[0] !== 'Ability').length === 0 && (
                          <div className="text-center text-slate-500 italic py-4">Sem ataques disponíveis.</div>
                      )}
                 </div>
             </div>
         </div>
    )}

    {/* MODAL DE RECUO */}
    {retreatModal && (
        <RetreatModal 
            cost={retreatModal.cost}
            availableEnergies={retreatModal.availableEnergies}
            selectedIndices={retreatModal.selectedIndices}
            onSelect={(idx) => {
                const isSelected = retreatModal.selectedIndices.includes(idx);
                const newIndices = isSelected ? retreatModal.selectedIndices.filter(i => i !== idx) : [...retreatModal.selectedIndices, idx].slice(0, retreatModal.cost);
                setRetreatModal(prev => ({ ...prev, selectedIndices: newIndices }));
            }}
            onConfirm={confirmRetreat}
            onCancel={() => setRetreatModal(null)}
        />
    )}
    
    {/* DECK VIEWER */}
    {showDeckModal && availableDecks[showDeckModal.deckId] && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
             <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                 <div className="flex justify-between items-center mb-4 pb-2 border-b">
                     <h2 className="text-xl font-bold">{availableDecks[showDeckModal.deckId].name}</h2>
                     <button onClick={() => setShowDeckModal(null)}><X/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2">
                     <div className="flex flex-wrap gap-4 justify-center">
                         {availableDecks[showDeckModal.deckId].cards.map((card, idx) => (
                             <PokemonCard key={idx} card={card} onClick={showDeckModal.target ? () => placePokemon(card, showDeckModal.target, showDeckModal.pIndex, showDeckModal.evolveTargetIndex) : undefined} />
                         ))}
                     </div>
                 </div>
             </Card>
        </div>
    )}

    {/* REGRAS E RANKING */}
    {showRules && <RuleBookModal onClose={() => setShowRules(false)} />}
    {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
    {showDeckManager && <DeckManager decks={availableDecks} onClose={() => setShowDeckManager(false)} onUpdate={fetchDecksFromSupabase} />}

    {/* UNDO BUTTON */}
    {history.length > 0 && gameState.phase !== PHASES.LOBBY && (
        <div className="fixed bottom-6 left-6 z-50">
            <button onClick={handleUndo} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl border border-gray-700 hover:bg-gray-800 hover:scale-105 transition-all">
                <RotateCcw size={20} className="text-yellow-400"/>
                <span className="font-bold text-xs uppercase tracking-widest">Desfazer</span>
            </button>
        </div>
    )}
  </div>
  );
};
