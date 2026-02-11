import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, X, Loader2, Edit2, RotateCcw, Circle, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ENERGY_TYPES } from '../data/constants';

// Componente Visual para Escolher Energias
const EnergyCostBuilder = ({ label, cost, onChange, disabled }) => {
    if (disabled) return null; // Esconde se for Habilidade

    const addEnergy = (type) => onChange([...cost, type]);
    const removeEnergy = (index) => {
        const newCost = [...cost];
        newCost.splice(index, 1);
        onChange(newCost);
    };

    return (
        <div className="bg-gray-50 p-2 rounded border border-gray-200 mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{label}</label>
            <div className="flex flex-wrap gap-1 mb-2 min-h-[24px] bg-white p-1 rounded border border-gray-100 shadow-inner">
                {cost.length === 0 && <span className="text-[10px] text-gray-300 italic p-1">Sem custo (Grátis)</span>}
                {cost.map((type, idx) => {
                    const EIcon = ENERGY_TYPES[type]?.icon || Circle;
                    const color = ENERGY_TYPES[type]?.color || 'bg-gray-400';
                    return (
                        <button key={idx} onClick={() => removeEnergy(idx)} className={`w-5 h-5 rounded-full ${color} text-white flex items-center justify-center hover:scale-110 transition-transform`} title="Remover">
                            <EIcon size={10} />
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-1">
                {Object.entries(ENERGY_TYPES).map(([key, val]) => (
                    <button key={key} onClick={() => addEnergy(key)} className={`w-4 h-4 rounded-full ${val.color} text-white flex items-center justify-center hover:ring-2 ring-gray-300 opacity-80 hover:opacity-100 transition-all`} title={val.name}></button>
                ))}
            </div>
        </div>
    );
};

const DeckManager = ({ onClose, onUpdate }) => {
    const [localDecks, setLocalDecks] = useState({});
    const [selectedDeckId, setSelectedDeckId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [editingDeckName, setEditingDeckName] = useState('');

    // --- BUSCA DADOS NO BANCO ---
    const refreshData = async () => {
        setFetching(true);
        try {
            const { data: decksData } = await supabase.from('decks').select('*');
            const { data: cardsData } = await supabase.from('cards').select('*');

            if (decksData) {
                const builtDecks = {};
                decksData.forEach(d => { builtDecks[d.id] = { ...d, cards: [] }; });
                if (cardsData) {
                    cardsData.forEach(c => {
                        if (builtDecks[c.deck_id]) builtDecks[c.deck_id].cards.push(c);
                    });
                }
                setLocalDecks(builtDecks);
            }
        } catch (error) {
            console.error("Erro DeckManager:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { refreshData(); }, []);

    useEffect(() => {
        if (selectedDeckId && localDecks[selectedDeckId]) {
            setEditingDeckName(localDecks[selectedDeckId].name);
        }
    }, [selectedDeckId, localDecks]);

    // --- ESTADO DO FORMULÁRIO ---
    const INITIAL_FORM = {
        id: null,
        name: '', hp: 60, type: 'Colorless', stage: 0, image: '',
        evolves_from: '',
        weakness: '', resistance: '', retreat: 1,
        
        // Ataque 1
        attack1_name: '', 
        attack1_cost: ['Colorless'], 
        attack1_damage: 10,
        attack1_isAbility: false, // NOVO: Flag de Habilidade

        // Ataque 2
        attack2_name: '', 
        attack2_cost: ['Colorless', 'Colorless'], 
        attack2_damage: 30,
        attack2_isAbility: false // NOVO: Flag de Habilidade
    };
    
    const [formData, setFormData] = useState(INITIAL_FORM);

    // --- AÇÕES DE DECK ---
    const handleCreateDeck = async () => {
        const id = `DECK_${Date.now()}`;
        const newDeck = { id, name: 'Novo Deck', color: 'bg-gray-500' };
        setLoading(true);
        await supabase.from('decks').insert([newDeck]);
        await refreshData(); onUpdate(); setSelectedDeckId(id); setLoading(false);
    };

    const handleSaveDeckName = async () => {
        if (!selectedDeckId || !editingDeckName) return;
        setLoading(true);
        await supabase.from('decks').update({ name: editingDeckName }).eq('id', selectedDeckId);
        await refreshData(); onUpdate(); setLoading(false);
    };

    const handleDeleteDeck = async (id) => {
        if (!window.confirm('Apagar deck?')) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('deck_id', id);
        await supabase.from('decks').delete().eq('id', id);
        await refreshData(); onUpdate(); if (selectedDeckId === id) setSelectedDeckId(null); setLoading(false);
    };

    // --- SALVAR CARTA (A MÁGICA ACONTECE AQUI) ---
    const handleSaveCard = async () => {
        if (!selectedDeckId) return;

        const attacks = [];

        // Processa Ataque 1
        if (formData.attack1_name) {
            attacks.push({
                name: formData.attack1_name,
                damage: formData.attack1_isAbility ? 0 : parseInt(formData.attack1_damage || 0),
                // Se for Habilidade, o custo é ['Ability']. Se não, é o array de energias.
                cost: formData.attack1_isAbility ? ['Ability'] : formData.attack1_cost 
            });
        }

        // Processa Ataque 2
        if (formData.attack2_name) {
            attacks.push({
                name: formData.attack2_name,
                damage: formData.attack2_isAbility ? 0 : parseInt(formData.attack2_damage || 0),
                cost: formData.attack2_isAbility ? ['Ability'] : formData.attack2_cost
            });
        }

        const cardPayload = {
            deck_id: selectedDeckId,
            name: formData.name,
            hp: parseInt(formData.hp),
            type: formData.type,
            stage: parseInt(formData.stage),
            evolves_from: formData.evolves_from, // <--- ADICIONE ESTA LINHA AQUI
            image: formData.image,
            retreat: parseInt(formData.retreat),
            weakness: formData.weakness,
            resistance: formData.resistance,
            attacks: attacks // Salva o JSON pronto
        };

        setLoading(true);
        if (formData.id) {
            await supabase.from('cards').update(cardPayload).eq('id', formData.id);
        } else {
            await supabase.from('cards').insert([cardPayload]);
        }

        await refreshData(); // Recarrega local
        onUpdate(); // Recarrega App
        setFormData(INITIAL_FORM);
        setLoading(false);
    };

    // --- CARREGAR CARTA PARA EDIÇÃO ---
    const handleEditCard = (card) => {
        const atk1 = card.attacks?.[0] || {};
        const atk2 = card.attacks?.[1] || {};
        
        // Verifica se é habilidade (se o custo começa com 'Ability')
        const isAbility1 = atk1.cost && atk1.cost[0] === 'Ability';
        const isAbility2 = atk2.cost && atk2.cost[0] === 'Ability';

        setFormData({
            id: card.id,
            name: card.name,
            hp: card.hp,
            type: card.type,
            stage: card.stage,
            evolves_from: card.evolves_from || '', // <--- ADICIONE ESTA LINHA AQUI
            image: card.image || '',
            weakness: card.weakness || '',
            resistance: card.resistance || '',
            retreat: card.retreat || 1,
            
            // Ataque 1
            attack1_name: atk1.name || '',
            attack1_cost: isAbility1 ? [] : (Array.isArray(atk1.cost) ? atk1.cost : ['Colorless']),
            attack1_damage: atk1.damage || 0,
            attack1_isAbility: isAbility1,

            // Ataque 2
            attack2_name: atk2.name || '',
            attack2_cost: isAbility2 ? [] : (Array.isArray(atk2.cost) ? atk2.cost : []),
            attack2_damage: atk2.damage || 0,
            attack2_isAbility: isAbility2
        });
    };

    const handleDeleteCard = async (cardId) => {
        if(!window.confirm("Apagar carta?")) return;
        setLoading(true);
        await supabase.from('cards').delete().eq('id', cardId);
        await refreshData(); onUpdate(); setLoading(false);
    };

    const updateField = (field, value) => setFormData({ ...formData, [field]: value });

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[95vh] flex overflow-hidden shadow-2xl relative">
                
                {(loading || fetching) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-xl">
                        <Loader2 size={16} className="animate-spin"/> {fetching ? "Buscando..." : "Salvando..."}
                    </div>
                )}

                {/* COLUNA 1: DECKS */}
                <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
                    <div className="p-4 border-b bg-gray-200 flex justify-between items-center">
                        <h2 className="font-black text-gray-700 text-sm uppercase">Decks</h2>
                        <button onClick={handleCreateDeck} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus size={16}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {Object.entries(localDecks).map(([id, deck]) => (
                            <div key={id} onClick={() => { setSelectedDeckId(id); setFormData(INITIAL_FORM); }} className={`p-2 rounded cursor-pointer flex justify-between items-center group ${selectedDeckId === id ? 'bg-white border-l-4 border-blue-500 shadow-sm' : 'hover:bg-gray-200'}`}>
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
                                <input className="text-xl font-black bg-transparent border-none outline-none text-gray-800 w-full" value={editingDeckName} onChange={(e) => setEditingDeckName(e.target.value)} onBlur={handleSaveDeckName} onKeyDown={(e) => e.key === 'Enter' && handleSaveDeckName()} placeholder="Nome do Deck..." />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 xl:grid-cols-4 gap-3 content-start">
                                {(localDecks[selectedDeckId].cards || []).map((card) => (
                                    <div key={card.id} onClick={() => handleEditCard(card)} className={`bg-white p-2 rounded border relative group hover:shadow-md cursor-pointer ${formData.id === card.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                                        <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden mb-2 relative">
                                            {card.image ? <img src={card.image} className="w-full h-full object-cover"/> : <div className={`w-full h-full flex items-center justify-center ${ENERGY_TYPES[card.type]?.color || 'bg-gray-400'}`}><span className="text-white font-bold text-xs">{card.type}</span></div>}
                                        </div>
                                        <div className="text-xs font-bold truncate">{card.name}</div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : ( <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">Selecione um Deck</div> )}
                </div>

                {/* COLUNA 3: FORMULÁRIO */}
                <div className="w-96 bg-white flex flex-col shadow-xl z-10 overflow-y-auto">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">{formData.id ? <><Edit2 size={16}/> Editar</> : <><Plus size={16}/> Nova Carta</>}</h3>
                        {formData.id && <button onClick={() => setFormData(INITIAL_FORM)} className="text-xs text-gray-500 border px-2 py-1 rounded hover:bg-gray-100"><RotateCcw size={10}/> Cancelar</button>}
                    </div>

                    <div className="p-4 space-y-4">
                        {/* DADOS BÁSICOS */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Dados Básicos</label>
                            <input className="w-full border p-2 rounded text-sm" placeholder="Nome" value={formData.name} onChange={e => updateField('name', e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" className="border p-2 rounded text-sm" placeholder="HP" value={formData.hp} onChange={e => updateField('hp', e.target.value)} />
                                <select className="border p-2 rounded text-sm" value={formData.type} onChange={e => updateField('type', e.target.value)}>{Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}</select>
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
                        {parseInt(formData.stage) > 0 && (
                            <div className="mt-2 animate-in fade-in">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Evolui de (Nome Exato)</label>
                                <input 
                                    className="w-full border p-2 rounded text-sm bg-yellow-50 border-yellow-200" 
                                    placeholder="Ex: Duskull" 
                                    value={formData.evolves_from} 
                                    onChange={e => updateField('evolves_from', e.target.value)} 
                                />
                            </div>
                        )}

                        <div className="space-y-2 pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] text-gray-500">Fraqueza</label><select className="w-full border p-1 rounded text-xs" value={formData.weakness} onChange={e => updateField('weakness', e.target.value)}><option value="">Nenhuma</option>{Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                <div><label className="text-[10px] text-gray-500">Resistência</label><select className="w-full border p-1 rounded text-xs" value={formData.resistance} onChange={e => updateField('resistance', e.target.value)}><option value="">Nenhuma</option>{Object.keys(ENERGY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                            </div>
                        </div>

                        {/* --- ATAQUES E HABILIDADES --- */}
                        <div className="space-y-3 pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase">Ataques / Habilidades</label>
                            
                            {/* Slot 1 */}
                            <div className={`p-2 rounded border transition-colors ${formData.attack1_isAbility ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-gray-500">SLOT 1</span>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" className="accent-red-500" checked={formData.attack1_isAbility} onChange={(e) => updateField('attack1_isAbility', e.target.checked)} />
                                        <span className={`text-[10px] font-bold ${formData.attack1_isAbility ? 'text-red-600' : 'text-gray-400'}`}>É Habilidade?</span>
                                    </label>
                                </div>
                                <input className="w-full text-xs font-bold bg-white mb-2 outline-none border p-1 rounded" placeholder={formData.attack1_isAbility ? "Nome da Habilidade" : "Nome do Ataque"} value={formData.attack1_name} onChange={e => updateField('attack1_name', e.target.value)} />
                                
                                <EnergyCostBuilder label="Custo" cost={formData.attack1_cost} onChange={(nc) => updateField('attack1_cost', nc)} disabled={formData.attack1_isAbility} />
                                {!formData.attack1_isAbility && (
                                    <div className="mt-1"><input type="number" className="w-1/2 border p-1 rounded text-xs" placeholder="Dano" value={formData.attack1_damage} onChange={e => updateField('attack1_damage', e.target.value)} /></div>
                                )}
                            </div>

                            {/* Slot 2 */}
                            <div className={`p-2 rounded border transition-colors ${formData.attack2_isAbility ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-gray-500">SLOT 2</span>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="checkbox" className="accent-red-500" checked={formData.attack2_isAbility} onChange={(e) => updateField('attack2_isAbility', e.target.checked)} />
                                        <span className={`text-[10px] font-bold ${formData.attack2_isAbility ? 'text-red-600' : 'text-gray-400'}`}>É Habilidade?</span>
                                    </label>
                                </div>
                                <input className="w-full text-xs font-bold bg-white mb-2 outline-none border p-1 rounded" placeholder={formData.attack2_isAbility ? "Nome da Habilidade" : "Nome do Ataque"} value={formData.attack2_name} onChange={e => updateField('attack2_name', e.target.value)} />
                                
                                <EnergyCostBuilder label="Custo" cost={formData.attack2_cost} onChange={(nc) => updateField('attack2_cost', nc)} disabled={formData.attack2_isAbility} />
                                {!formData.attack2_isAbility && (
                                    <div className="mt-1"><input type="number" className="w-1/2 border p-1 rounded text-xs" placeholder="Dano" value={formData.attack2_damage} onChange={e => updateField('attack2_damage', e.target.value)} /></div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">URL Imagem</label>
                            <input className="w-full border p-2 rounded text-xs font-mono text-gray-600" placeholder="https://..." value={formData.image} onChange={e => updateField('image', e.target.value)} />
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 mt-auto">
                        <button onClick={handleSaveCard} disabled={!formData.name || loading || !selectedDeckId} className={`w-full py-3 rounded font-bold text-white flex items-center justify-center gap-2 ${formData.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}>
                            {loading ? <Loader2 className="animate-spin"/> : (formData.id ? <><Save size={18}/> Atualizar</> : <><Plus size={18}/> Criar Carta</>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeckManager;