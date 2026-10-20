import React, { useState } from 'react';
import { X, AlertTriangle, Pencil, CalendarClock } from 'lucide-react';
import { POSITIONS, POSITION_GROUPS, getPosition, getPositionLabel, getPositionGroup } from '../constants/positions';
import { NATIONALITY_SUGGESTIONS } from '../constants/nationalities';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Disponível', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  INJURED: { label: 'Lesionado', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  SUSPENDED: { label: 'Suspenso', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

// Converte "MM/AAAA" em um resumo do tempo restante de contrato
function getContractInfo(contractEnd) {
  const match = /^(\d{1,2})\/(\d{4})$/.exec(String(contractEnd || '').trim());
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;

  const now = new Date();
  const monthsLeft = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));

  if (monthsLeft < 0) return { text: 'Contrato vencido', tone: 'text-rose-600' };
  if (monthsLeft === 0) return { text: 'Vence neste mês', tone: 'text-rose-600' };
  if (monthsLeft <= 6) return { text: `Faltam ${monthsLeft} ${monthsLeft === 1 ? 'mês' : 'meses'} (renovação urgente)`, tone: 'text-amber-600' };
  if (monthsLeft < 12) return { text: `Faltam ${monthsLeft} meses`, tone: 'text-slate-500' };

  const years = Math.floor(monthsLeft / 12);
  const rest = monthsLeft % 12;
  const yearsText = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return {
    text: rest > 0 ? `Faltam ${yearsText} e ${rest} ${rest === 1 ? 'mês' : 'meses'}` : `Faltam ${yearsText}`,
    tone: 'text-slate-500',
  };
}

const toFormData = (player) => ({
  name: player.name ?? '',
  number: player.number ?? '',
  position: player.position ?? 'Zagueiro',
  status: player.status ?? 'AVAILABLE',
  age: player.age ?? '',
  injury: player.injury ?? '',
  foot: player.foot ?? 'Destro',
  contract_end: player.contract_end ?? '',
  nationality: player.nationality ?? '',
});

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500';

function InfoItem({ label, children, className = '' }) {
  return (
    <div className={`bg-slate-50 border border-slate-100 rounded-xl p-3 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}

export default function ModalPlayerDetails({ player, players = [], onClose, onUpdate }) {
  const [mode, setMode] = useState('view');
  const [formData, setFormData] = useState(() => toFormData(player));
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!player) return null;

  const badge = STATUS_CONFIG[player.status] || STATUS_CONFIG.AVAILABLE;
  const groupKey = getPositionGroup(player.position);
  const contractInfo = getContractInfo(player.contract_end);

  // Outro atleta que já usa a camisa digitada (o próprio atleta pode manter o número)
  const numberOwner =
    formData.number !== ''
      ? players.find((p) => Number(p.number) === Number(formData.number) && p.id !== player.id)
      : null;

  // Posições antigas e genéricas (ex.: "Meia") continuam selecionáveis até serem trocadas
  const hasLegacyPosition = Boolean(formData.position) && !getPosition(formData.position);

  const startEdit = () => {
    setFormData(toFormData(player));
    setSubmitError('');
    setMode('edit');
  };

  const cancelEdit = () => {
    setSubmitError('');
    setMode('view');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (numberOwner) return;

    setSaving(true);
    try {
      await onUpdate(player.id, formData);
      setMode('view');
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {mode === 'view' ? 'Detalhes do Atleta' : 'Editar Atleta'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {mode === 'view' ? (
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-2xl text-emerald-600">
                  #{player.number}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900">{player.name}</h4>
                  <p className="text-xs font-semibold text-emerald-600">{getPositionLabel(player.position)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                {badge.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Posição">{getPositionLabel(player.position)}</InfoItem>
              <InfoItem label="Setor">{groupKey ? POSITION_GROUPS[groupKey] : '—'}</InfoItem>
              <InfoItem label="Idade">{player.age} anos</InfoItem>
              <InfoItem label="Pé dominante">{player.foot}</InfoItem>
              <InfoItem label="Nacionalidade">{player.nationality || 'Não informada'}</InfoItem>
              <InfoItem label="Número da camisa">#{player.number}</InfoItem>
              <InfoItem label="Fim do contrato" className="col-span-2">{player.contract_end}</InfoItem>
            </div>

            {contractInfo && (
              <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${contractInfo.tone}`}>
                <CalendarClock size={14} />
                <span>{contractInfo.text}</span>
              </div>
            )}

            {player.injury && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                <span>{player.injury}</span>
              </div>
            )}

            <div className="pt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={startEdit}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Pencil size={14} /> Editar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Número / Camisa</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    numberOwner
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {numberOwner && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                <span>
                  A camisa <strong>#{formData.number}</strong> já pertence a{' '}
                  <strong>{numberOwner.name}</strong>. Escolha outro número.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Posição</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className={inputClass}
                >
                  {hasLegacyPosition && (
                    <option value={formData.position}>{formData.position} (genérica)</option>
                  )}
                  {Object.entries(POSITION_GROUPS).map(([groupKeyItem, groupLabel]) => (
                    <optgroup key={groupKeyItem} label={groupLabel}>
                      {POSITIONS.filter((p) => p.group === groupKeyItem).map((p) => (
                        <option key={p.code} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Idade</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status Clínico / Contratual</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={inputClass}
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
                  onChange={(e) => setFormData({ ...formData, foot: e.target.value })}
                  className={inputClass}
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
                  onChange={(e) => setFormData({ ...formData, injury: e.target.value })}
                  placeholder="Ex: Estiramento na coxa (Retorno: 10 dias)"
                  className={inputClass}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nacionalidade</label>
                <input
                  type="text"
                  list="details-nationalities"
                  maxLength={50}
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="Ex: Argentina"
                  className={inputClass}
                />
                <datalist id="details-nationalities">
                  {NATIONALITY_SUGGESTIONS.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fim do Contrato</label>
                <input
                  type="text"
                  required
                  value={formData.contract_end}
                  onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
                  placeholder="Ex: 12/2027"
                  className={inputClass}
                />
              </div>
            </div>

            {submitError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={Boolean(numberOwner) || saving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}