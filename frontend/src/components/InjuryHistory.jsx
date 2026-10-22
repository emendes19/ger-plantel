import React, { useMemo, useState } from 'react';
import { History, Plus, Pencil, X } from 'lucide-react';
import {
  formatDate,
  formatMatchLabel,
  formatDaysCount,
  daysBetween,
  getTodayKey,
} from '../constants/medical';

const fieldClass =
  'w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm';

function FilterField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{children}</p>;
}

export default function InjuryHistory({ injuries, players, onRegister, onEdit }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [playerId, setPlayerId] = useState('ALL');
  const [injuryType, setInjuryType] = useState('ALL');
  const [bodyPart, setBodyPart] = useState('ALL');

  const playersById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  // Todas as lesões (encerradas e em andamento) de atletas que ainda estão no elenco
  const records = useMemo(
    () =>
      injuries
        .filter((i) => playersById[i.player_id])
        .sort((a, b) => b.injury_date.localeCompare(a.injury_date) || b.id - a.id),
    [injuries, playersById]
  );

  const playerOptions = useMemo(() => {
    const ids = [...new Set(records.map((r) => r.player_id))];
    return ids.map((id) => playersById[id]).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [records, playersById]);

  const typeOptions = useMemo(
    () => [...new Set(records.map((r) => r.injury_type))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [records]
  );

  const partOptions = useMemo(
    () => [...new Set(records.map((r) => r.body_part))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [records]
  );

  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          (!dateFrom || r.injury_date >= dateFrom) &&
          (!dateTo || r.injury_date <= dateTo) &&
          (playerId === 'ALL' || r.player_id === Number(playerId)) &&
          (injuryType === 'ALL' || r.injury_type === injuryType) &&
          (bodyPart === 'ALL' || r.body_part === bodyPart)
      ),
    [records, dateFrom, dateTo, playerId, injuryType, bodyPart]
  );

  const hasFilters =
    dateFrom !== '' || dateTo !== '' || playerId !== 'ALL' || injuryType !== 'ALL' || bodyPart !== 'ALL';

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPlayerId('ALL');
    setInjuryType('ALL');
    setBodyPart('ALL');
  };

  // Lesões em andamento contam os dias até hoje
  const today = getTodayKey();
  const daysOut = (record) => daysBetween(record.injury_date, record.discharge_date || today);
  const totalDays = filtered.reduce((sum, r) => sum + daysOut(r), 0);
  const averageDays = filtered.length > 0 ? Math.round(totalDays / filtered.length) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Histórico de Lesões</h3>
            <p className="text-xs text-slate-500">Todas as lesões do elenco, encerradas e em andamento.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={16} /> Registrar lesão anterior
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">
          Nenhuma lesão registrada ainda. Use "Registrar lesão anterior" para montar o histórico dos atletas.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <FilterField label="Lesão a partir de">
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className={fieldClass}
              />
            </FilterField>

            <FilterField label="Lesão até">
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className={fieldClass}
              />
            </FilterField>

            <FilterField label="Atleta">
              <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className={fieldClass}>
                <option value="ALL">Todos os atletas</option>
                {playerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Tipo de lesão">
              <select value={injuryType} onChange={(e) => setInjuryType(e.target.value)} className={fieldClass}>
                <option value="ALL">Todos os tipos</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Local do corpo">
              <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} className={fieldClass}>
                <option value="ALL">Todos os locais</option>
                {partOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FilterField>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              <strong>{filtered.length}</strong> {filtered.length === 1 ? 'lesão' : 'lesões'} de{' '}
              <strong>{records.length}</strong>
              {filtered.length > 0 && (
                <>
                  {' '}• <strong>{formatDaysCount(totalDays)}</strong> afastados no total • média de{' '}
                  <strong>{formatDaysCount(averageDays)}</strong> por lesão
                </>
              )}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start md:self-auto flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold transition-all"
              >
                <X size={13} /> Limpar filtros
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">Nenhuma lesão encontrada com esses filtros.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((record) => {
                const player = playersById[record.player_id];
                const days = daysOut(record);
                const matchLabel = record.match ? formatMatchLabel(record.match) : 'Fora de jogo';

                return (
                  <div key={record.id} className="py-3 grid grid-cols-2 md:grid-cols-12 gap-3 text-xs items-center">
                    <div className="col-span-2 md:col-span-3 min-w-0">
                      <p className="font-bold text-slate-800 truncate">#{player.number} {player.name}</p>
                      <p className="text-slate-500 truncate">
                        {record.injury_type} — {record.body_part}
                        {record.body_side ? ` (${record.body_side.toLowerCase()})` : ''}
                      </p>
                    </div>

                    <div className="col-span-2 md:col-span-3 min-w-0">
                      <Label>Lesão em</Label>
                      <p className="font-semibold text-slate-700">{formatDate(record.injury_date)}</p>
                      <p className="text-slate-400 truncate" title={matchLabel}>{matchLabel}</p>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Alta</Label>
                      {record.discharge_date ? (
                        <p className="font-semibold text-slate-700">{formatDate(record.discharge_date)}</p>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          Em andamento
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label>Tempo afastado</Label>
                      <p className="font-semibold text-slate-700">
                        {formatDaysCount(days)}
                        {!record.discharge_date && <span className="text-slate-400 font-medium"> (até hoje)</span>}
                      </p>
                    </div>

                    <div className="col-span-2 md:col-span-2 flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all flex items-center gap-1.5"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}