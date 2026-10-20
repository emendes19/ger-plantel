import React, { useState, useMemo } from 'react';
import { Users, UserCheck, UserX, AlertTriangle, Search, Plus, Trash2, ChevronRight, Hash } from 'lucide-react';
import { POSITION_GROUPS, getPositionLabel, getPositionGroup } from '../../constants/positions';

export default function SquadTab({ players, onOpenModal, onDeletePlayer, onOpenDetails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');

  // Números de camisa que aparecem mais de uma vez (proteção visual extra)
  const duplicatedNumbers = useMemo(() => {
    const counts = {};
    players.forEach((p) => {
      counts[p.number] = (counts[p.number] || 0) + 1;
    });
    return new Set(
      Object.keys(counts).filter((n) => counts[n] > 1).map(Number)
    );
  }, [players]);

  const filteredPlayers = players.filter((player) => {
    const term = searchTerm.toLowerCase();
    const positionLabel = getPositionLabel(player.position).toLowerCase();

    const matchesSearch =
      player.name.toLowerCase().includes(term) ||
      positionLabel.includes(term) ||
      String(player.position || '').toLowerCase().includes(term) ||
      String(player.number).includes(term);

    const matchesStatus = filterStatus === 'ALL' || player.status === filterStatus;
    const matchesGroup =
      filterGroup === 'ALL' || getPositionGroup(player.position) === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const availablePlayers = players.filter((p) => p.status === 'AVAILABLE');

  const statusConfig = {
    AVAILABLE: { label: 'Disponível', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    INJURED: { label: 'Lesionado', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    SUSPENDED: { label: 'Suspenso', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão do Elenco</h2>
          <p className="text-xs text-slate-500">Visualização e controle geral dos atletas integrados ao MySQL.</p>
        </div>
        <button
          onClick={onOpenModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={16} /> Novo Atleta
        </button>
      </div>

      {duplicatedNumbers.size > 0 && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            Existem números de camisa repetidos no elenco:{' '}
            <strong>{[...duplicatedNumbers].sort((a, b) => a - b).map((n) => `#${n}`).join(', ')}</strong>.
            Corrija para evitar conflitos de escalação.
          </span>
        </div>
      )}

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
              {players.filter((p) => p.status === 'INJURED').length}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={22} /></div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Suspensos</p>
            <h3 className="text-3xl font-extrabold mt-1 text-amber-600">
              {players.filter((p) => p.status === 'SUSPENDED').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserX size={22} /></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-stretch lg:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, posição ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="ALL">Todas as posições</option>
            {Object.entries(POSITION_GROUPS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'AVAILABLE', label: 'Disponíveis' },
            { key: 'INJURED', label: 'Lesionados' },
            { key: 'SUSPENDED', label: 'Suspensos' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === item.key
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">Nenhum atleta encontrado com esses filtros.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlayers.map((player) => {
          const badge = statusConfig[player.status] || statusConfig.AVAILABLE;
          const isDuplicated = duplicatedNumbers.has(player.number);

          return (
            <div
              key={player.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-lg ${
                        isDuplicated
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      }`}
                      title={isDuplicated ? 'Número de camisa duplicado' : undefined}
                    >
                      #{player.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{player.name}</h4>
                      <p className="text-xs font-semibold text-emerald-600">
                        {getPositionLabel(player.position)}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {player.age} anos • Pé {player.foot}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    {badge.label}
                  </span>
                </div>

                {isDuplicated && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-center gap-2">
                    <Hash size={14} className="shrink-0 text-amber-500" />
                    <span>Camisa {player.number} repetida no elenco</span>
                  </div>
                )}

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
                    onClick={() => onDeletePlayer(player.id, player.name)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                    title="Excluir Atleta"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => onOpenDetails(player)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all font-semibold flex items-center gap-1"
                  >
                    Detalhes <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}