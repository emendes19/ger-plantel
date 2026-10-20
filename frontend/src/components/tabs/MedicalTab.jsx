import React from 'react';
import { Activity } from 'lucide-react';

export default function MedicalTab({ players }) {
  const injuredOrSuspended = players.filter(p => p.status !== 'AVAILABLE');

  return (
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
        {injuredOrSuspended.map((player) => (
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
  );
}