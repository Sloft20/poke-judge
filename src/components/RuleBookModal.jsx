import React, { useState } from 'react';
// Importando todos os ícones usados no design
import { 
    Search, X, Book, Trophy, Shuffle, Clock, Ban, 
    ChevronsUp, Skull, RotateCcw, Activity, Zap 
} from 'lucide-react';
import { Card } from './UI'; // Ajuste se seu UI.js estiver em outro lugar
import { RULES_DB } from '../data/constants'; // Importa a lista de regras

const RuleBookModal = ({ onClose }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Categorias para o Menu Lateral
    const categories = [
        { id: 'all', label: 'Todas as Regras', icon: Book },
        { id: 'basics', label: 'O Básico', icon: Trophy },
        { id: 'gameplay', label: 'Turnos e Ações', icon: Clock },
        { id: 'status', label: 'Status & Checkup', icon: Skull },
        { id: 'mechanics', label: 'Mecânicas', icon: Zap },
    ];

    // Mapeamento de Ícones dinâmicos
    const getIcon = (iconName) => {
        const icons = { Trophy, Shuffle, Clock, Ban, ChevronsUp, Skull, RotateCcw, Activity, Zap };
        const IconComp = icons[iconName] || Book;
        return <IconComp size={20} />;
    };

    // Filtragem
    const filteredRules = RULES_DB.filter(rule => {
        const matchesCategory = activeCategory === 'all' || rule.category === activeCategory;
        const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              rule.text.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-5xl h-[80vh] flex bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl overflow-hidden">
                
                {/* --- SIDEBAR (MENU) --- */}
                <div className="w-64 bg-slate-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                        <h2 className="text-xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
                            <Book size={24}/> REGRAS <span className="text-slate-400 font-normal text-sm">v2.5</span>
                        </h2>
                    </div>
                    
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                    ${activeCategory === cat.id 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                                        : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-400'}
                                `}
                            >
                                <cat.icon size={18} />
                                {cat.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                        <div className="text-xs text-center text-slate-400 font-mono">
                            PokéJudge Pro System
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* Header com Busca e Fechar */}
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Pesquisar regra (ex: Veneno, Recuar)..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                            <X size={24}/>
                        </button>
                    </div>

                    {/* Lista de Cards de Regra */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-4">
                            {filteredRules.length > 0 ? (
                                filteredRules.map((rule) => (
                                    <div key={rule.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex gap-4 group">
                                        
                                        {/* Ícone Lateral */}
                                        <div className="shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {getIcon(rule.icon)}
                                            </div>
                                        </div>

                                        {/* Texto */}
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                                {rule.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {rule.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-400">
                                    <Book size={48} className="mx-auto mb-4 opacity-20"/>
                                    <p>Nenhuma regra encontrada para "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- AQUI ESTÁ O EXPORT QUE VOCÊ PEDIU ---
export default RuleBookModal;