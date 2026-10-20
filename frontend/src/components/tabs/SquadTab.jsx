import React, { useState, useMemo } from 'react';
import {
  Users, UserCheck, UserX, AlertTriangle, Search, Plus, Trash2,
  ChevronRight, Hash, ArrowUp, ArrowDown, X
} from 'lucide-react';
import {
  POSITIONS, POSITION_GROUPS, getPositionLabel, getPositionGroup
} from '../../constants/positions';
import { SORT_OPTIONS, sortPlayers } from '../../utils/playerSort';

const NO_NATIONALITY = '__NONE__';

const statusConfig = {
  AVAILABLE: { label: 'Disponível', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  INJURED: { label: 'Lesionado', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  SUSPENDED: { label: 'Suspenso', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

const selectClass =
  'w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm';

// Rótulo + valor usados nas colunas de atributos de cada linha
function Attribute({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{children}</p>
    </div>
  );
}

export default function SquadTab({ players, onOpenModal, onDeletePlayer, onOpenDetails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterNationality, setFilterNationality] = useState('ALL');
  const [filterFoot, setFilterFoot] = useState('ALL');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [sortDir, setSortDir] = useState('asc');

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

  // Nacionalidades existentes no elenco (para o filtro)
  const nationalityOptions = useMemo(() => {
    const set = new Set();
    players.forEach((p) => {
      const n = p.nationality?.trim();
      if (n) set.add(n);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [players]);

  const hasPlayersWithoutNationality = players.some((p) => !p.nationality?.trim());

  const filteredPlayers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return players.filter((player) => {
      const positionLabel = getPositionLabel(player.position);

      const matchesSearch =
        !term ||
        player.name.toLowerCase().includes(term) ||
        positionLabel.toLowerCase().includes(term) ||
        String(player.position || '').toLowerCase().includes(term) ||
        String(player.nationality || '').toLowerCase().includes(term) ||
        String(player.number).includes(term);

      const matchesStatus = filterStatus === 'ALL' || player.status === filterStatus;
      const matchesGroup = filterGroup === 'ALL' || getPositionGroup(player.position) === filterGroup;
      const matchesPosition = filterPosition === 'ALL' || positionLabel === filterPosition;
      const matchesFoot = filterFoot === 'ALL' || player.foot === filterFoot;

      const nationality = player.nationality?.trim() || '';
      const matchesNationality =
        filterNationality === 'ALL' ||
        (filterNationality === NO_NATIONALITY ? nationality === '' : nationality === filterNationality);

      const age = Number(player.age);
      const matchesAgeMin = ageMin === '' || age >= Number(ageMin);
      const matchesAgeMax = ageMax === '' || age <= Number(ageMax);

      return (
        matchesSearch && matchesStatus && matchesGroup && matchesPosition &&
        matchesFoot && matchesNationality && matchesAgeMin && matchesAgeMax
      );
    });
  }, [players, searchTerm, filterStatus, filterGroup, filterPosition, filterFoot, filterNationality, ageMin, ageMax]);

  const sortedPlayers = useMemo(
    () => sortPlayers(filteredPlayers, sortBy, sortDir),
    [filteredPlayers, sortBy, sortDir]
  );

  const hasActiveFilters =
    searchTerm !== '' || filterStatus !== 'ALL' || filterGroup !== 'ALL' ||
    filterPosition !== 'ALL' || filterNationality !== 'ALL' || filterFoot !== 'ALL' ||
    ageMin !== '' || ageMax !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('ALL');
    setFilterGroup('ALL');
    setFilterPosition('ALL');
    setFilterNationality('ALL');
    setFilterFoot('ALL');
    setAgeMin('');
    setAgeMax('');
  };

  const handleGroupChange = (value) => {
    setFilterGroup(value);
    setFilterPosition('ALL'); // evita combinação impossível (ex.: Defesa + Ponta Direita)
  };

  const availablePlayers = players.filter((p) => p.status === 'AVAILABLE');
  const positionsForSelect =
    filterGroup === 'ALL' ? POSITIONS : POSITIONS.filter((p) => p.group === filterGroup);

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

      {/* Busca + ordenação */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, posição, nacionalidade ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Ordenar por</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${selectClass} md:w-52`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            disabled={sortBy === 'default'}
            title={sortDir === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {sortDir === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </button>
        </div>
      </div>

      {/* Filtro rápido por status */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Filtros avançados */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <select value={filterGroup} onChange={(e) => handleGroupChange(e.target.value)} className={selectClass}>
          <option value="ALL">Todos os setores</option>
          {Object.entries(POSITION_GROUPS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className={selectClass}>
          <option value="ALL">Todas as posições</option>
          {positionsForSelect.map((p) => (
            <option key={p.code} value={p.label}>{p.label}</option>
          ))}
        </select>

        <select value={filterNationality} onChange={(e) => setFilterNationality(e.target.value)} className={selectClass}>
          <option value="ALL">Todas as nacionalidades</option>
          {nationalityOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
          {hasPlayersWithoutNationality && <option value={NO_NATIONALITY}>Não informada</option>}
        </select>

        <select value={filterFoot} onChange={(e) => setFilterFoot(e.target.value)} className={selectClass}>
          <option value="ALL">Qualquer pé</option>
          <option value="Destro">Destro</option>
          <option value="Canhoto">Canhoto</option>
          <option value="Ambidestro">Ambidestro</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Idade mín."
          value={ageMin}
          onChange={(e) => setAgeMin(e.target.value)}
          className={selectClass}
        />

        <input
          type="number"
          min="0"
          placeholder="Idade máx."
          value={ageMax}
          onChange={(e) => setAgeMax(e.target.value)}
          className={selectClass}
        />
      </div>

      <div className="flex items-center justify-between mb-5 text-xs text-slate-500">
        <span>
          Mostrando <strong>{sortedPlayers.length}</strong> de <strong>{players.length}</strong> atletas
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold transition-all"
          >
            <X size={13} /> Limpar filtros
          </button>
        )}
      </div>

      {sortedPlayers.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">Nenhum atleta encontrado com esses filtros.</p>
      )}

      {/* Lista de atletas: uma linha por jogador */}
      <div className="flex flex-col gap-3">
        {sortedPlayers.map((player) => {
          const badge = statusConfig[player.status] || statusConfig.AVAILABLE;
          const isDuplicated = duplicatedNumbers.has(player.number);

          return (
            <div
              key={player.id}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:border-emerald-300 transition-all"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-5">
                {/* Identificação */}
                <div className="flex items-center gap-3 xl:w-64 shrink-0">
                  <div
                    className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center font-black text-base ${
                      isDuplicated
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}
                    title={isDuplicated ? 'Número de camisa duplicado' : undefined}
                  >
                    #{player.number}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-base text-slate-900 truncate">{player.name}</h4>
                    <p className="text-xs font-semibold text-emerald-600 truncate">
                      {getPositionLabel(player.position)}
                    </p>
                  </div>
                </div>

                {/* Atributos */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Attribute label="Nacionalidade">{player.nationality || '—'}</Attribute>
                  <Attribute label="Idade">{player.age} anos</Attribute>
                  <Attribute label="Pé dominante">{player.foot}</Attribute>
                  <Attribute label="Contrato">{player.contract_end}</Attribute>
                </div>

                {/* Status + ações */}
                <div className="flex items-center gap-3 xl:justify-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 whitespace-nowrap ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-2 ml-auto xl:ml-0">
                    <button
                      onClick={() => onDeletePlayer(player.id, player.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                      title="Excluir Atleta"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => onOpenDetails(player)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all font-semibold text-xs flex items-center gap-1"
                    >
                      Detalhes <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {(isDuplicated || player.injury) && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {isDuplicated && (
                    <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-center gap-1.5">
                      <Hash size={13} className="shrink-0 text-amber-500" />
                      <span>Camisa {player.number} repetida no elenco</span>
                    </div>
                  )}
                  {player.injury && (
                    <div className="px-2.5 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0 text-rose-500" />
                      <span>{player.injury}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}