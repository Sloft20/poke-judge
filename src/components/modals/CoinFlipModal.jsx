import React, { useState, useEffect } from 'react';
import { X, Coins, CircleDot, Star, CheckCircle2, XCircle } from 'lucide-react';
import { Modal, Button } from '../UI'; // Importando seus componentes base

const CoinFlipModal = ({ isOpen, onClose, onComplete }) => {
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState(null); // 'heads' ou 'tails'
    const [selection, setSelection] = useState(null); // O que o jogador escolheu
    const [rotation, setRotation] = useState(0);
    const [showResultStep, setShowResultStep] = useState(false);

    // Reseta o estado quando o modal abre
    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setSelection(null);
            setIsFlipping(false);
            setRotation(0);
            setShowResultStep(false);
        }
    }, [isOpen]);

    const handleFlip = () => {
        if (isFlipping || !selection) return;

        setIsFlipping(true);
        setResult(null);
        
        // 1. Decide o resultado matematicamente
        const newResult = Math.random() < 0.5 ? 'heads' : 'tails';
        
        // 2. Calcula a rotação final (Muitas voltas + o lado certo)
        // Adiciona 5 a 8 voltas completas (360 * 5 = 1800)
        const baseRotation = 1800 + Math.floor(Math.random() * 3) * 360; 
        // Se for 'tails' (Coroa), adiciona mais 180 graus para virar
        const finalRotation = baseRotation + (newResult === 'tails' ? 180 : 0);

        setRotation(finalRotation);

        // 3. Espera a animação terminar para mostrar o resultado
        setTimeout(() => {
            setResult(newResult);
            setIsFlipping(false);
            setShowResultStep(true);

            // Loga o resultado
            const won = selection === newResult;
            const resultText = newResult === 'heads' ? 'CARA' : 'COROA';
            const logText = `Jogou a moeda. Escolheu ${selection === 'heads' ? 'CARA' : 'COROA'}. Resultado: ${resultText}. ${won ? '[VENCEU]' : '[PERDEU]'}`;
            // Define o nível do log baseado na vitória/derrota
            const logLevel = won ? 'SUCCESS' : 'WARN';
            
            onComplete(logText, logLevel);
        }, 3000); // Duração da animação (3 segundos)
    };

    const didWin = selection === result;

    return (
        <Modal isOpen={isOpen} onClose={isFlipping ? null : onClose} title="Cara ou Coroa">
            {/* Estilos CSS 3D Locais */}
            <style jsx>{`
                .coin-container {
                    perspective: 1000px;
                }
                .coin {
                    width: 128px;
                    height: 128px;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .coin__face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 4px solid;
                    box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.2);
                }
                .coin__face--heads {
                    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
                    border-color: #cbd5e1;
                    color: #0f172a;
                    transform: rotateY(0deg);
                }
                .coin__face--tails {
                    background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
                    border-color: #fbbf24;
                    color: #451a03;
                    transform: rotateY(180deg);
                }
            `}</style>

            <div className="flex flex-col items-center justify-center py-6 space-y-8">
                
                {/* --- A MOEDA 3D --- */}
                <div className="coin-container">
                    <div 
                        className="coin" 
                        style={{ transform: `rotateY(${rotation}deg)` }}
                    >
                        {/* Frente (CARA) */}
                        <div className="coin__face coin__face--heads flex flex-col">
                            <CircleDot size={48} strokeWidth={1.5} />
                            <span className="text-xs font-black tracking-widest mt-1">CARA</span>
                        </div>
                        {/* Verso (COROA) */}
                        <div className="coin__face coin__face--tails flex flex-col">
                            <Star size={48} strokeWidth={1.5} fill="currentColor" />
                            <span className="text-xs font-black tracking-widest mt-1">COROA</span>
                        </div>
                    </div>
                </div>

                {/* --- STATUS E CONTROLES --- */}
                {!showResultStep ? (
                    // ETAPA 1: ESCOLHA E GIRO
                    <div className="flex flex-col items-center gap-4 w-full animate-in fade-in">
                        {!isFlipping && <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Faça sua escolha</p>}
                        
                        <div className="flex gap-4 w-full max-w-xs">
                            <button
                                onClick={() => setSelection('heads')}
                                disabled={isFlipping}
                                className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                                    selection === 'heads' 
                                    ? 'border-slate-300 bg-slate-700 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                    : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600'
                                } ${isFlipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <CircleDot size={16}/> CARA
                            </button>
                            <button
                                onClick={() => setSelection('tails')}
                                disabled={isFlipping}
                                className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                                    selection === 'tails' 
                                    ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                    : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-yellow-900/20 hover:text-yellow-600'
                                } ${isFlipping ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Star size={16}/> COROA
                            </button>
                        </div>

                        <Button 
                            variant={selection ? 'primary' : 'secondary'} 
                            className={`w-full max-w-xs h-12 text-lg font-black tracking-widest transition-all ${isFlipping ? 'bg-cyan-600 cursor-not-allowed animate-pulse' : ''}`}
                            onClick={handleFlip}
                            disabled={!selection || isFlipping}
                            icon={Coins}
                        >
                            {isFlipping ? 'GIRANDO...' : 'GIRAR MOEDA'}
                        </Button>
                    </div>
                ) : (
                    // ETAPA 2: RESULTADO
                    <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className={`flex flex-col items-center p-4 rounded-2xl border-2 ${didWin ? 'border-green-500 bg-green-950/30 text-green-400' : 'border-red-500 bg-red-950/30 text-red-400'}`}>
                            {didWin ? <CheckCircle2 size={48} className="mb-2 animate-bounce"/> : <XCircle size={48} className="mb-2"/>}
                            <h3 className="text-2xl font-black uppercase tracking-tighter">
                                {didWin ? 'VOCÊ VENCEU!' : 'VOCÊ PERDEU!'}
                            </h3>
                            <p className="text-sm font-mono mt-1 opacity-80">
                                Resultado: <span className="font-bold">{result === 'heads' ? 'CARA' : 'COROA'}</span>
                            </p>
                        </div>
                         <Button variant="secondary" onClick={onClose} className="w-full max-w-xs">Fechar</Button>
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default CoinFlipModal;