// Cada número é a quantidade de atletas da linha, da defesa ao ataque.
// O goleiro é sempre a vaga 0 (fora da conta).
export const FORMATIONS = {
  '4-3-3': [4, 3, 3],
  '4-4-2': [4, 4, 2],
  '4-2-3-1': [4, 2, 3, 1],
  '4-5-1': [4, 5, 1],
  '3-5-2': [3, 5, 2],
  '3-4-3': [3, 4, 3],
  '5-3-2': [5, 3, 2],
  '5-4-1': [5, 4, 1],
};

export const MODES = [
  {
    key: 'standard',
    label: 'Padrão',
    formationLabel: 'Formação padrão',
    description: 'Formação base da equipe. É ela que define os 11 titulares.',
  },
  {
    key: 'attack',
    label: 'Ataque',
    formationLabel: 'Formação de ataque',
    description: 'Mantém os mesmos 11 titulares da formação padrão, reposicionados para atacar.',
  },
  {
    key: 'defense',
    label: 'Defesa',
    formationLabel: 'Formação de defesa',
    description: 'Mantém os mesmos 11 titulares da formação padrão, reposicionados para defender.',
  },
];

export const DEFAULT_TACTICS = {
  formations: { standard: '4-3-3', attack: '3-4-3', defense: '5-3-2' },
  activeMode: 'standard',
  roles: {}, // { chaveDaFuncao: idDoAtleta }
};

// Para criar novas funções ou variações, basta acrescentar uma linha aqui.
// exclusiveWith: o mesmo atleta não pode ocupar as duas funções ao mesmo tempo.
export const TEAM_ROLES = [
  { key: 'captain', group: 'Liderança', label: 'Capitão', short: 'C', title: 'Capitão', exclusiveWith: 'vice_captain' },
  { key: 'vice_captain', group: 'Liderança', label: 'Vice-capitão', short: 'VC', title: 'Vice-capitão', exclusiveWith: 'captain' },

  { key: 'free_kick_direct', group: 'Faltas', label: 'Falta direta', short: 'FD', title: 'Cobrador de falta direta' },
  { key: 'free_kick_cross', group: 'Faltas', label: 'Falta lateral (cruzamento)', short: 'FL', title: 'Cobrador de falta lateral (cruzamento)' },

  { key: 'penalty_1', group: 'Pênaltis', label: '1º cobrador', short: 'P1', title: 'Pênalti: 1º cobrador', exclusiveWith: 'penalty_2' },
  { key: 'penalty_2', group: 'Pênaltis', label: '2º cobrador', short: 'P2', title: 'Pênalti: 2º cobrador', exclusiveWith: 'penalty_1' },

  { key: 'corner_right', group: 'Escanteios', label: 'Pela direita', short: 'ED', title: 'Escanteio pela direita' },
  { key: 'corner_left', group: 'Escanteios', label: 'Pela esquerda', short: 'EE', title: 'Escanteio pela esquerda' },
];

// Gera as 11 vagas de uma formação: [{ role, x, y }] em % do campo (ataque no topo)
export function buildFormationSlots(key) {
  const lines = FORMATIONS[key] || FORMATIONS['4-3-3'];
  const totalLines = lines.length;
  const slots = [{ role: 'GOL', x: 50, y: 91 }];

  lines.forEach((count, lineIndex) => {
    const y = totalLines === 1 ? 50 : 76 - lineIndex * (56 / (totalLines - 1));
    const role = lineIndex === 0 ? 'DEF' : lineIndex === totalLines - 1 ? 'ATA' : 'MEI';
    for (let i = 0; i < count; i++) {
      slots.push({ role, x: ((2 * i + 1) / (2 * count)) * 100, y });
    }
  });

  return slots;
}

const popcount = (mask) => {
  let count = 0;
  while (mask) {
    count += mask & 1;
    mask >>= 1;
  }
  return count;
};

// Associa cada atleta de linha da formação de origem a uma vaga da formação de destino,
// minimizando a distância total no campo (quem era lateral direito continua pela direita).
// Retorna: assignment[i] = índice (0 a 9) da vaga de destino do atleta de linha i.
function assignOutfield(fromSlots, toSlots) {
  const from = fromSlots.slice(1);
  const to = toSlots.slice(1);
  const n = from.length;

  const cost = from.map((a) => to.map((b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2));

  const size = 1 << n;
  const best = new Array(size).fill(Infinity);
  const choice = new Array(size).fill(-1);
  best[0] = 0;

  for (let mask = 0; mask < size; mask++) {
    if (best[mask] === Infinity) continue;
    const i = popcount(mask);
    if (i >= n) continue;

    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue;
      const next = mask | (1 << j);
      const value = best[mask] + cost[i][j];
      if (value < best[next]) {
        best[next] = value;
        choice[next] = j;
      }
    }
  }

  const assignment = new Array(n);
  let mask = size - 1;
  for (let i = n - 1; i >= 0; i--) {
    const j = choice[mask];
    assignment[i] = j;
    mask &= ~(1 << j);
  }
  return assignment;
}

// Posição de cada vaga da escalação (a escalação é sempre a da formação padrão)
// quando o campo mostra a formação `targetKey`.
export function getSlotPositions(standardKey, targetKey) {
  const standard = buildFormationSlots(standardKey);
  if (standardKey === targetKey) return standard;

  const target = buildFormationSlots(targetKey);
  const assignment = assignOutfield(standard, target);

  return standard.map((_, slot) => (slot === 0 ? target[0] : target[1 + assignment[slot - 1]]));
}

// Ao trocar a formação padrão, reorganiza os titulares para ficarem perto de onde já estavam
export function remapLineup(lineup, fromKey, toKey) {
  const current = Array.from({ length: 11 }, (_, i) => lineup[i] ?? null);
  if (fromKey === toKey) return current;

  const assignment = assignOutfield(buildFormationSlots(fromKey), buildFormationSlots(toKey));
  const next = [...current];
  assignment.forEach((targetIndex, i) => {
    next[1 + targetIndex] = current[1 + i];
  });
  return next;
}