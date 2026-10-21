export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const EVENT_TYPES = {
  TRAINING: {
    label: 'Treino',
    dot: 'bg-emerald-500',
    cell: 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400',
    chip: 'bg-emerald-600 text-white',
    active: 'bg-emerald-500 text-white border-emerald-500',
  },
  REST: {
    label: 'Descanso',
    dot: 'bg-sky-500',
    cell: 'bg-sky-50/50 border-sky-200 hover:border-sky-400',
    chip: 'bg-sky-500 text-white',
    active: 'bg-sky-500 text-white border-sky-500',
  },
  MATCH: {
    label: 'Jogo',
    dot: 'bg-amber-500',
    cell: 'bg-amber-50/60 border-amber-200 hover:border-amber-400',
    chip: 'bg-amber-500 text-white',
    active: 'bg-amber-500 text-white border-amber-500',
  },
};

export const TRAINING_TYPES = [
  'Físico',
  'Técnico',
  'Tático',
  'Bola parada',
  'Finalização',
  'Coletivo',
  'Academia',
  'Recuperação',
];

export const COMPETITION_FORMATS = {
  LEAGUE: 'Liga',
  CUP: 'Copa',
  FRIENDLY: 'Amistoso',
};

export const COMPETITION_SCOPES = {
  STATE: 'Estadual',
  NATIONAL: 'Nacional',
  CONTINENTAL: 'Continental',
};

export const CUP_STAGES = [
  'Fase de grupos',
  'Primeira fase',
  'Segunda fase',
  'Terceira fase',
  'Oitavas de final',
  'Quartas de final',
  'Semifinal',
  'Final',
];

// Sugestões para o campo "Competição" (dá para digitar qualquer outra)
export const COMPETITION_NAME_SUGGESTIONS = [
  'Campeonato Brasileiro',
  'Copa do Brasil',
  'Copa Libertadores',
  'Copa Sul-Americana',
  'Campeonato Estadual',
  'Copa do Nordeste',
  'Supercopa do Brasil',
  'Recopa Sul-Americana',
];

const pad = (n) => String(n).padStart(2, '0');

// monthIndex: 0 a 11 -> "AAAA-MM-DD"
export const toDateKey = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

// "AAAA-MM-DD" -> "Quarta-feira, 21 de outubro de 2026"
export const formatLongDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const text = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Liga guarda só o número da rodada; copa guarda o nome da fase
export const formatStage = (event) => {
  if (!event?.stage) return '';
  return event.competition_format === 'LEAGUE' ? `Rodada ${event.stage}` : event.stage;
};

// Ex.: "Liga · Nacional"
export const getCompetitionLabel = (event) =>
  [COMPETITION_FORMATS[event?.competition_format], COMPETITION_SCOPES[event?.competition_scope]]
    .filter(Boolean)
    .join(' · ');