import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, X, Loader2, Edit2, RotateCcw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ENERGY_TYPES } from '../data/constants';

const DeckManager = ({ onClose, onUpdate }) => {
    // ESTADO LOCAL: O Gerenciador agora é dono dos seus próprios dados
    const [localDecks, setLocalDecks] = useState({});
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // Começa carregando
    
    // Controle para edição do nome do deck
    const [editingDeckName, setEditingDeckName] = useState('');

    // --- FUNÇÃO DE BUSCA AUTÔNOMA (O SEGREDO) ---
    const refreshData = async () => {
        setFetching(true);
        try {
            // Busca Decks
            const { data: decksData } = await supabase.from('decks').select('*');
            // Busca Cartas
            const { data: cardsData } = await supabase.from('cards').select('*');

            if (decksData) {
                const builtDecks = {};
                
                // 1. Monta os Decks
                decksData.forEach(d => {
                    builtDecks[d.id] = { ...d, cards: [] };
                });

                // 2. Distribui as Cartas
                if (cardsData) {
                    cardsData.forEach(c => {
                        if (builtDecks[c.deck_id]) {
                            builtDecks[c.deck_id].cards.push(c);
                        }
                    });
                }
                
                console.log("Gerenciador atualizado:", builtDecks);
                setLocalDecks(builtDecks);
            }
        } catch (error) {
            console.error("Erro ao atualizar gerenciador:", error);
        } finally {
            setFetching(false);
        }
    };

    // --- USE EFFECT: Roda assim que a janela abre ---
    useEffect(() => {
        refreshData();
    }, []);

    // Atualiza nome do deck ao selecionar
    useEffect(() => {
        if (selectedDeckId && localDecks[selectedDeckId]) {
            setEditingDeckName(localDecks[selectedDeckId].name);
        }
    }, [selectedDeckId, localDecks]);

    // --- FORMULÁRIO ---
    const INITIAL_FORM = {
        id: null,
        name: '', hp: 60, type: 'Colorless', stage: 0, image: '',
        weakness: '', resistance: '', retreat: 1,
        attack1_name: '', attack1_cost: 1, attack1_damage: 10,
        attack2_name: '', attack2_cost: 2, attack2_damage: 30
    };
    const [formData, setFormData] = useState(INITIAL_FORM);

    // --- AÇÕES ---

    const handleCreateDeck = async () => {
        const id = `DECK_${Date.now()}`;
        const newDeck = { id, name: 'Novo Deck', color: 'bg-gray-500' };
        
        setLoading(true);
        const { error } = await supabase.from('decks').insert([newDeck]);
        if (!error) {
            await refreshData(); // Atualiza localmente
            onUpdate(); // Avisa o App
            setSelectedDeckId(id);
        }
        setLoading(false);
    };

    const handleSaveDeckName = async () => {
        if (!selectedDeckId || !editingDeckName) return;
        if (localDecks[selectedDeckId].name === editingDeckName) return;

        setLoading(true);
        await supabase.from('decks').update({ name: editingDeckName }).eq('id', selectedDeckId);
        await refreshData();
        onUpdate();
        setLoading(false);
    };

    const handleDeleteDeck = async (id) => {
        if (!window.confirm('Apagar este deck e todas as cartas dele?')) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('deck_id', id);
        await supabase.from('decks').delete().eq('id', id);
        await refreshData();
        onUpdate();
        if (selectedDeckId === id) setSelectedDeckId(null);
        setLoading(false);
    };

    // --- CARTAS ---

    const handleSaveCard = async () => {
        if (!selectedDeckId) return;

        // Monta os ataques
        const attacks = [];
        if (formData.attack1_name) attacks.push({
            name: formData.attack1_name,
            damage: parseInt(formData.attack1_damage || 0),
            cost: Array(parseInt(formData.attack1_cost || 1)).fill(formData.type)
        });
        if (formData.attack2_name) attacks.push({
            name: formData.attack2_name,
            damage: parseInt(formData.attack2_damage || 0),
            cost: Array(parseInt(formData.attack2_cost || 1)).fill(formData.type)
        });

        const cardPayload = {
            deck_id: selectedDeckId,
            name: formData.name,
            hp: parseInt(formData.hp),
            type: formData.type,
            stage: parseInt(formData.stage),
            image: formData.image,
            retreat: parseInt(formData.retreat),
            weakness: formData.weakness,
            resistance: formData.resistance,
            attacks: attacks
        };

        setLoading(true);
        let error;

        if (formData.id) {
            const { error: err } = await supabase.from('cards').update(cardPayload).eq('id', formData.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('cards').insert([cardPayload]);
            error = err;
        }

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            await refreshData(); // RECARREGA A LISTA NA HORA
            onUpdate(); // Sincroniza o App para a próxima partida
            setFormData(INITIAL_FORM); // Limpa form se for nova carta
            if (formData.id) setFormData(INITIAL_FORM); // Se for edição, também limpa pra sair do modo edição
        }
        setLoading(false);
    };

    const handleEditCard = (card) => {
        const atk1 = card.attacks?.[0] || {};
        const atk2 = card.attacks?.[1] || {};
        setFormData({
            id: card.id,
            name: card.name,
            hp: card.hp,
            type: card.type,
            stage: card.stage,
            image: card.image || '',
            weakness: card.weakness || '',
            resistance: card.resistance || '',
            retreat: card.retreat || 1,
            attack1_name: atk1.name || '',
            attack1_cost: atk1.cost ? atk1.cost.length : 1,
            attack1_damage: atk1.damage || 0,
            attack2_name: atk2.name || '',
            attack2_cost: atk2.cost ? atk2.cost.length : 0,
            attack2_damage: atk2.damage || 0,
        });
    };

    const handleDeleteCard = async (cardId) => {
        if(!window.confirm("Apagar carta?")) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('id', cardId);
        await refreshData();
        onUpdate();
        setLoading(false);
    };

    const updateField = (field, value) => setFormData({ ...formData, [field]: value });
    const handleResetForm = () => setFormData(INITIAL_FORM);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[95vh] flex overflow-hidden shadow-2xl relative">
                
                {/* Loader Global */}
                {(loading || fetching) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-xl">
                        <Loader2 size={16} className="animate-spin"/> 
                        {fetching ? "Buscando dados..." : "Salvando..."}
                    </div>
                )}

                {/* COLUNA 1: DECK LIST */}
                <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
                    <div className="p-4 border-b bg-gray-200 flex justify-between items-center">
                        <h2 className="font-black text-gray-700 text-sm uppercase">Decks</h2>
                        <button onClick={handleCreateDeck} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus size={16}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {Object.entries(localDecks).map(([id, deck]) => (
                            <div key={id} 
                                onClick={() => { setSelectedDeckId(id); handleResetForm(); }}
                                className={`p-2 rounded cursor-pointer flex justify-between items-center group ${selectedDeckId === id ? 'bg-white border-l-4 border-blue-500 shadow-sm' : 'hover:bg-gray-200'}`}
                            >
                                <span className="font-bold text-sm truncate w-32 text-gray-800">{deck.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-800 text-white font-bold hover:bg-gray-900 flex items-center justify-center gap-2"><X size={16}/> Sair</button>
                </div>

                {/* COLUNA 2: CARTAS */}
                <div className="flex-1 bg-slate-50 flex flex-col border-r border-gray-200">
                    {selectedDeckId && localDecks[selectedDeckId] ? (
                        <>
                            <div className="p-3 bg-white border-b shadow-sm">
                                <input 
                                    className="text-xl font-black bg-transparent border-none outline-none text-gray-800 w-full placeholder-gray-300 focus:ring-2 ring-blue-100 rounded px-2"
                                    value={editingDeckName}
                                    onChange={(e) => setEditingDeckName(e.target.value)}
                                    onBlur={handleSaveDeckName}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveDeckName()}
                                    placeholder="Nome do Deck..."
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 xl:grid-cols-4 gap-3 content-start">
                                {(localDecks[selectedDeckId].cards || []).map((card) => (
                                    <div 
                                        key={card.id} 
                                        onClick={() => handleEditCard(card)}
                                        className={`bg-white p-2 rounded border relative group hover:shadow-md transition-all cursor-pointer ${formData.id === card.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                    >
                                        <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden mb-2 relative">
                                            {card.image ? (
                                                <img src={card.image} className="w-full h-full object-cover" alt={card.name}/>
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${ENERGY_TYPES[card.type]?.color || 'bg-gray-400'}`}>
                                                    <span className="text-white font-bold text-xs">{card.type}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold truncate">{card.name}</div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">
                            {fetching ? "Carregando..." : "Selecione um Deck na Esquerda"}
                        </div>
                    )}
                </div>

                {/* COLUNA 3: FORM */}
                <div className="w-96 bg-white flex flex-col shadow-xl z-10 overflow-y-auto">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            {formData.id ? <><Edit2 size={16} className="text-blue-600"/> Editar Carta</> : <><Plus size={16} className="text-green-600"/> Nova Carta</>}
                        </h3>
                        {formData.id && (
                            <button onClick={handleResetForm} className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 border px-2 py-1 rounded">
                                <RotateCcw size={10}/> Cancelar
                            </button>
                        )}
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Dados Básicos</label>
                            <input className="w-full border p-2 rounded text-sm" placeholder="Nome" value={formData.name} onChange={e => updateField('name', e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" className="border p-2 rounded text-sm" placeholder="HP" value={formData.hp} onChange={e => updateField('hp', e.target.value)} />
                                <select className="border p-2 rounded text-sm" value={formData.type} onChange={e => updateField('type', e.target.value)}>
                                    {Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select className="border p-2 rounded text-sm" value={formData.stage} onChange={e => updateField('stage', e.target.value)}>
                                    <option value="0">Básico</option>
                                    <option value="1">Estágio 1</option>
                                    <option value="2">Estágio 2</option>
                                </select>
                                <input type="number" className="border p-2 rounded text-sm" placeholder="Recuo" value={formData.retreat} onChange={e => updateField('retreat', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] text-gray-500">Fraqueza</label>
                                <select className="w-full border p-1 rounded text-xs" value={formData.weakness} onChange={e => updateField('weakness', e.target.value)}>
                                    <option value="">Nenhuma</option>
                                    {Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                </select></div>
                                <div><label className="text-[10px] text-gray-500">Resistência</label>
                                <select className="w-full border p-1 rounded text-xs" value={formData.resistance} onChange={e => updateField('resistance', e.target.value)}>
                                    <option value="">Nenhuma</option>
                                    {Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                </select></div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase">Ataques</label>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <input className="w-full text-xs font-bold bg-transparent mb-1 outline-none" placeholder="Ataque 1" value={formData.attack1_name} onChange={e => updateField('attack1_name', e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="number" className="w-1/2 p-1 text-xs border rounded" placeholder="Dano" value={formData.attack1_damage} onChange={e => updateField('attack1_damage', e.target.value)} />
                                    <input type="number" className="w-1/2 p-1 text-xs border rounded" placeholder="Custo" value={formData.attack1_cost} onChange={e => updateField('attack1_cost', e.target.value)} />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <input className="w-full text-xs font-bold bg-transparent mb-1 outline-none" placeholder="Ataque 2" value={formData.attack2_name} onChange={e => updateField('attack2_name', e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="number" className="w-1/2 p-1 text-xs border rounded" placeholder="Dano" value={formData.attack2_damage} onChange={e => updateField('attack2_damage', e.target.value)} />
                                    <input type="number" className="w-1/2 p-1 text-xs border rounded" placeholder="Custo" value={formData.attack2_cost} onChange={e => updateField('attack2_cost', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">URL Imagem</label>
                            <input className="w-full border p-2 rounded text-xs font-mono text-gray-600" placeholder="https://..." value={formData.image} onChange={e => updateField('image', e.target.value)} />
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 mt-auto">
                        <button 
                            onClick={handleSaveCard} 
                            disabled={!formData.name || loading || !selectedDeckId}
                            className={`w-full py-3 rounded font-bold text-white flex items-center justify-center gap-2 ${formData.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                        >
                            {loading ? <Loader2 className="animate-spin"/> : (formData.id ? <><Save size={18}/> Salvar</> : <><Plus size={18}/> Adicionar</>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckManager;