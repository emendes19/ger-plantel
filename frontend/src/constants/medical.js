import { toDateKey, formatStage, getCompetitionLabel } from './schedule';

export const INJURY_TYPES = [
  'Muscular',
  'Ligamentar',
  'Tendínea',
  'Articular',
  'Óssea (fratura)',
  'Contusão',
  'Entorse',
  'Pós-operatório',
  'Outra',
];

export const BODY_PARTS = [
  'Cabeça',
  'Pescoço',
  'Ombro',
  'Braço',
  'Mão / Punho',
  'Costas',
  'Abdômen',
  'Quadril',
  'Virilha',
  'Coxa',
  'Joelho',
  'Panturrilha',
  'Tornozelo',
  'Pé',
];

export const BODY_SIDES = ['Direito', 'Esquerdo'];

// Sugestões para o motivo da suspensão (dá para digitar qualquer outro)
export const SUSPENSION_REASON_SUGGESTIONS = [
  'Cartão vermelho',
  'Acúmulo de cartões amarelos',
  'Decisão do tribunal (STJD)',
  'Punição interna',
];

export const INJURY_PHASES = {
  TREATMENT: { label: 'Em tratamento', badge: 'bg-rose-100 text-rose-800' },
  TRAINING: { label: 'Liberado para treinar', badge: 'bg-amber-100 text-amber-800' },
  READY: { label: 'Apto a jogar', badge: 'bg-emerald-100 text-emerald-800' },
};

// Quantos dias para trás os jogos do calendário aparecem ao vincular uma lesão a uma partida
export const MATCH_LOOKBACK_DAYS = 730;

export const getTodayKey = () => {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
};

// "AAAA-MM-DD" -> "DD/MM/AAAA"
export const formatDate = (dateKey) => {
  if (!dateKey) return '—';
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
};

// Dias entre hoje e a data (positivo = futuro, negativo = passado)
export const daysFromToday = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
};

// Dias entre duas datas "AAAA-MM-DD"
export const daysBetween = (startKey, endKey) =>
  Math.round((new Date(endKey) - new Date(startKey)) / 86400000);

export const formatDaysCount = (days) => `${days} ${days === 1 ? 'dia' : 'dias'}`;

export const describeDays = (dateKey) => {
  const days = daysFromToday(dateKey);
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days > 1) return `em ${days} dias`;
  if (days === -1) return 'ontem';
  return `há ${Math.abs(days)} dias`;
};

// Fase de uma lesão ativa, pelas datas previstas
export const getInjuryPhase = (injury) => {
  const today = getTodayKey();
  if (injury.expected_return_play && today >= injury.expected_return_play) return 'READY';
  if (injury.expected_return_training && today >= injury.expected_return_training) return 'TRAINING';
  return 'TREATMENT';
};

// Ex.: "x Flamengo · Liga · Nacional · Rodada 12 (12/10/2026)"
export const formatMatchLabel = (event) => {
  if (!event) return 'Fora de jogo';
  const text = [`x ${event.opponent}`, getCompetitionLabel(event), formatStage(event)]
    .filter(Boolean)
    .join(' · ');
  return `${text} (${formatDate(event.date)})`;
};

// Ex.: "Suspenso: Cartão vermelho • 2 jogos"
export const formatSuspension = (player) => {
  const reason = player.suspension_reason ? `: ${player.suspension_reason}` : '';
  const games = player.suspension_games
    ? ` • ${player.suspension_games} ${player.suspension_games === 1 ? 'jogo' : 'jogos'}`
    : '';
  return `Suspenso${reason}${games}`;
};