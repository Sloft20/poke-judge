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
// src/data/constants.js

export const RULES_DB = [
    {
        id: 'win_cond',
        category: 'basics',
        title: 'Como Vencer',
        icon: 'Trophy',
        text: 'Você vence se: 1) Pegar todas as suas 6 cartas de Prêmio. 2) Nocautear todos os Pokémon em jogo do oponente. 3) O oponente não tiver cartas no deck no início do turno dele (Deck Out).'
    },
    {
        id: 'setup',
        category: 'basics',
        title: 'Preparação & Mulligan',
        icon: 'Shuffle',
        text: 'Embaralhe e compre 7 cartas. Você DEVE ter um Básico na mão inicial. Se não tiver, revele a mão, embaralhe e compre 7 novas (Mulligan). O oponente pode comprar 1 carta extra para cada Mulligan seu.'
    },
    {
        id: 'turn_structure',
        category: 'gameplay',
        title: 'Estrutura do Turno',
        icon: 'Clock',
        text: '1. Compre uma carta (Obrigatório). 2. Fase de Ação (Jogue itens, ligue 1 energia, recue, use habilidades). 3. Ataque (Encerra o turno) OU Passe a vez.'
    },
    {
        id: 'first_turn',
        category: 'gameplay',
        title: 'Regras do 1º Turno',
        icon: 'Ban',
        text: 'O jogador que começa (Primeiro a jogar) NÃO pode atacar e NÃO pode jogar cartas de Apoiador no seu primeiro turno. Nenhum jogador pode evoluir no seu respectivo primeiro turno.'
    },
    {
        id: 'evolution',
        category: 'mechanics',
        title: 'Evolução',
        icon: 'ChevronsUp',
        text: 'Básicos evoluem para Estágio 1, que evoluem para Estágio 2. Você não pode evoluir um Pokémon no mesmo turno em que ele foi baixado. Ao evoluir, o Pokémon cura todas as Condições Especiais, mas mantém o dano e energias.'
    },
    {
        id: 'conditions',
        category: 'status',
        title: 'Condições Especiais',
        icon: 'Skull',
        text: '• VENENO: Põe 1 contador de dano por checkup. • QUEIMADO: Põe 2 contadores, joga moeda (cara cura). • DORMINDO: Joga moeda no checkup (cara acorda). Não pode atacar/recuar. • CONFUSO: Joga moeda p/ atacar (coroa = 30 dano em si). • PARALISADO: Não ataca/recua. Cura sozinho após seu turno.'
    },
    {
        id: 'retreat',
        category: 'mechanics',
        title: 'Recuar',
        icon: 'RotateCcw',
        text: 'Uma vez por turno, você pode recuar seu Ativo para o Banco descartando energias iguais ao Custo de Recuo da carta. Dormindo ou Paralisado impedem o recuo.'
    },
    {
        id: 'checkup',
        category: 'status',
        title: 'Fase de Checkup',
        icon: 'Activity',
        text: 'Acontece entre os turnos. Ordem: 1) Veneno. 2) Queimadura. 3) Dormindo. 4) Paralisia. Depois verifique Nocautes.'
    },
    {
        id: 'abilities',
        category: 'mechanics',
        title: 'Habilidades',
        icon: 'Zap',
        text: 'Habilidades não são ataques. Você pode usar quantas quiser por turno (se a carta permitir) antes de atacar. Usar uma habilidade geralmente não encerra o turno.'
    }
];