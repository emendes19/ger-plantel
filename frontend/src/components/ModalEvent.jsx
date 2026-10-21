import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import {
  EVENT_TYPES,
  TRAINING_TYPES,
  COMPETITION_FORMATS,
  COMPETITION_SCOPES,
  CUP_STAGES,
  COMPETITION_NAME_SUGGESTIONS,
  formatLongDate,
} from '../constants/schedule';

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500';

const toForm = (event) => ({
  type: event?.type ?? 'TRAINING',
  training_type: event?.training_type ?? TRAINING_TYPES[0],
  competition_format: event?.competition_format ?? 'LEAGUE',
  competition_scope: event?.competition_scope ?? 'NATIONAL',
  competition_name: event?.competition_name ?? '',
  opponent: event?.opponent ?? '',
  stage: event?.stage ?? '',
  notes: event?.notes ?? '',
});

const buildPayload = (dateKey, form) => {
  const payload = {
    date: dateKey,
    type: form.type,
    training_type: null,
    competition_format: null,
    competition_scope: null,
    competition_name: null,
    opponent: null,
    stage: null,
    notes: form.notes.trim() || null,
  };

  if (form.type === 'TRAINING') {
    payload.training_type = form.training_type;
  }

  if (form.type === 'MATCH') {
    payload.opponent = form.opponent.trim();
    payload.competition_format = form.competition_format;
    payload.competition_name = form.competition_name.trim() || null;

    if (form.competition_format !== 'FRIENDLY') {
      payload.competition_scope = form.competition_scope;
      payload.stage = String(form.stage).trim();
    }
  }

  return payload;
};

export default function ModalEvent({ dateKey, event, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(() => toForm(event));
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(event);
  const update = (changes) => setForm((prev) => ({ ...prev, ...changes }));

  // Tipos de treino fora da lista (cadastrados antes) continuam selecionáveis
  const hasCustomTraining = form.training_type && !TRAINING_TYPES.includes(form.training_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSaving(true);
    try {
      await onSave(buildPayload(dateKey, form));
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar o evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remover este evento do calendário?')) return;
    setSubmitError('');
    setSaving(true);
    try {
      await onDelete(event.id);
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível remover o evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Editar evento' : 'Novo evento'}</h3>
            <p className="text-xs text-slate-500">{formatLongDate(dateKey)}</p>
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
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo do dia</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ type: key })}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    form.type === key ? info.active : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {form.type === 'TRAINING' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de treino</label>
              <select
                value={form.training_type}
                onChange={(e) => update({ training_type: e.target.value })}
                className={inputClass}
              >
                {hasCustomTraining && <option value={form.training_type}>{form.training_type}</option>}
                {TRAINING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {form.type === 'MATCH' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Adversário</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.opponent}
                  onChange={(e) => update({ opponent: e.target.value })}
                  placeholder="Ex: Flamengo"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de competição</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(COMPETITION_FORMATS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        form.competition_format !== key && update({ competition_format: key, stage: '' })
                      }
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        form.competition_format === key
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.competition_format !== 'FRIENDLY' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Abrangência</label>
                    <select
                      value={form.competition_scope}
                      onChange={(e) => update({ competition_scope: e.target.value })}
                      className={inputClass}
                    >
                      {Object.entries(COMPETITION_SCOPES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {form.competition_format === 'LEAGUE' ? (
                      <>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Rodada</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={form.stage}
                          onChange={(e) => update({ stage: e.target.value })}
                          placeholder="Ex: 12"
                          className={inputClass}
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Fase</label>
                        <select
                          required
                          value={form.stage}
                          onChange={(e) => update({ stage: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">Selecione a fase</option>
                          {CUP_STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {form.stage && !CUP_STAGES.includes(form.stage) && (
                            <option value={form.stage}>{form.stage}</option>
                          )}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Competição (opcional)</label>
                <input
                  type="text"
                  list="event-competition-names"
                  maxLength={100}
                  value={form.competition_name}
                  onChange={(e) => update({ competition_name: e.target.value })}
                  placeholder="Ex: Copa do Brasil"
                  className={inputClass}
                />
                <datalist id="event-competition-names">
                  {COMPETITION_NAME_SUGGESTIONS.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observações (opcional)</label>
            <input
              type="text"
              maxLength={255}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Ex: Concentração às 18h"
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
                title="Remover evento"
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