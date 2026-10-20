import React from 'react';

export default function ScheduleTab() {
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let event = null;
    if (day === 2 || day === 9 || day === 16 || day === 23) event = { title: 'Treino Físico', type: 'WORKOUT' };
    if (day === 4 || day === 11 || day === 18 || day === 25) event = { title: 'Jogo Oficial', type: 'MATCH' };
    if (day === 6 || day === 13 || day === 20 || day === 27) event = { title: 'Treino Tático', type: 'TACTICAL' };
    if (day === 8 || day === 15 || day === 22 || day === 29) event = { title: 'Treino Técnico', type: 'TECHNICAL' };
    return { day, event };
  });

  return (
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
  );
}