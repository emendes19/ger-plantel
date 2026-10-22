import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { POSITIONS, POSITION_GROUPS } from '../constants/positions';
import { NATIONALITY_SUGGESTIONS } from '../constants/nationalities';
import { SUSPENSION_REASON_SUGGESTIONS } from '../constants/medical';

const INITIAL_FORM = {
  name: '',
  number: '',
  position: 'Zagueiro',
  status: 'AVAILABLE',
  age: '',
  suspension_reason: '',
  suspension_games: '',
  foot: 'Destro',
  contract_end: '12/2027',
  nationality: 'Brasil'
};

export default function ModalNewPlayer({ isOpen, onClose, onSubmit, players = [] }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Atleta que já usa a camisa digitada (se houver)
  const numberOwner =
    formData.number !== ''
      ? players.find((p) => Number(p.number) === Number(formData.number))
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (numberOwner) return;

    try {
      await onSubmit(formData);
      setFormData(INITIAL_FORM);
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar o atleta.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Cadastrar Novo Atleta</h3>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cristiano Silva"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
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
                placeholder="Ex: 10"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(POSITION_GROUPS).map(([groupKey, groupLabel]) => (
                  <optgroup key={groupKey} label={groupLabel}>
                    {POSITIONS.filter((p) => p.group === groupKey).map((p) => (
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, foot: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Destro">Destro</option>
                <option value="Canhoto">Canhoto</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>
          </div>

          {formData.status === 'INJURED' && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
              <span>
                Os detalhes da lesão (tipo, local, datas e alta) são registrados na aba Departamento Médico.
              </span>
            </div>
          )}

          {formData.status === 'SUSPENDED' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Motivo da suspensão</label>
                <input
                  type="text"
                  list="new-player-suspension-reasons"
                  maxLength={100}
                  value={formData.suspension_reason}
                  onChange={(e) => setFormData({ ...formData, suspension_reason: e.target.value })}
                  placeholder="Ex: Cartão vermelho"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
                <datalist id="new-player-suspension-reasons">
                  {SUSPENSION_REASON_SUGGESTIONS.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Jogos</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.suspension_games}
                  onChange={(e) => setFormData({ ...formData, suspension_games: e.target.value })}
                  placeholder="Ex: 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nacionalidade</label>
              <input
                type="text"
                list="new-player-nationalities"
                maxLength={50}
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Ex: Argentina"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
              <datalist id="new-player-nationalities">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
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
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Boolean(numberOwner)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Atleta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}