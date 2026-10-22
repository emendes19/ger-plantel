import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ModalNewPlayer from './components/ModalNewPlayer';
import ModalPlayerDetails from './components/ModalPlayerDetails';
import SquadTab from './components/tabs/SquadTab';
import TacticsTab from './components/tabs/TacticsTab';
import ScheduleTab from './components/tabs/ScheduleTab';
import MedicalTab from './components/tabs/MedicalTab';

import { DEFAULT_TACTICS } from './constants/tactics';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('squad');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [startingLineup, setStartingLineup] = useState([]);
  const [tactics, setTactics] = useState(DEFAULT_TACTICS);

  const loadPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
      setLoading(false);

      if (startingLineup.length === 0) {
        const availables = data.filter(p => p.status === 'AVAILABLE');
        setStartingLineup(availables.slice(0, 11).map(p => p.id));
      }
    } catch (err) {
      setError('Não foi possível carregar os dados do servidor. Verifique se o FastAPI está rodando.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // A lesão é registrada na aba Departamento Médico; a suspensão (motivo e jogos) é enviada aqui
  const buildPayload = (formData) => {
    const isSuspended = formData.status === 'SUSPENDED';
    const hasGames = formData.suspension_games !== '' && formData.suspension_games != null;

    return {
      ...formData,
      number: Number(formData.number),
      age: Number(formData.age),
      nationality: formData.nationality?.trim() || null,
      suspension_reason: isSuspended ? formData.suspension_reason?.trim() || null : null,
      suspension_games: isSuspended && hasGames ? Number(formData.suspension_games) : null
    };
  };

  // Não captura o erro: o modal exibe a mensagem e mantém o formulário preenchido
  const handleCreatePlayer = async (formData) => {
    await createPlayer(buildPayload(formData));
    setIsModalOpen(false);
    await loadPlayers();
  };

  const handleUpdatePlayer = async (id, formData) => {
    const updated = await updatePlayer(id, buildPayload(formData));
    setSelectedPlayer(updated);
    await loadPlayers();
  };

  const handleDeletePlayer = async (id, name) => {
    if (confirm(`Deseja realmente remover ${name} do plantel?`)) {
      try {
        await deletePlayer(id);
        loadPlayers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-sm font-bold">Carregando dados do plantel direto do MySQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl max-w-md text-rose-800">
          <AlertTriangle size={32} className="mx-auto mb-2 text-rose-500" />
          <h2 className="font-bold text-base mb-1">Erro de Conexão</h2>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'squad' && (
          <SquadTab 
            players={players} 
            onOpenModal={() => setIsModalOpen(true)} 
            onDeletePlayer={handleDeletePlayer} 
            onOpenDetails={setSelectedPlayer}
          />
        )}

        {activeTab === 'tactics' && (
          <TacticsTab 
            players={players} 
            startingLineup={startingLineup} 
            setStartingLineup={setStartingLineup} 
            tactics={tactics}
            setTactics={setTactics}
          />
        )}

        {activeTab === 'schedule' && <ScheduleTab />}

        {activeTab === 'medical' && <MedicalTab players={players} onRefreshPlayers={loadPlayers} />}
      </main>

      <ModalNewPlayer 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreatePlayer} 
        players={players}
      />

      {selectedPlayer && (
        <ModalPlayerDetails
          key={selectedPlayer.id}
          player={selectedPlayer}
          players={players}
          onClose={() => setSelectedPlayer(null)}
          onUpdate={handleUpdatePlayer}
        />
      )}
    </div>
  );
}