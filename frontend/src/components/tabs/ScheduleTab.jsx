import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import ModalEvent from '../ModalEvent';
import {
  EVENT_TYPES,
  MONTH_NAMES,
  WEEKDAYS,
  toDateKey,
  formatStage,
  getCompetitionLabel,
} from '../../constants/schedule';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/api';

export default function ScheduleTab() {
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState(null); // { dateKey, event }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const monthStart = toDateKey(viewYear, viewMonth, 1);
  const monthEnd = toDateKey(viewYear, viewMonth, daysInMonth);

  const loadEvents = useCallback(async () => {
    try {
      setLoadError('');
      const data = await getEvents(monthStart, monthEnd);
      setEvents(data);
    } catch (err) {
      setLoadError('Não foi possível carregar o calendário. Verifique se o FastAPI está rodando (reinicie-o para criar a tabela de eventos).');
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    setLoading(true);
    loadEvents();
  }, [loadEvents]);

  const monthEvents = useMemo(
    () => events.filter((e) => e.date >= monthStart && e.date <= monthEnd),
    [events, monthStart, monthEnd]
  );

  const eventsByDate = useMemo(
    () => Object.fromEntries(monthEvents.map((e) => [e.date, e])),
    [monthEvents]
  );

  const counts = monthEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const changeMonth = (offset) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleSave = async (payload) => {
    if (modal.event) {
      await updateEvent(modal.event.id, payload);
    } else {
      await createEvent(payload);
    }
    setModal(null);
    await loadEvents();
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    setModal(null);
    await loadEvents();
  };

  const renderChip = (event) => {
    const info = EVENT_TYPES[event.type];

    if (event.type === 'MATCH') {
      const stage = formatStage(event);
      return (
        <div className={`p-1.5 rounded-xl text-[10px] leading-tight ${info.chip}`}>
          <p className="font-bold truncate">x {event.opponent}</p>
          <p className="opacity-90 truncate">{getCompetitionLabel(event)}</p>
          {stage && <p className="opacity-90 truncate">{stage}</p>}
        </div>
      );
    }

    return (
      <div className={`p-1.5 rounded-xl text-[10px] font-bold leading-tight truncate ${info.chip}`}>
        {event.type === 'TRAINING' ? `Treino · ${event.training_type}` : 'Descanso'}
      </div>
    );
  };

  const getTooltip = (event) => {
    if (!event) return undefined;
    if (event.type === 'MATCH') {
      return [
        `Jogo contra ${event.opponent}`,
        event.competition_name,
        getCompetitionLabel(event),
        formatStage(event),
        event.notes,
      ].filter(Boolean).join(' • ');
    }
    if (event.type === 'TRAINING') {
      return [`Treino ${event.training_type}`, event.notes].filter(Boolean).join(' • ');
    }
    return ['Descanso', event.notes].filter(Boolean).join(' • ');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendário de {MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <p className="text-xs text-slate-500">Clique em um dia para marcar treino, descanso ou jogo.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            title="Mês anterior"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            title="Próximo mês"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {Object.entries(EVENT_TYPES).map(([key, info]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className={`w-3 h-3 rounded-full inline-block ${info.dot}`}></span>
            {info.label}
            <span className="text-slate-400 font-medium">({counts[key] || 0})</span>
          </span>
        ))}
        {loading && <Loader2 size={14} className="animate-spin text-emerald-500" />}
      </div>

      {loadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-500" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center font-bold text-xs text-slate-400 py-2">{d}</div>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateKey = toDateKey(viewYear, viewMonth, day);
          const event = eventsByDate[dateKey];
          const isToday = dateKey === todayKey;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setModal({ dateKey, event: event || null })}
              title={getTooltip(event)}
              className={`min-h-[110px] border rounded-2xl p-2.5 flex flex-col justify-between gap-2 text-left transition-all ${
                event ? `${EVENT_TYPES[event.type].cell} shadow-sm` : 'bg-slate-50/50 border-slate-200 hover:border-emerald-300'
              } ${isToday ? 'ring-2 ring-emerald-400' : ''}`}
            >
              <span className={`text-xs font-bold ${event || isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                {day}
                {isToday && <span className="ml-1.5 text-[9px] font-black text-emerald-600">HOJE</span>}
              </span>
              {event && renderChip(event)}
            </button>
          );
        })}
      </div>

      {modal && (
        <ModalEvent
          key={modal.dateKey}
          dateKey={modal.dateKey}
          event={modal.event}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}