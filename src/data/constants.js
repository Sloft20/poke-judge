// src/data/constants.js
import { 
  Flame, Droplets, Leaf, Eye, Dumbbell, Moon, Crown, Circle, Star, Bolt, Origami, Zap, PlusCircle
} from 'lucide-react';

// 1. FASES DO JOGO
export const PHASES = {
  LOBBY: 'LOBBY', 
  SETUP: 'SETUP',
  START_TURN: 'INÍCIO DO TURNO',
  DRAW: 'COMPRA',
  ACTION: 'AÇÕES (MAIN)',
  ATTACK: 'ATAQUE',
  CHECKUP: 'CHECKUP/ENTRE TURNOS',
  GAME_OVER: 'FIM DE JOGO'
};

// 2. CONDIÇÕES ESPECIAIS
export const CONDITIONS = {
  NONE: 'Nenhuma',
  ASLEEP: 'Adormecido (Sleep)',
  BURNED: 'Queimado (Burned)',
  CONFUSED: 'Confuso (Confused)',
  PARALYZED: 'Paralisado (Paralyzed)',
  POISONED: 'Envenenado (Poisoned)'
};

// 3. FERRAMENTAS (TOOLS)
export const TOOLS = [
    { id: 'bravery_charm', name: 'Bravery Charm', effect: 'HP+50 (Básicos)', type: 'hp', value: 50, condition: (card) => card.stage === 0 },
    { id: 'heros_cape', name: 'Hero\'s Cape (Ace)', effect: 'HP+100', type: 'hp', value: 100, condition: () => true },
    { id: 'rescue_board', name: 'Rescue Board', effect: 'Recuo -1', type: 'retreat', value: -1, condition: () => true },
    { id: 'heavy_baton', name: 'Heavy Baton', effect: 'Retém Energia ao morrer', type: 'effect', value: 0, condition: () => true },
    { id: 'maximum_belt', name: 'Maximum Belt (Ace)', effect: '+50 Dano em ex', type: 'damage', value: 50, condition: () => true },
    { id: 'defiance_band', name: 'Defiance Band', effect: '+30 Dano se atrás', type: 'damage', value: 30, condition: () => true },
    { id: 'tm_evo', name: 'TM: Evolution', effect: 'Ataque: Evolução', type: 'attack', value: 0, condition: () => true },
    { id: 'tm_devo', name: 'TM: Devolution', effect: 'Ataque: Devolução', type: 'attack', value: 0, condition: () => true },
];

// 4. TIPOS DE ENERGIA (CORES E ÍCONES)
export const ENERGY_TYPES = {
  Fire: { name: 'Fogo', color: 'bg-red-500', gradient: 'bg-gradient-to-br from-red-400 to-red-600', icon: Flame, text: 'text-white' },
  Water: { name: 'Água', color: 'bg-blue-500', gradient: 'bg-gradient-to-br from-blue-400 to-blue-600', icon: Droplets, text: 'text-white' },
  Grass: { name: 'Planta', color: 'bg-green-600', gradient: 'bg-gradient-to-br from-green-400 to-green-700', icon: Leaf, text: 'text-white' },
  Lightning: { name: 'Elétrico', color: 'bg-yellow-400', gradient: 'bg-gradient-to-br from-yellow-300 to-yellow-500', icon: Zap, text: 'text-black' },
  Psychic: { name: 'Psíquico', color: 'bg-purple-600', gradient: 'bg-gradient-to-br from-purple-400 to-purple-700', icon: Eye, text: 'text-white' },
  Fighting: { name: 'Luta', color: 'bg-orange-700', gradient: 'bg-gradient-to-br from-orange-600 to-orange-800', icon: Dumbbell, text: 'text-white' },
  Darkness: { name: 'Escuridão', color: 'bg-slate-800', gradient: 'bg-gradient-to-br from-slate-700 to-slate-900', icon: Moon, text: 'text-white' },
  Metal: { name: 'Metal', color: 'bg-gray-400', gradient: 'bg-gradient-to-br from-gray-300 to-gray-500', icon: Bolt, text: 'text-black' },
  Dragon: { name: 'Dragão', color: 'bg-yellow-600', gradient: 'bg-gradient-to-br from-yellow-600 to-amber-700', icon: Origami, text: 'text-white' },
  Colorless: { name: 'Incolor', color: 'bg-gray-200', gradient: 'bg-gradient-to-br from-gray-100 to-gray-300', icon: Star, text: 'text-black' },
};

// 5. BANCO DE REGRAS
export const RULES_DB = [
  { id: 1, title: 'Evolução', text: 'Você não pode evoluir um Pokémon no turno em que ele foi baixado (Turno de "Enjoo"). Além disso, o Jogador 1 não pode evoluir no primeiro turno da partida. (Livro de Regras, p. 16)' },
  { id: 2, title: 'Energia Manual', text: 'Um jogador só pode ligar 1 carta de Energia da sua mão a 1 dos seus Pokémon por turno. (Livro de Regras, p. 12)' },
  { id: 3, title: 'Apoiador (Supporter)', text: 'Você só pode jogar 1 carta de Apoiador por turno. (Livro de Regras, p. 14)' },
  { id: 4, title: 'Recuar', text: 'Para recuar, você deve descartar energia igual ao Custo de Recuo do Pokémon. (Livro de Regras, p. 13)' },
  { id: 5, title: 'Fraqueza e Resistência', text: 'Se o atacante for do tipo da Fraqueza do Defensor, o dano é x2. Se for Resistência, é -30.' },
  { id: 6, title: 'Checkup', text: 'Entre turnos: Veneno põe 1 contador (10). Queimadura põe 2 contadores (20) e joga moeda. Sono joga moeda. Paralisia cura se o turno do jogador afetado acabou.' }
];