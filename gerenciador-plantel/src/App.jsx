import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Shield, Search, 
  AlertTriangle, Calendar as CalendarIcon, ChevronRight, Activity, 
  Layout, Plus, Loader2, Trash2, X
} from 'lucide-react';

export default function GerenciadorDePlantel() {
  const [activeTab, setActiveTab] = useState('squad');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados do Modal de Novo Atleta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'Zagueiro',
    status: 'AVAILABLE',
    age: '',
    injury: '',
    foot: 'Destro',
    contract_end: '12/2027'
  });

  // Função para buscar jogadores da API
  const fetchPlayers = () => {
    fetch('http://localhost:8000/players')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao conectar com o back-end');
        return res.json();
      })
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar os dados do servidor. Verifique se o FastAPI está rodando.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Função para cadastrar novo atleta via API (POST)
  const handleCreatePlayer = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      number: Number(formData.number),
      age: Number(formData.age),
      injury: formData.status === 'AVAILABLE' ? null : formData.injury
    };

    fetch('http://localhost:8000/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao cadastrar atleta');
        return res.json();
      })
      .then(() => {
        setIsModalOpen(false);
        setFormData({
          name: '',
          number: '',
          position: 'Zagueiro',
          status: 'AVAILABLE',
          age: '',
          injury: '',
          foot: 'Destro',
          contract_end: '12/2027'
        });
        fetchPlayers(); // Recarrega a lista do MySQL
      })
      .catch((err) => alert(err.message));
  };

  // Função para excluir atleta via API (DELETE)
  const handleDeletePlayer = (id, name) => {
    if (confirm(`Deseja realmente remover ${name} do plantel?`)) {
      fetch(`http://localhost:8000/players/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao excluir atleta');
          fetchPlayers(); // Recarrega a lista do MySQL
        })
        .catch((err) => alert(err.message));
    }
  };

  // Calendário em Grade de Outubro 2026
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let event = null;
    if (day === 2 || day === 9 || day === 16 || day === 23) event = { title: 'Treino Físico', type: 'WORKOUT' };
    if (day === 4 || day === 11 || day === 18 || day === 25) event = { title: 'Jogo Oficial', type: 'MATCH' };
    if (day === 6 || day === 13 || day === 20 || day === 27) event = { title: 'Treino Tático', type: 'TACTICAL' };
    if (day === 8 || day === 15 || day === 22 || day === 29) event = { title: 'Treino Técnico', type: 'TECHNICAL' };
    return { day, event };
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [tacticalFormation, setTacticalFormation] = useState('4-3-3');

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || player.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const availablePlayers = players.filter(p => p.status === 'AVAILABLE');

  const statusConfig = {
    AVAILABLE: { label: 'Disponível', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    INJURED: { label: 'Lesionado', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    SUSPENDED: { label: 'Suspenso', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
  };

  const navItems = [
    { id: 'squad', label: 'Elenco', icon: Users },
    { id: 'tactics', label: 'Prancheta Tática', icon: Layout },
    { id: 'schedule', label: 'Calendário Mensal', icon: CalendarIcon },
    { id: 'medical', label: 'Dept. Médico', icon: Activity },
  ];

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
      {/* BARRA LATERAL (SIDEBAR VERTICAL) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-20">
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-500/30 shrink-0">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Plantel Manager</h1>
              <p className="text-[11px] text-slate-400 font-medium">Gestão de Futebol</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              FC
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Clube Profissional</p>
              <p className="text-[10px] text-slate-400">Temporada 2026</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ABA 1: ELENCO */}
        {activeTab === 'squad' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gestão do Elenco</h2>
                <p className="text-xs text-slate-500">Visualização e controle geral dos atletas integrados ao MySQL.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={16} /> Novo Atleta
              </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total no Elenco</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-slate-900">{players.length}</h3>
                </div>
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Users size={22} /></div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Disponíveis</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-emerald-600">{availablePlayers.length}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck size={22} /></div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No Dept. Médico</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-rose-600">
                    {players.filter(p => p.status === 'INJURED').length}
                  </h3>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={22} /></div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Suspensos</p>
                  <h3 className="text-3xl font-extrabold mt-1 text-amber-600">
                    {players.filter(p => p.status === 'SUSPENDED').length}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserX size={22} /></div>
              </div>
            </div>

            {/* Busca e Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou posição..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { key: 'ALL', label: 'Todos' },
                  { key: 'AVAILABLE', label: 'Disponíveis' },
                  { key: 'INJURED', label: 'Lesionados' },
                  { key: 'SUSPENDED', label: 'Suspensos' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilterStatus(item.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === item.key ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Jogadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlayers.map((player) => {
                const badge = statusConfig[player.status] || statusConfig.AVAILABLE;
                return (
                  <div key={player.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-lg text-emerald-600">
                            #{player.number}
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-slate-900">{player.name}</h4>
                            <p className="text-xs font-medium text-slate-400">{player.position} • {player.age} anos • Pé {player.foot}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </div>

                      {player.injury && (
                        <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                          <span>{player.injury}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                      <span>Contrato: <strong>{player.contract_end}</strong></span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeletePlayer(player.id, player.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                          title="Excluir Atleta"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all font-semibold flex items-center gap-1">
                          Detalhes <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 2: PRANCHETA TÁTICA */}
        {activeTab === 'tactics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Prancheta Tática</h2>
              <p className="text-xs text-slate-500">Monte a escalação com base nos atletas sem restrição médica vindos do banco.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-emerald-800 rounded-3xl p-6 border-4 border-emerald-700 shadow-xl text-white relative overflow-hidden min-h-[480px] flex flex-col justify-between">
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
                        onClick={() => setTacticalFormation(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          tacticalFormation === f ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-800/80 hover:bg-emerald-700'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 my-8 grid grid-rows-4 gap-6 text-center">
                  <div className="flex justify-around items-center">
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #9 Gabriel Santos (ATA)
                    </div>
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #11 Marinho (ATA)
                    </div>
                  </div>
                  <div className="flex justify-around items-center">
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #10 Carlos Eduardo (MEI)
                    </div>
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #5 Bruno Guimarães (VOL)
                    </div>
                  </div>
                  <div className="flex justify-around items-center">
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #6 Felipe Melo (L.E.)
                    </div>
                    <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border-2 border-emerald-300">
                      #3 Rodrigo Alves (ZAG)
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-amber-400 text-slate-900 px-3.5 py-1.5 rounded-xl font-black text-xs shadow-lg border-2 border-amber-200">
                      #1 Marcos Silva (GOL)
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-center text-xs text-emerald-200 bg-emerald-900/60 p-2 rounded-xl">
                  ✔ Apenas atletas livres de lesão ou suspensão podem ser escalados
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="text-emerald-500" size={20} /> Atletas Disponíveis ({availablePlayers.length})
                </h3>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {availablePlayers.map((player) => (
                    <div key={player.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                          #{player.number}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{player.name}</h5>
                          <p className="text-[10px] text-slate-400">{player.position}</p>
                        </div>
                      </div>
                      <button className="text-xs bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 px-2.5 py-1 rounded-lg font-bold transition-all">
                        Escalar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: CALENDÁRIO MENSAL */}
        {activeTab === 'schedule' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Calendário de Outubro 2026</h2>
                <p className="text-xs text-slate-500">Agenda mensal unificada de partidas, treinos e academia.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Partidas</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 ml-3"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Treinos</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center font-bold text-xs text-slate-400 py-2">{d}</div>
              ))}

              {calendarDays.map(({ day, event }) => (
                <div 
                  key={day} 
                  className={`min-h-[100px] border rounded-2xl p-2.5 flex flex-col justify-between transition-all ${
                    event 
                      ? event.type === 'MATCH' 
                        ? 'bg-amber-50/60 border-amber-200 shadow-sm' 
                        : 'bg-emerald-50/40 border-emerald-200 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className={`text-xs font-bold ${event ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                  {event && (
                    <div className={`p-1.5 rounded-xl text-[10px] font-bold leading-tight ${
                      event.type === 'MATCH' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {event.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: DEPARTAMENTO MÉDICO */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Departamento Médico</h2>
              <p className="text-xs text-slate-500">Acompanhamento clínico e fisioterápico dos atletas indisponíveis.</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-900">Relatório de Reabilitação Clínica</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Atletas sob supervisão da equipe médica ou cumprindo suspensão.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {players.filter(p => p.status !== 'AVAILABLE').map((player) => (
                <div key={player.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
                        #{player.number}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900">{player.name}</h4>
                        <p className="text-xs text-slate-400">{player.position} • {player.age} anos</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      player.status === 'INJURED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {player.status === 'INJURED' ? 'Em Tratamento' : 'Suspenso'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                    <p><strong>Ocorrência:</strong> {player.injury || 'Nenhuma restrição informada'}</p>
                    <p><strong>Status Contratual:</strong> Ativo até {player.contract_end}</p>
                  </div>

                  <button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
                    {player.status === 'INJURED' ? 'Dar Alta / Liberar Atleta' : 'Regularizar Situação'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE NOVO ATLETA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Cadastrar Novo Atleta</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Cristiano Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Número / Camisa</label>
                  <input 
                    type="number" 
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="Ex: 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Posição</label>
                  <select 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral Direito">Lateral Direito</option>
                    <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                    <option value="Volante">Volante</option>
                    <option value="Meia">Meia</option>
                    <option value="Ponta Direita">Ponta Direita</option>
                    <option value="Ponta Esquerda">Ponta Esquerda</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Idade</label>
                  <input 
                    type="number" 
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Ex: 24"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Status Clínico / Contratual</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AVAILABLE">Disponível</option>
                    <option value="INJURED">Lesionado</option>
                    <option value="SUSPENDED">Suspenso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pé Dominante</label>
                  <select 
                    value={formData.foot}
                    onChange={(e) => setFormData({...formData, foot: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Destro">Destro</option>
                    <option value="Canhoto">Canhoto</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'AVAILABLE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Descrição da Lesão / Suspensão</label>
                  <input 
                    type="text" 
                    value={formData.injury}
                    onChange={(e) => setFormData({...formData, injury: e.target.value})}
                    placeholder="Ex: Estiramento na coxa (Retorno: 10 dias)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fim do Contrato</label>
                <input 
                  type="text" 
                  required
                  value={formData.contract_end}
                  onChange={(e) => setFormData({...formData, contract_end: e.target.value})}
                  placeholder="Ex: 12/2027"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Salvar Atleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}