import React, { useState } from 'react';
import { Layout, UserCheck, RefreshCw } from 'lucide-react';

export default function TacticsTab({ players, startingLineup, setStartingLineup }) {
  const [tacticalFormation, setTacticalFormation] = useState('4-3-3');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const availablePlayers = players.filter(p => p.status === 'AVAILABLE');

  const formationLayouts = {
    '4-3-3': { defenders: 4, midfielders: 3, forwards: 3 },
    '4-4-2': { defenders: 4, midfielders: 4, forwards: 2 },
    '3-5-2': { defenders: 3, midfielders: 5, forwards: 2 }
  };

  const currentLayout = formationLayouts[tacticalFormation];

  const swapPlayerInLineup = (newPlayerId) => {
    if (selectedSlotIndex === null) return;
    const updated = [...startingLineup];
    updated[selectedSlotIndex] = newPlayerId;
    setStartingLineup(updated);
    setSelectedSlotIndex(null);
  };

  const renderPitchCard = (slotIndex, roleName) => {
    const playerId = startingLineup[slotIndex];
    const player = players.find(p => p.id === playerId);
    const isSelected = selectedSlotIndex === slotIndex;

    return (
      <div 
        key={slotIndex}
        onClick={() => setSelectedSlotIndex(isSelected ? null : slotIndex)}
        className={`cursor-pointer transition-all p-1.5 rounded-xl border text-center max-w-[130px] w-full ${
          isSelected 
            ? 'bg-amber-300 text-slate-900 border-amber-400 scale-105 shadow-lg' 
            : 'bg-white/95 hover:bg-white text-slate-900 border-emerald-300 shadow-md hover:scale-105'
        }`}
      >
        <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
          {player ? `#${player.number} ${player.position}` : roleName}
        </p>
        <p className="text-xs font-bold truncate">
          {player ? player.name.split(' ')[0] + ' ' + (player.name.split(' ')[1] || '') : 'Vazio'}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prancheta Tática</h2>
          <p className="text-xs text-slate-500">Escalação dos 11 titulares. Clique em qualquer vaga no campo para selecionar e trocar por outro atleta.</p>
        </div>
        {selectedSlotIndex !== null && (
          <div className="bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 animate-pulse">
            Selecione um atleta da lista ao lado para substituir a posição #{selectedSlotIndex + 1}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-emerald-800 rounded-3xl p-6 border-4 border-emerald-700 shadow-xl text-white relative overflow-hidden min-h-[580px] flex flex-col justify-between">
          <div className="absolute inset-4 border-2 border-emerald-500/40 rounded-2xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-emerald-500/40 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-500/40 rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-center bg-emerald-900/80 backdrop-blur-md p-3 rounded-2xl border border-emerald-600/50">
            <span className="font-bold text-sm flex items-center gap-2">
              <Layout size={18} className="text-emerald-300" /> Esquema Tático:
            </span>
            <div className="flex gap-2">
              {['4-3-3', '4-4-2', '3-5-2'].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setTacticalFormation(f);
                    setSelectedSlotIndex(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    tacticalFormation === f ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-800/80 hover:bg-emerald-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 my-4 flex flex-col justify-around gap-6 h-full">
            <div className="flex justify-around items-center px-4">
              {Array.from({ length: currentLayout.forwards }).map((_, i) => {
                const slotIndex = 1 + currentLayout.defenders + currentLayout.midfielders + i;
                return renderPitchCard(slotIndex, 'ATA');
              })}
            </div>

            <div className="flex justify-around items-center px-2">
              {Array.from({ length: currentLayout.midfielders }).map((_, i) => {
                const slotIndex = 1 + currentLayout.defenders + i;
                return renderPitchCard(slotIndex, 'MEI');
              })}
            </div>

            <div className="flex justify-around items-center px-2">
              {Array.from({ length: currentLayout.defenders }).map((_, i) => {
                const slotIndex = 1 + i;
                return renderPitchCard(slotIndex, 'DEF');
              })}
            </div>

            <div className="flex justify-center">
              {renderPitchCard(0, 'GOL')}
            </div>
          </div>

          <div className="relative z-10 text-center text-xs text-emerald-200 bg-emerald-900/60 p-2 rounded-xl">
            ✔ 11 Atletas Titulares Escalados na Formação {tacticalFormation}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <UserCheck className="text-emerald-500" size={20} /> Atletas Disponíveis
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {selectedSlotIndex !== null 
              ? "Clique em 'Substituir' no atleta desejado para colocá-lo na posição selecionada."
              : "Clique primeiro em um jogador no campo para habilitar a troca."}
          </p>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {availablePlayers.map((player) => {
              const isAlreadyStarting = startingLineup.includes(player.id);
              return (
                <div 
                  key={player.id} 
                  className={`flex justify-between items-center p-3 border rounded-xl transition-all ${
                    isAlreadyStarting ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      #{player.number}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">{player.name}</h5>
                      <p className="text-[10px] text-slate-400">{player.position} {isAlreadyStarting && '• (Titular)'}</p>
                    </div>
                  </div>

                  {selectedSlotIndex !== null && !isAlreadyStarting && (
                    <button 
                      onClick={() => swapPlayerInLineup(player.id)}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <RefreshCw size={12} /> Colocar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}