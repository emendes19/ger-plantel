import React, { useMemo, useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import {
  INJURY_TYPES,
  BODY_PARTS,
  BODY_SIDES,
  MATCH_LOOKBACK_DAYS,
  getTodayKey,
  formatMatchLabel,
} from '../constants/medical';

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500';

const toForm = (injury, presetPlayerId, presetNotes) => ({
  player_id: injury?.player_id ?? presetPlayerId ?? '',
  injury_type: injury?.injury_type ?? '',
  body_part: injury?.body_part ?? '',
  body_side: injury?.body_side ?? '',
  injury_date: injury?.injury_date ?? getTodayKey(),
  match_event_id: injury?.match_event_id ? String(injury.match_event_id) : '',
  expected_return_training: injury?.expected_return_training ?? '',
  expected_return_play: injury?.expected_return_play ?? '',
  discharge_date: injury?.discharge_date ?? '',
  notes: injury?.notes ?? presetNotes ?? '',
});

export default function ModalInjury({
  injury,
  players,
  presetPlayerId,
  presetNotes,
  historical = false,
  matches,
  onClose,
  onSave,
  onDelete,
}) {
  const isEditing = Boolean(injury);
  const lockedPlayer = isEditing || Boolean(presetPlayerId);
  // Lesão anterior (nova) ou registro já encerrado: pede a data da alta
  const showDischarge = historical || Boolean(injury?.discharge_date);

  const [form, setForm] = useState(() => toForm(injury, presetPlayerId, presetNotes));
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (changes) => setForm((prev) => ({ ...prev, ...changes }));
  const today = getTodayKey();
  const lookbackYears = Math.round(MATCH_LOOKBACK_DAYS / 365);

  const selectedPlayer = players.find((p) => p.id === Number(form.player_id));
  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [players]
  );

  // Jogos do calendário (o jogo já vinculado a esta lesão sempre aparece, mesmo se for antigo)
  const matchOptions = useMemo(() => {
    const list = [...matches];
    if (injury?.match && !list.some((m) => m.id === injury.match.id)) list.push(injury.match);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [matches, injury]);

  const handleMatchChange = (value) => {
    const match = matchOptions.find((m) => String(m.id) === value);
    update({
      match_event_id: value,
      ...(match ? { injury_date: match.date } : {}),
    });
  };

  const validate = () => {
    if (!form.player_id) return 'Selecione o atleta.';
    if (!form.injury_type) return 'Informe o tipo da lesão.';
    if (!form.body_part) return 'Informe o local da lesão.';
    if (!form.injury_date) return 'Informe a data da lesão.';
    if (form.injury_date > today) return 'A data da lesão não pode ser futura.';
    if (form.expected_return_training && form.expected_return_training < form.injury_date) {
      return 'O retorno aos treinos não pode ser anterior à data da lesão.';
    }
    if (form.expected_return_play && form.expected_return_play < form.injury_date) {
      return 'A liberação para jogar não pode ser anterior à data da lesão.';
    }
    if (
      form.expected_return_training &&
      form.expected_return_play &&
      form.expected_return_play < form.expected_return_training
    ) {
      return 'A liberação para jogar não pode ser anterior ao retorno aos treinos.';
    }
    if (showDischarge) {
      if (!form.discharge_date) return 'Informe a data da alta.';
      if (form.discharge_date < form.injury_date) return 'A alta não pode ser anterior à data da lesão.';
      if (form.discharge_date > today) return 'A data da alta não pode ser futura.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setSubmitError(problem);
      return;
    }

    const payload = {
      injury_type: form.injury_type,
      body_part: form.body_part,
      body_side: form.body_side || null,
      injury_date: form.injury_date,
      match_event_id: form.match_event_id ? Number(form.match_event_id) : null,
      expected_return_training: form.expected_return_training || null,
      expected_return_play: form.expected_return_play || null,
      notes: form.notes.trim() || null,
    };
    if (!isEditing) payload.player_id = Number(form.player_id);
    if (showDischarge) payload.discharge_date = form.discharge_date;

    setSubmitError('');
    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar a lesão.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remover este registro de lesão? Use isto só para registros feitos por engano; para encerrar o tratamento, use "Dar alta".')) return;
    setSubmitError('');
    setSaving(true);
    try {
      await onDelete(injury.id);
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível remover o registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Editar lesão' : historical ? 'Registrar lesão anterior' : 'Registrar lesão'}
            </h3>
            {historical && !isEditing && (
              <p className="text-xs text-slate-500 mt-0.5">
                Para lesões que já terminaram. O status atual do atleta não é alterado.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Atleta</label>
            {lockedPlayer ? (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
                {selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : 'Atleta não encontrado'}
              </div>
            ) : (
              <select
                required
                value={form.player_id}
                onChange={(e) => update({ player_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecione o atleta</option>
                {sortedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de lesão</label>
              <select
                required
                value={form.injury_type}
                onChange={(e) => update({ injury_type: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecione o tipo</option>
                {form.injury_type && !INJURY_TYPES.includes(form.injury_type) && (
                  <option value={form.injury_type}>{form.injury_type}</option>
                )}
                {INJURY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Local do corpo</label>
              <select
                required
                value={form.body_part}
                onChange={(e) => update({ body_part: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecione o local</option>
                {form.body_part && !BODY_PARTS.includes(form.body_part) && (
                  <option value={form.body_part}>{form.body_part}</option>
                )}
                {BODY_PARTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Lado</label>
              <select
                value={form.body_side}
                onChange={(e) => update({ body_side: e.target.value })}
                className={inputClass}
              >
                <option value="">Não se aplica</option>
                {BODY_SIDES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Data da lesão</label>
              <input
                type="date"
                required
                max={today}
                value={form.injury_date}
                onChange={(e) => update({ injury_date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Jogo em que ocorreu</label>
            <select
              value={form.match_event_id}
              onChange={(e) => handleMatchChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Fora de jogo (treino ou outra situação)</option>
              {matchOptions.map((m) => (
                <option key={m.id} value={m.id}>{formatMatchLabel(m)}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Mostra os jogos cadastrados no calendário nos últimos {lookbackYears} anos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {showDischarge ? 'Retorno aos treinos' : 'Retorno aos treinos (previsão)'}
              </label>
              <input
                type="date"
                min={form.injury_date || undefined}
                value={form.expected_return_training}
                onChange={(e) => update({ expected_return_training: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {showDischarge ? 'Liberação para jogar' : 'Liberação para jogar (previsão)'}
              </label>
              <input
                type="date"
                min={form.expected_return_training || form.injury_date || undefined}
                value={form.expected_return_play}
                onChange={(e) => update({ expected_return_play: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {showDischarge && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Data da alta</label>
              <input
                type="date"
                required
                min={form.injury_date || undefined}
                max={today}
                value={form.discharge_date}
                onChange={(e) => update({ discharge_date: e.target.value })}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observações (opcional)</label>
            <input
              type="text"
              maxLength={255}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Ex: Realizar ressonância na próxima semana"
              className={inputClass}
            />
          </div>

          {submitError && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                title="Remover registro"
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            )}
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
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}