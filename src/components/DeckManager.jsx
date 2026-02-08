import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, X, Loader2, Edit2, RotateCcw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ENERGY_TYPES } from '../data/constants';

const DeckManager = ({ decks, onClose, onUpdate }) => {
    // Estado local para gerenciar a UI
    const [deckList, setDeckList] = useState(decks || {});
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // --- A MÁGICA: Sincroniza quando os dados chegam do Supabase ---
    useEffect(() => {
        if (decks) {
            setDeckList(decks);
        }
    }, [decks]); 
    // ---------------------------------------------------------------

    const INITIAL_FORM = {
        id: null,
        name: '', 
        hp: 60, 
        type: 'Colorless', 
        stage: 0, 
        image: '',
        weakness: '',
        resistance: '',
        retreat: 1,
        attack1_name: '', attack1_cost: 1, attack1_damage: 10,
        attack2_name: '', attack2_cost: 0, attack2_damage: 0
    };
    
    const [formData, setFormData] = useState(INITIAL_FORM);

    // --- CRIAR NOVO DECK ---
    const handleCreateDeck = async () => {
        const id = `DECK_${Date.now()}`;
        const newDeck = { id, name: 'Novo Deck', color: 'bg-gray-500' };
        
        setLoading(true);
        // 1. Salva no banco
        const { error } = await supabase.from('decks').insert([newDeck]);
        
        if (!error) {
            // 2. Avisa o App para recarregar tudo do zero (garante sincronia)
            await onUpdate();
            setSelectedDeckId(id);
        }
        setLoading(false);
    };

    const handleUpdateDeckName = async (id, newName) => {
        // Atualiza visualmente na hora
        setDeckList({ ...deckList, [id]: { ...deckList[id], name: newName } });
        // Salva no banco
        await supabase.from('decks').update({ name: newName }).eq('id', id);
        // Sincroniza silenciosamente
        onUpdate();
    };

    const handleDeleteDeck = async (id) => {
        if (!window.confirm('Apagar este deck e todas as cartas dele?')) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('deck_id', id); // Apaga cartas primeiro
        await supabase.from('decks').delete().eq('id', id);      // Apaga o deck
        await onUpdate(); // Recarrega
        if (selectedDeckId === id) setSelectedDeckId(null);
        setLoading(false);
    };

    // --- MANIPULAÇÃO DE CARTAS ---

    const handleEditCard = (card) => {
        const atk1 = (card.attacks && card.attacks[0]) ? card.attacks[0] : {};
        const atk2 = (card.attacks && card.attacks[1]) ? card.attacks[1] : {};

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

    const handleSaveCard = async () => {
        if (!selectedDeckId) return;

        const attacks = [];
        if (formData.attack1_name) {
            attacks.push({
                name: formData.attack1_name,
                damage: parseInt(formData.attack1_damage || 0),
                cost: Array(parseInt(formData.attack1_cost)).fill(formData.type)
            });
        }
        if (formData.attack2_name) {
            attacks.push({
                name: formData.attack2_name,
                damage: parseInt(formData.attack2_damage || 0),
                cost: Array(parseInt(formData.attack2_cost)).fill(formData.type)
            });
        }

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
            // AQUI ESTÁ O SEGREDO: Espera o App atualizar os dados antes de liberar
            await onUpdate(); 
            setFormData(INITIAL_FORM); // Limpa o form
        }
        setLoading(false);
    };

    const handleDeleteCard = async (cardId) => {
        if(!window.confirm("Apagar carta?")) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('id', cardId);
        await onUpdate();
        setLoading(false);
    };

    const updateField = (field, value) => setFormData({ ...formData, [field]: value });

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[95vh] flex overflow-hidden shadow-2xl relative">
                
                {/* Loader Global */}
                {loading && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                        <Loader2 size={14} className="animate-spin"/> Salvando no Banco...
                    </div>
                )}

                {/* COLUNA 1: DECKS */}
                <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
                    <div className="p-4 border-b bg-gray-200 flex justify-between items-center">
                        <h2 className="font-black text-gray-700 text-sm uppercase">Decks</h2>
                        <button onClick={handleCreateDeck} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus size={16}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {deckList && Object.entries(deckList).map(([id, deck]) => (
                            <div key={id} 
                                onClick={() => { setSelectedDeckId(id); setFormData(INITIAL_FORM); }}
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
                    {selectedDeckId && deckList[selectedDeckId] ? (
                        <>
                            <div className="p-3 bg-white border-b shadow-sm">
                                <input 
                                    className="text-xl font-black bg-transparent border-none outline-none text-gray-800 w-full placeholder-gray-300"
                                    value={deckList[selectedDeckId].name}
                                    onChange={(e) => handleUpdateDeckName(selectedDeckId, e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 content-start">
                                {(deckList[selectedDeckId].cards || []).map((card) => (
                                    <div 
                                        key={card.id} 
                                        onClick={() => handleEditCard(card)}
                                        className={`bg-white p-2 rounded border relative group hover:shadow-md cursor-pointer ${formData.id === card.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                    >
                                        <div className="text-xs font-bold text-gray-700 mb-1">{card.name}</div>
                                        <div className="text-[10px] text-gray-500">HP {card.hp} | {card.type}</div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">Selecione um Deck na Esquerda</div>
                    )}
                </div>

                {/* COLUNA 3: FORMULÁRIO */}
                <div className="w-80 bg-white flex flex-col shadow-xl overflow-y-auto">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-bold text-gray-700 text-xs uppercase flex items-center gap-2">
                            {formData.id ? <><Edit2 size={14} className="text-blue-600"/> Editar Carta</> : <><Plus size={14} className="text-green-600"/> Nova Carta</>}
                        </h3>
                        {formData.id && (
                            <button onClick={() => setFormData(INITIAL_FORM)} className="text-[10px] text-gray-500 border px-2 py-1 rounded hover:bg-gray-100 flex gap-1"><RotateCcw size={10}/> Cancelar</button>
                        )}
                    </div>
                    
                    <div className="p-4 space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label>
                            <input className="w-full border p-2 rounded text-xs" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Ex: Pikachu" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">HP</label>
                                <input type="number" className="w-full border p-2 rounded text-xs" value={formData.hp} onChange={e => updateField('hp', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</label>
                                <select className="w-full border p-2 rounded text-xs" value={formData.type} onChange={e => updateField('type', e.target.value)}>
                                    {Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Ataques Simplificados */}
                        <div className="pt-2 border-t space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Ataque 1</label>
                            <input className="w-full border p-1 rounded text-xs mb-1" placeholder="Nome" value={formData.attack1_name} onChange={e => updateField('attack1_name', e.target.value)} />
                            <div className="flex gap-2">
                                <input type="number" className="w-1/2 border p-1 rounded text-xs" placeholder="Dano" value={formData.attack1_damage} onChange={e => updateField('attack1_damage', e.target.value)} />
                                <input type="number" className="w-1/2 border p-1 rounded text-xs" placeholder="Custo" value={formData.attack1_cost} onChange={e => updateField('attack1_cost', e.target.value)} />
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                             <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Imagem (URL)</label>
                             <input className="w-full border p-1 rounded text-[10px] font-mono" placeholder="https://..." value={formData.image} onChange={e => updateField('image', e.target.value)} />
                        </div>
                    </div>

                    <div className="p-4 border-t mt-auto bg-gray-50">
                        <button 
                            onClick={handleSaveCard}
                            disabled={!formData.name || !selectedDeckId || loading}
                            className={`w-full py-2 rounded text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 ${formData.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}
                            {formData.id ? 'Salvar Alterações' : 'Adicionar Carta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckManager;