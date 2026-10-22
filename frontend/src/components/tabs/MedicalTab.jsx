import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, Plus, Pencil, CheckCircle2, ChevronDown, ChevronUp, X, AlertTriangle, Loader2,
} from 'lucide-react';
import ModalInjury from '../ModalInjury';
import { toDateKey } from '../../constants/schedule';
import {
  INJURY_PHASES,
  getInjuryPhase,
  getTodayKey,
  formatDate,
  describeDays,
  daysFromToday,
  daysBetween,
  formatMatchLabel,
} from '../../constants/medical';
import {
  getInjuries, createInjury, updateInjury, dischargeInjury, deleteInjury, getEvents,
} from '../../services/api';

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700">{children}</p>
    </div>
  );
}

function ReturnDate({ dateKey }) {
  if (!dateKey) return 'Sem previsão';
  return (
    <>
      {formatDate(dateKey)} <span className="text-slate-400 font-medium">({describeDays(dateKey)})</span>
    </>
  );
}

function DischargeDialog({ injury, player, onClose, onConfirm }) {
  const [dateKey, setDateKey] = useState(getTodayKey());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (dateKey < injury.injury_date) {
      setError('A alta não pode ser anterior à data da lesão.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onConfirm(dateKey);
    } catch (err) {
      setError(err?.message || 'Não foi possível dar alta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleConfirm}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Dar alta</h3>
            <p className="text-xs text-slate-500">
              {player.name} volta a ficar disponível para a comissão técnica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Data da alta</label>
          <input
            type="date"
            required
            min={injury.injury_date}
            max={getTodayKey()}
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Confirmar alta'}
          </button>
        </div>
      </form>
    </div>
  );
}

function InjuryCard({ injury, player, onEdit, onDischarge }) {
  const phase = getInjuryPhase(injury);
  const info = INJURY_PHASES[phase];
  const daysOut = -daysFromToday(injury.injury_date);
  const location = [injury.body_part, injury.body_side && `lado ${injury.body_side.toLowerCase()}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
            #{player.number}
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 truncate">{player.name}</h4>
            <p className="text-xs text-slate-400">{player.position} • {player.age} anos</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${info.badge}`}>
          {info.label}
        </span>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-x-4 gap-y-3">
        <Field label="Tipo de lesão">{injury.injury_type}</Field>
        <Field label="Local">{location}</Field>
        <Field label="Lesão em">
          {formatDate(injury.injury_date)}{' '}
          <span className="text-slate-400 font-medium">
            ({daysOut <= 0 ? 'hoje' : `afastado há ${daysOut} ${daysOut === 1 ? 'dia' : 'dias'}`})
          </span>
        </Field>
        <Field label="Jogo em que ocorreu">{injury.match ? formatMatchLabel(injury.match) : 'Fora de jogo'}</Field>
        <Field label="Retorno aos treinos"><ReturnDate dateKey={injury.expected_return_training} /></Field>
        <Field label="Liberação para jogar"><ReturnDate dateKey={injury.expected_return_play} /></Field>
      </div>

      {injury.notes && <p className="text-xs text-slate-500 mt-3"><strong>Obs.:</strong> {injury.notes}</p>}

      {phase === 'READY' && (
        <p className="text-xs font-semibold text-emerald-700 mt-3">
          O prazo de liberação foi atingido. Avalie dar alta ao atleta.
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={() => onEdit(injury)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Pencil size={13} /> Editar lesão
        </button>
        <button
          type="button"
          onClick={() => onDischarge(injury)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 size={14} /> Dar alta
        </button>
      </div>
    </div>
  );
}

export default function MedicalTab({ players, onRefreshPlayers }) {
  const [injuries, setInjuries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState(null); // { injury, playerId, notes }
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadInjuries = useCallback(async () => {
    try {
      setLoadError('');
      setInjuries(await getInjuries());
    } catch (err) {
      setLoadError('Não foi possível carregar as lesões. Verifique se o FastAPI está rodando (reinicie-o para criar a tabela de lesões).');
    } finally {
      setLoading(false);
    }
  }, []);

  // Jogos do calendário dos últimos 180 dias, para vincular a lesão a uma partida
  const loadMatches = useCallback(async () => {
    try {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 180);
      const toKey = (d) => toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      const events = await getEvents(toKey(start), toKey(now));
      setMatches(events.filter((e) => e.type === 'MATCH'));
    } catch (err) {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    loadInjuries();
    loadMatches();
  }, [loadInjuries, loadMatches]);

  const playersById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  const activeInjuries = useMemo(() => {
    const sortKey = (i) => i.expected_return_play || i.expected_return_training || '9999-12-31';
    return injuries
      .filter((i) => !i.discharge_date && playersById[i.player_id])
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  }, [injuries, playersById]);

  const history = useMemo(
    () =>
      injuries
        .filter((i) => i.discharge_date && playersById[i.player_id])
        .sort((a, b) => b.discharge_date.localeCompare(a.discharge_date)),
    [injuries, playersById]
  );

  // Atletas marcados como lesionados no Plantel, mas sem registro detalhado
  const unregistered = useMemo(() => {
    const withRecord = new Set(activeInjuries.map((i) => i.player_id));
    return players.filter((p) => p.status === 'INJURED' && !withRecord.has(p.id));
  }, [players, activeInjuries]);

  const phaseCounts = activeInjuries.reduce((acc, injury) => {
    const phase = getInjuryPhase(injury);
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});

  const refreshAll = async () => {
    await Promise.all([loadInjuries(), onRefreshPlayers ? onRefreshPlayers() : null]);
  };

  const handleSave = async (payload) => {
    if (modal.injury) {
      await updateInjury(modal.injury.id, payload);
    } else {
      await createInjury(payload);
    }
    setModal(null);
    await refreshAll();
  };

  const handleDeleteInjury = async (id) => {
    await deleteInjury(id);
    setModal(null);
    await refreshAll();
  };

  const handleDischarge = async (dateKey) => {
    await dischargeInjury(dischargeTarget.id, { discharge_date: dateKey });
    setDischargeTarget(null);
    await refreshAll();
  };

  const hasAnything = activeInjuries.length > 0 || unregistered.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Departamento Médico</h2>
          <p className="text-xs text-slate-500">Acompanhamento clínico e fisioterápico dos atletas lesionados.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ injury: null, playerId: null, notes: '' })}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={16} /> Registrar lesão
        </button>
      </div>

      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-rose-500 text-white rounded-xl">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900">Relatório de Reabilitação Clínica</h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Atletas sob supervisão da equipe médica. As suspensões são gerenciadas na aba Plantel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(INJURY_PHASES).map(([key, info]) => (
          <div key={key} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{info.label}</p>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-900">{phaseCounts[key] || 0}</h3>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin text-emerald-500" /> Carregando lesões...
        </div>
      )}

      {loadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-500" />
          <span>{loadError}</span>
        </div>
      )}

      {!loading && !loadError && !hasAnything && (
        <p className="text-center text-sm text-slate-400 py-10">Nenhum atleta no departamento médico.</p>
      )}

      {activeInjuries.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {activeInjuries.map((injury) => (
            <InjuryCard
              key={injury.id}
              injury={injury}
              player={playersById[injury.player_id]}
              onEdit={(item) => setModal({ injury: item, playerId: item.player_id, notes: '' })}
              onDischarge={setDischargeTarget}
            />
          ))}
        </div>
      )}

      {unregistered.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700">Lesionados sem registro detalhado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unregistered.map((player) => (
              <div
                key={player.id}
                className="bg-white border border-dashed border-rose-300 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">#{player.number} {player.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {player.injury || 'Marcado como lesionado no Plantel'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModal({ injury: null, playerId: player.id, notes: player.injury || '' })}
                  className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Registrar lesão
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
          >
            <span>Histórico de lesões ({history.length})</span>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showHistory && (
            <div className="mt-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {history.map((injury) => {
                const player = playersById[injury.player_id];
                const days = daysBetween(injury.injury_date, injury.discharge_date);
                return (
                  <div key={injury.id} className="py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">#{player.number} {player.name}</p>
                      <p className="text-slate-400 truncate">
                        {injury.injury_type} — {injury.body_part}
                        {injury.body_side ? ` (${injury.body_side.toLowerCase()})` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesão</p>
                      <p className="font-semibold text-slate-700">{formatDate(injury.injury_date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alta</p>
                      <p className="font-semibold text-slate-700">{formatDate(injury.discharge_date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tempo afastado</p>
                      <p className="font-semibold text-slate-700">{days} {days === 1 ? 'dia' : 'dias'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modal && (
        <ModalInjury
          key={modal.injury ? `edit-${modal.injury.id}` : `new-${modal.playerId ?? 'any'}`}
          injury={modal.injury}
          players={players}
          presetPlayerId={modal.playerId}
          presetNotes={modal.notes}
          matches={matches}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDeleteInjury}
        />
      )}

      {dischargeTarget && (
        <DischargeDialog
          injury={dischargeTarget}
          player={playersById[dischargeTarget.player_id]}
          onClose={() => setDischargeTarget(null)}
          onConfirm={handleDischarge}
        />
      )}
    </div>
  );
}