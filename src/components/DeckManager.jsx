// src/components/DeckManager.jsx
import React, { useState } from 'react';
import { Trash2, Plus, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Certifique-se que o caminho está certo
import { ENERGY_TYPES } from '../data/constants';

const DeckManager = ({ decks, onClose, onUpdate }) => {
    const [deckList, setDeckList] = useState(decks); // Estado local para UI instantânea
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Novo Card (Estado do formulário)
    const [newCard, setNewCard] = useState({ name: '', hp: 60, type: 'Colorless', stage: 0, image: '' });

    // --- AÇÕES DO SUPABASE ---

    // 1. Criar Deck Novo
    const handleCreateDeck = async () => {
        const id = `DECK_${Date.now()}`;
        const newDeck = { id, name: 'Novo Deck', color: 'bg-gray-500' };

        setLoading(true);
        const { error } = await supabase.from('decks').insert([newDeck]);
        setLoading(false);

        if (error) {
            alert('Erro ao criar deck: ' + error.message);
        } else {
            // Atualiza localmente
            setDeckList({ ...deckList, [id]: { ...newDeck, cards: [] } });
            setEditingId(id);
            onUpdate(); // Avisa o App para recarregar
        }
    };

    // 2. Apagar Deck
    const handleDeleteDeck = async (id) => {
        if (!window.confirm('Tem certeza? Isso apagará todas as cartas deste deck.')) return;
        
        setLoading(true);
        const { error } = await supabase.from('decks').delete().eq('id', id);
        setLoading(false);

        if (!error) {
            const newList = { ...deckList };
            delete newList[id];
            setDeckList(newList);
            if (editingId === id) setEditingId(null);
            onUpdate();
        }
    };

    // 3. Atualizar Nome do Deck
    const handleUpdateDeckName = async (id, newName) => {
        // Atualiza visualmente na hora (Optimistic UI)
        setDeckList({ ...deckList, [id]: { ...deckList[id], name: newName } });

        // Salva no banco (Debounce seria ideal, mas vamos simples)
        await supabase.from('decks').update({ name: newName }).eq('id', id);
        onUpdate();
    };

    // 4. Adicionar Carta
    const handleAddCard = async () => {
        if (!editingId) return;
        
        const cardToAdd = {
            deck_id: editingId,
            name: newCard.name,
            hp: newCard.hp,
            type: newCard.type,
            stage: newCard.stage,
            image: newCard.image,
            retreat: 1,
            attacks: [{ name: 'Ataque Básico', cost: [newCard.type], damage: 10 }] // JSONB
        };

        setLoading(true);
        const { data, error } = await supabase.from('cards').insert([cardToAdd]).select();
        setLoading(false);

        if (error) {
            alert('Erro ao salvar carta: ' + error.message);
        } else if (data) {
            // Adiciona na lista local
            const createdCard = data[0];
            const currentDeck = deckList[editingId];
            setDeckList({
                ...deckList,
                [editingId]: { ...currentDeck, cards: [...(currentDeck.cards || []), createdCard] }
            });
            // Limpa form
            setNewCard({ name: '', hp: 60, type: 'Colorless', stage: 0, image: '' });
            onUpdate();
        }
    };

    // 5. Apagar Carta
    const handleDeleteCard = async (cardId, indexInList) => {
        if(!cardId) return; // Se for carta antiga sem ID do banco, complica

        setLoading(true);
        const { error } = await supabase.from('cards').delete().eq('id', cardId);
        setLoading(false);

        if (!error) {
            const currentDeck = deckList[editingId];
            const newCards = currentDeck.cards.filter(c => c.id !== cardId);
            setDeckList({
                ...deckList,
                [editingId]: { ...currentDeck, cards: newCards }
            });
            onUpdate();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex overflow-hidden shadow-2xl relative">
                
                {loading && (
                    <div className="absolute top-2 right-2 z-50 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                        <Loader2 size={12} className="animate-spin"/> Salvando...
                    </div>
                )}

                {/* COLUNA ESQUERDA: LISTA */}
                <div className="w-1/3 bg-gray-100 border-r border-gray-300 flex flex-col">
                    <div className="p-4 border-b bg-gray-200 flex justify-between items-center">
                        <h2 className="font-black text-gray-700 uppercase">Supabase Decks</h2>
                        <button onClick={handleCreateDeck} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"><Plus size={20}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {Object.entries(deckList).map(([id, deck]) => (
                            <div key={id} 
                                onClick={() => setEditingId(id)}
                                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-all ${editingId === id ? 'bg-blue-100 border-blue-500 border' : 'bg-white hover:bg-gray-50 border border-transparent'}`}
                            >
                                <div>
                                    <div className="font-bold text-gray-800">{deck.name}</div>
                                    <div className="text-xs text-gray-500">{(deck.cards || []).length} cartas</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(id); }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                        <button onClick={onClose} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded font-bold flex items-center justify-center gap-2">
                            <X size={18}/> Fechar
                        </button>
                    </div>
                </div>

                {/* COLUNA DIREITA: EDITOR */}
                <div className="flex-1 flex flex-col bg-slate-50">
                    {editingId && deckList[editingId] ? (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Nome do Deck */}
                            <div className="p-4 bg-white border-b shadow-sm">
                                <input 
                                    className="text-2xl font-black bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-gray-800 w-full"
                                    value={deckList[editingId].name}
                                    onChange={(e) => handleUpdateDeckName(editingId, e.target.value)}
                                    placeholder="Nome do Deck"
                                />
                            </div>

                            {/* Cards Grid */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {(deckList[editingId].cards || []).map((card, idx) => (
                                        <div key={card.id || idx} className="bg-white p-2 rounded border shadow-sm relative group hover:ring-2 ring-blue-400">
                                            <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden mb-2 relative">
                                                {card.image ? (
                                                    <img src={card.image} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${ENERGY_TYPES[card.type]?.color || 'bg-gray-400'}`}>
                                                        <span className="text-white font-bold text-xs">{card.type}</span>
                                                    </div>
                                                )}
                                                <button onClick={() => handleDeleteCard(card.id, idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                            </div>
                                            <div className="text-xs font-bold truncate">{card.name}</div>
                                            <div className="text-[10px] text-gray-500">HP {card.hp}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Adicionar */}
                            <div className="p-4 bg-white border-t border-gray-200 shadow-lg z-10">
                                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Adicionar Nova Carta ao Banco de Dados</h3>
                                <div className="grid grid-cols-6 gap-2 items-end">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400">Nome</label>
                                        <input type="text" className="w-full border rounded p-1.5 text-sm" placeholder="Ex: Pikachu" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400">HP</label>
                                        <input type="number" className="w-full border rounded p-1.5 text-sm" placeholder="60" value={newCard.hp} onChange={e => setNewCard({...newCard, hp: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400">Tipo</label>
                                        <select className="w-full border rounded p-1.5 text-sm" value={newCard.type} onChange={e => setNewCard({...newCard, type: e.target.value})}>
                                            {Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400">Estágio</label>
                                        <select className="w-full border rounded p-1.5 text-sm" value={newCard.stage} onChange={e => setNewCard({...newCard, stage: parseInt(e.target.value)})}>
                                            <option value={0}>Básico</option>
                                            <option value={1}>Estágio 1</option>
                                            <option value={2}>Estágio 2</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button onClick={handleAddCard} disabled={!newCard.name || loading} className="bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded w-full flex justify-center hover:bg-blue-700 transition-colors">
                                            {loading ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                                        </button>
                                    </div>
                                    <div className="col-span-6 mt-2">
                                        <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><ImageIcon size={10}/> URL da Imagem (Opcional)</label>
                                        <input type="text" className="w-full border rounded p-1.5 text-xs text-gray-600 font-mono" placeholder="https://..." value={newCard.image} onChange={e => setNewCard({...newCard, image: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <p>Selecione ou crie um deck.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeckManager;