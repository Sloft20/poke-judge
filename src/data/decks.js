export const DECKS = {
  CHARIZARD: { 
    id: 'charizard', 
    name: 'Charizard ex', 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    cards: [
      { 
        id: 'char_ex', name: 'Charizard ex', hp: 330, type: 'Darkness', stage: 2, evolvesFrom: 'Charmeleon',
        weakness: 'Grass', resistance: null, retreat: 2, imgColor: 'slate',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        attacks: [
          { name: 'Infernal Reign', cost: ['Ability'], damage: 'Ability' },
          { name: 'Burning Darkness', cost: ['Fire', 'Fire'], damage: '180+' }
        ] 
      },
      { 
        id: 'charmeleon', name: 'Charmeleon', hp: 90, type: 'Fire', stage: 1, evolvesFrom: 'Charmander',
        weakness: 'Water', resistance: null, retreat: 2, imgColor: 'orange',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
        attacks: [{ name: 'Heat Blast', cost: ['Fire', 'Fire'], damage: '50' }] 
      },
      { 
        id: 'charmander', name: 'Charmander', hp: 70, type: 'Fire', stage: 0,
        weakness: 'Water', resistance: null, retreat: 1, imgColor: 'orange',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
        attacks: [{ name: 'Ember', cost: ['Fire'], damage: '30' }] 
      },
      { 
        id: 'charmander2', name: 'Charmander', hp: 80, type: 'Fire', stage: 0,
        weakness: 'Water', resistance: null, retreat: 1, imgColor: 'orange',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
        attacks: [{ name: 'Live Carbon', cost: ['Fire'], damage: '20' }] 
      },
      { 
        id: 'reshiram', name: 'Reshiram', hp: 120, type: 'Fire', stage: 0,
        weakness: 'Water', resistance: null, retreat: 2, imgColor: 'red',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/643.png',
        attacks: [{ name: 'Flare', cost: ['Fire'], damage: '20' }, { name: 'Inferno Wings', cost: ['Fire', 'Fire', 'Fire', 'Fire'], damage: '240' }]
      },
      { 
        id: 'cottonee', name: 'Cottonee', hp: 60, type: 'Grass', stage: 0,
        weakness: 'Fire', resistance: null, retreat: 1, imgColor: 'green',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/546.png',
        attacks: [{ name: 'Coleta', cost: [], damage: '0' }]
      },
      { 
        id: 'pidgeot_ex', name: 'Pidgeot ex', hp: 280, type: 'Colorless', stage: 2, evolvesFrom: 'Pidgeotto',
        weakness: 'Lightning', resistance: 'Fighting', retreat: 0, imgColor: 'gray',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png',
        attacks: [
          { name: 'Quick Search', cost: ['Ability'], damage: 'Ability' },
          { name: 'Blustery Wind', cost: ['Colorless', 'Colorless'], damage: '120' }
        ]
      },
      { 
        id: 'pidgeotto', name: 'Pidgeotto', hp: 60, type: 'Colorless', stage: 1, evolvesFrom: 'Pidgey',
        weakness: 'Lightning', resistance: 'Fighting', retreat: 0, imgColor: 'gray',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png',
        attacks: [{ name: 'Wing Attack', cost: ['Colorless'], damage: '20' }] 
      },
      { 
        id: 'pidgey', name: 'Pidgey', hp: 60, type: 'Colorless', stage: 0,
        weakness: 'Lightning', resistance: 'Fighting', retreat: 1, imgColor: 'gray',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png',
        attacks: [{ name: 'Call for Family', cost: ['Colorless'], damage: 'Busca' }] 
      },
      { 
        id: 'moltres', name: 'Moltres', hp: 120, type: 'Fire', stage: 0,
        weakness: 'Water', resistance: null, retreat: 2, imgColor: 'red',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png',
        attacks: [{ name: 'Flare', cost: ['Fire'], damage: '20' }, { name: 'Inferno Wings', cost: ['Fire', 'Fire', 'Fire'], damage: '110' }]
      }
    ]
  },
  GARDEVOIR: { 
    id: 'gardevoir', 
    name: 'Gardevoir ex', 
    color: 'bg-purple-100 text-purple-900 border-purple-200',
    cards: [
      { 
        id: 'gard_ex', name: 'Gardevoir ex', hp: 310, type: 'Psychic', stage: 2, evolvesFrom: 'Kirlia',
        weakness: 'Darkness', resistance: 'Fighting', retreat: 2, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png',
        attacks: [
          { name: 'Psychic Embrace', cost: ['Ability'], damage: 'Ability' },
          { name: 'Miracle Force', cost: ['Psychic', 'Psychic', 'Colorless'], damage: '190' }
        ]
      },
      { 
        id: 'kirlia', name: 'Kirlia', hp: 80, type: 'Psychic', stage: 1, evolvesFrom: 'Ralts',
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/281.png',
        attacks: [
          { name: 'Refinement', cost: ['Ability'], damage: 'Ability' },
          { name: 'Slap', cost: ['Psychic'], damage: '30' }
        ]
      },
      { 
        id: 'munkidori', name: 'Munkidori', hp: 110, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1014.png',
        attacks: [
          { name: 'Adrena-Brain', cost: ['Ability'], damage: 'Ability' }, 
          { name: 'Mind Bend', cost: ['Psychic', 'Colorless'], damage: '60' }
        ]
      },
      { 
        id: 'ralts', name: 'Ralts', hp: 60, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/280.png',
        attacks: [{ name: 'Memory Skip', cost: ['Psychic'], damage: '10' }]
      },
      { 
        id: 'drifloon', name: 'Drifloon', hp: 70, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/425.png',
        attacks: [{ name: 'Balloon Blast', cost: ['Psychic', 'Psychic'], damage: '30x' }, { name: 'Floaty', cost: ['Psychic'], damage: '10' }]
      },
      { 
        id: 'yamask', name: 'Yamask', hp: 70, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 2, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/562.png',
        attacks: [{ name: 'Desejo Direcionado', cost: ['Psychic', 'Colorless'], damage: '20+' }]
      },
      { 
        id: 'cofagrigus', name: 'Cofagrigus', hp: 120, type: 'Psychic', stage: 1, evolvesFrom: 'Yamask',
        weakness: 'Darkness', resistance: 'Fighting', retreat: 2, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/563.png',
        attacks: [
          { name: 'Danogrigus Ampliado', cost: ['Psychic', 'Colorless'], damage: 'Ability' },
          { name: 'Perplexo', cost: ['Psychic', 'Colorless', 'Colorless'], damage: '60' }
        ]
      },
      { 
        id: 'frilish', name: 'Frilish', hp: 80, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 3, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/592.png',
        attacks: [{ name: 'Trevas Oceânicas', cost: ['Psychic'], damage: '20' }]
      },
      { 
        id: 'fezandipiti2', name: 'Fezandipiti', hp: 120, type: 'Psychic', stage: 0,
        weakness: 'Metal', resistance: null, retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1016.png',
        attacks: [{ name: 'Adrena-Feromônio', cost: ['Ability'], damage: 'Ability' }, { name: 'Pluma de Energia', cost: ['Psychic'], damage: '30', effect: 'Este ataque causa 30 pontos de dano para cada Energia ligada a este Pokémon.' }]
      },
      { 
        id: 'mew_ex', name: 'Mew ex', hp: 180, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 0, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
        attacks: [{ name: 'Restart', cost: ['Ability'], damage: 'Ability' }, 
        { name: 'Genome Hacking', cost: ['Colorless', 'Colorless', 'Colorless'], damage: 'Copy' }
        ]
      },
      { 
        id: 'rad_greninja', name: 'Radiant Greninja', hp: 130, type: 'Water', stage: 0,
        weakness: 'Lightning', resistance: null, retreat: 1, imgColor: 'blue',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
        attacks: [{ name: 'Concealed Cards', cost: ['Ability'], damage: 'Ability' }, { name: 'Moonlight Shuriken', cost: ['Water', 'Water', 'Colorless'], damage: 'Snipe' }]
      }
    ]
  },
  DRAGAPULT: { 
    id: 'dragapult', 
    name: 'Dragapult ex', 
    color: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    cards: [
      { 
        id: 'drag_ex', name: 'Dragapult ex', hp: 320, type: 'Dragon', stage: 2, evolvesFrom: 'Drakloak',
        weakness: null, resistance: null, retreat: 1, imgColor: 'indigo',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/887.png',
        attacks: [
          { name: 'Jet Headbutt', cost: ['Colorless'], damage: '70' },
          { name: 'Phantom Dive', cost: ['Fire', 'Psychic'], damage: '200', effectType: 'distribute_damage', effectValue: 60 }
        ]
      },
      { 
        id: 'drakloak', name: 'Drakloak', hp: 90, type: 'Dragon', stage: 1, evolvesFrom: 'Dreepy',
        weakness: null, resistance: null, retreat: 1, imgColor: 'indigo',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/886.png',
        attacks: [
          { name: 'Recon Directive', cost: ['Ability'], damage: 'Ability' }, 
          { name: 'Dragon Headbutt', cost: ['Fire', 'Psychic'], damage: '40' }
        ]
      },
      { 
        id: 'dreepy', name: 'Dreepy', hp: 60, type: 'Dragon', stage: 0,
        weakness: null, resistance: null, retreat: 1, imgColor: 'indigo',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/885.png',
        attacks: [{ name: 'Petite Grudge', cost: ['Fire', 'Psychic'], damage: '10' }]
      },
      { 
        id: 'dusclops', name: 'Dusclops', hp: 90, type: 'Psychic', stage: 1, evolvesFrom: 'Duskull',
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/356.png',
        attacks: [{ name: 'Explosão Maldita', cost: ['Ability'], damage: 'Ability' }, { name: 'Fogo Fátuo', cost: ['Psychic', 'Psychic'], damage: '50' }]
      },
      { 
        id: 'duskull', name: 'Duskull', hp: 60, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/355.png',
        attacks: [{ name: 'Vim te Buscar', cost: ['Psychic'], damage: '10' }]
      },
      { 
        id: 'munkidori', name: 'Munkidori', hp: 110, type: 'Psychic', stage: 0,
        weakness: 'Darkness', resistance: 'Fighting', retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1014.png',
        attacks: [
          { name: 'Adrena-Brain', cost: ['Ability'], damage: 'Ability' }, 
          { name: 'Mind Bend', cost: ['Psychic', 'Colorless'], damage: '60' }
        ]
      },
      { 
        id: 'budew', name: 'Budew', hp: 30, type: 'Grass', stage: 0,
        weakness: 'Fire', resistance: null, retreat: 0, imgColor: 'green',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/406.png',
        attacks: [{ name: 'Comichão de Pólen', cost: [], damage: '10' }]
      },
      { 
        id: 'fezandipiti', name: 'Fezandipiti ex', hp: 210, type: 'Darkness', stage: 0,
        weakness: 'Fighting', resistance: null, retreat: 1, imgColor: 'purple',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1016.png',
        attacks: [{ name: 'Flip the Script', cost: ['Ability'], damage: 'Ability' }, { name: 'Cruel Arrow', cost: ['Colorless', 'Colorless', 'Colorless'], damage: 'Snipe' }]
      }
    ]
  },
  CUSTOM: {
    id: 'custom',
    name: 'Customizado / Outro',
    color: 'bg-gray-100 text-gray-800 border-gray-400',
    cards: [
        { 
            id: 'generic_basic', name: 'Básico Genérico', hp: 60, type: 'Colorless', stage: 0,
            weakness: 'Fighting', resistance: null, retreat: 1, imgColor: 'gray',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png',
            attacks: [{ name: 'Ataque Simples', cost: ['Colorless'], damage: '10' }] 
        },
    ]
  },
  OTHER: { 
    id: 'other', 
    name: 'Deck Aleatório', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    cards: []
  }
};