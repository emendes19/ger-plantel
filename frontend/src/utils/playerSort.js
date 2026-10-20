import { getPositionOrder } from '../constants/positions';

export const SORT_OPTIONS = [
  { key: 'default', label: 'Ordem de cadastro' },
  { key: 'number', label: 'Número da camisa' },
  { key: 'name', label: 'Nome' },
  { key: 'age', label: 'Idade' },
  { key: 'position', label: 'Posição' },
  { key: 'nationality', label: 'Nacionalidade' },
  { key: 'contract', label: 'Fim do contrato' },
  { key: 'status', label: 'Status' },
];

const STATUS_ORDER = { AVAILABLE: 0, INJURED: 1, SUSPENDED: 2 };

// "MM/AAAA" -> número comparável (ano * 12 + mês); inválido -> null
function parseContract(value) {
  const match = /^(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim());
  if (!match) return null;
  return Number(match[2]) * 12 + Number(match[1]);
}

function getSortValue(player, key) {
  switch (key) {
    case 'number': return Number(player.number);
    case 'name': return player.name || '';
    case 'age': return Number(player.age);
    case 'position': return getPositionOrder(player.position);
    case 'nationality': return player.nationality?.trim() || null;
    case 'contract': return parseContract(player.contract_end);
    case 'status': return STATUS_ORDER[player.status] ?? 99;
    default: return null;
  }
}

const isMissing = (v) => v === null || v === undefined || v === '' || Number.isNaN(v);

const compareValues = (a, b) => {
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b), 'pt-BR');
  }
  return a - b;
};

// Retorna uma nova lista ordenada (ou a própria lista, se for "Ordem de cadastro")
export function sortPlayers(players, sortBy, sortDir = 'asc') {
  if (sortBy === 'default') return players;
  const dir = sortDir === 'asc' ? 1 : -1;

  return [...players].sort((a, b) => {
    const va = getSortValue(a, sortBy);
    const vb = getSortValue(b, sortBy);

    // Valores vazios ficam sempre no fim, nas duas direções
    if (isMissing(va) && isMissing(vb)) return Number(a.number) - Number(b.number);
    if (isMissing(va)) return 1;
    if (isMissing(vb)) return -1;

    const result = compareValues(va, vb) * dir;
    if (result !== 0) return result;
    return Number(a.number) - Number(b.number); // desempate pela camisa
  });
}