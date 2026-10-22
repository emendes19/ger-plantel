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
  roles: {}, // funções da equipe: { chaveDaFuncao: idDoAtleta }
  positionRoles: {}, // funções táticas: { formação: { índiceDaPosição: chaveDaFunção } }
  display: { shiftByRole: true, arrows: true }, // exibição das funções táticas no campo
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

// Tipos de posição no campo e as funções táticas que cada um aceita.
// O tipo de cada vaga é calculado pela formação (veja getSlotKind).
export const POSITION_KINDS = {
  GK: {
    label: 'Goleiro',
    roles: [
      { key: 'gk_traditional', label: 'Goleiro tradicional' },
      { key: 'sweeper_keeper', label: 'Goleiro-líbero' },
    ],
  },
  CB: {
    label: 'Zagueiro',
    roles: [
      { key: 'cb_stopper', label: 'Zagueiro de marcação' },
      { key: 'cb_cover', label: 'Zagueiro de cobertura' },
      { key: 'cb_ball_playing', label: 'Zagueiro construtor' },
      { key: 'libero', label: 'Líbero' },
    ],
  },
  FB: {
    label: 'Lateral',
    roles: [
      { key: 'fb_defensive', label: 'Lateral defensivo' },
      { key: 'fb_support', label: 'Lateral apoiador' },
      { key: 'fb_attacking', label: 'Lateral ofensivo' },
      { key: 'fb_inverted', label: 'Lateral invertido' },
    ],
  },
  WB: {
    label: 'Ala',
    roles: [
      { key: 'wb_defensive', label: 'Ala defensivo' },
      { key: 'wb_support', label: 'Ala apoiador' },
      { key: 'wb_attacking', label: 'Ala ofensivo' },
    ],
  },
  DM: {
    label: 'Volante',
    roles: [
      { key: 'dm_anchor', label: 'Volante âncora' },
      { key: 'dm_tackler', label: 'Volante de desarme' },
      { key: 'dm_regista', label: 'Regista' },
      { key: 'dm_box_to_box', label: 'Volante box-to-box' },
    ],
  },
  CM: {
    label: 'Meia',
    roles: [
      { key: 'cm_box_to_box', label: 'Meia box-to-box' },
      { key: 'cm_playmaker', label: 'Meia armador' },
      { key: 'cm_balanced', label: 'Meia de equilíbrio' },
      { key: 'cm_late_runner', label: 'Meia infiltrador' },
      { key: 'cm_defensive', label: 'Meia de marcação' },
    ],
  },
  AM: {
    label: 'Meia atacante',
    roles: [
      { key: 'am_playmaker', label: 'Armador (camisa 10)' },
      { key: 'am_shadow_striker', label: 'Meia infiltrado (sombra)' },
      { key: 'am_advanced', label: 'Meia atacante equilibrado' },
      { key: 'am_trequartista', label: 'Trequartista (meia livre)' },
    ],
  },
  WM: {
    label: 'Meia aberto',
    roles: [
      { key: 'wm_wide', label: 'Meia aberto' },
      { key: 'wm_attacking', label: 'Meia aberto ofensivo' },
      { key: 'wm_defensive', label: 'Meia aberto defensivo' },
      { key: 'wm_inside', label: 'Meia interior' },
    ],
  },
  W: {
    label: 'Ponta',
    roles: [
      { key: 'w_winger', label: 'Ponta de lado (extremo)' },
      { key: 'w_inverted', label: 'Ponta invertido' },
      { key: 'w_inside_forward', label: 'Ponta infiltrado' },
      { key: 'w_tracking', label: 'Ponta de recomposição' },
    ],
  },
  ST: {
    label: 'Atacante',
    roles: [
      { key: 'st_target_man', label: 'Centroavante pivô' },
      { key: 'st_false_nine', label: 'Falso 9' },
      { key: 'st_poacher', label: 'Atacante de área' },
      { key: 'st_mobile', label: 'Atacante móvel' },
      { key: 'st_second', label: 'Segundo atacante' },
    ],
  },
};

// Movimento de cada função tática em relação à posição base da vaga:
//   forward: positivo = avança em direção ao gol adversário, negativo = recua
//   inward:  positivo = vai para dentro (em direção ao centro do campo), negativo = abre para a lateral
// Os valores são unidades; cada unidade desloca a posição (veja SHIFT_Y e SHIFT_X).
// Para mudar o comportamento de uma função, edite os números ou inverta o sinal.
export const ROLE_MOVEMENT = {
  // Goleiro
  gk_traditional: { forward: 0, inward: 0 },
  sweeper_keeper: { forward: 1, inward: 0 },
  // Zagueiro
  cb_stopper: { forward: 1, inward: 0 },
  cb_cover: { forward: -1, inward: 0 },
  cb_ball_playing: { forward: 0.6, inward: 0 },
  libero: { forward: -1.5, inward: 0 },
  // Lateral
  fb_defensive: { forward: -0.8, inward: 0 },
  fb_support: { forward: 0.6, inward: 0 },
  fb_attacking: { forward: 1.8, inward: 0 },
  fb_inverted: { forward: 0.6, inward: 1.2 },
  // Ala
  wb_defensive: { forward: -0.8, inward: 0 },
  wb_support: { forward: 0.6, inward: 0 },
  wb_attacking: { forward: 1.8, inward: 0 },
  // Volante
  dm_anchor: { forward: -0.8, inward: 0 },
  dm_tackler: { forward: 0.6, inward: 0 },
  dm_regista: { forward: -0.5, inward: 0 },
  dm_box_to_box: { forward: 1.2, inward: 0 },
  // Meia
  cm_box_to_box: { forward: 1.6, inward: 0 },
  cm_playmaker: { forward: 0.6, inward: 0 },
  cm_balanced: { forward: 0, inward: 0 },
  cm_late_runner: { forward: 1.8, inward: 0 },
  cm_defensive: { forward: -1, inward: 0 },
  // Meia atacante
  am_playmaker: { forward: -0.5, inward: 0 },
  am_shadow_striker: { forward: 1.6, inward: 0 },
  am_advanced: { forward: 0.6, inward: 0 },
  am_trequartista: { forward: 0.5, inward: 0 },
  // Meia aberto
  wm_wide: { forward: 0, inward: 0 },
  wm_attacking: { forward: 1.2, inward: 0 },
  wm_defensive: { forward: -1, inward: 0 },
  wm_inside: { forward: 0.3, inward: 1.5 },
  // Ponta
  w_winger: { forward: 0.6, inward: -0.5 },
  w_inverted: { forward: 0.3, inward: 1.5 },
  w_inside_forward: { forward: 1, inward: 1.5 },
  w_tracking: { forward: -1.2, inward: 0 },
  // Atacante
  st_target_man: { forward: 0, inward: 0 },
  st_false_nine: { forward: -1.8, inward: 0 },
  st_poacher: { forward: 1, inward: 0 },
  st_mobile: { forward: 0.8, inward: 0 },
  st_second: { forward: -1, inward: 0 },
};

// Quanto cada unidade de movimento desloca a posição no campo (em pontos percentuais)
const SHIFT_Y = 6;
const SHIFT_X = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getRoleMovement = (roleKey) => ROLE_MOVEMENT[roleKey] || { forward: 0, inward: 0 };

// Lado da vaga: +1 = lado esquerdo ("para dentro" vai para a direita), -1 = lado direito, 0 = centro
const getSideSign = (x) => (x < 40 ? 1 : x > 60 ? -1 : 0);

// Posição ajustada pela função tática, sem sair do campo
export function shiftPosition(position, roleKey) {
  const { forward, inward } = getRoleMovement(roleKey);
  return {
    x: clamp(position.x + getSideSign(position.x) * inward * SHIFT_X, 8, 92),
    y: clamp(position.y - forward * SHIFT_Y, 6, 95),
  };
}

// Dados da seta de movimento (null quando a função não tem movimento relevante).
// angle: graus no sentido horário a partir de "para cima"; sx e sy: direção unitária na tela.
export function getMoveArrow(position, roleKey) {
  const { forward, inward } = getRoleMovement(roleKey);
  const lateral = getSideSign(position.x) * inward;
  const magnitude = Math.hypot(lateral, forward);
  if (magnitude < 0.4) return null;

  return {
    angle: (Math.atan2(lateral, forward) * 180) / Math.PI,
    length: Math.round(Math.min(34, 16 + magnitude * 9)),
    sx: lateral / magnitude,
    sy: -forward / magnitude,
  };
}

// Descobre o tipo da vaga pela estrutura da formação.
// lines = linhas da formação (ex.: [4, 3, 3]), lineIndex = linha da vaga, i = posição na linha (da esquerda para a direita)
function getSlotKind(lines, lineIndex, i) {
  const totalLines = lines.length;
  const count = lines[lineIndex];
  const isOuter = count >= 4 && (i === 0 || i === count - 1);

  // Defesa: laterais nas pontas das linhas de 4 e alas nas de 5
  if (lineIndex === 0) {
    if (isOuter) return count >= 5 ? 'WB' : 'FB';
    return 'CB';
  }

  // Ataque: pontas nos trios, atacantes nos demais casos
  if (lineIndex === totalLines - 1) {
    if (count === 3 && (i === 0 || i === 2)) return 'W';
    return 'ST';
  }

  // Meio-campo com duas linhas (ex.: 4-2-3-1): volantes, depois pontas e meia atacante
  if (totalLines - 2 === 2) {
    if (lineIndex === 1) return 'DM';
    return count >= 3 && (i === 0 || i === count - 1) ? 'W' : 'AM';
  }

  // Meio-campo com uma linha: alas ou meias abertos nas pontas, volante no centro das linhas ímpares
  if (isOuter) return lines[0] === 3 ? 'WB' : 'WM';
  if (count % 2 === 1 && i === Math.floor(count / 2)) return 'DM';
  return 'CM';
}

// Gera as 11 vagas de uma formação: [{ index, role, kind, x, y }] em % do campo (ataque no topo)
export function buildFormationSlots(key) {
  const lines = FORMATIONS[key] || FORMATIONS['4-3-3'];
  const totalLines = lines.length;
  const slots = [{ index: 0, role: 'GOL', kind: 'GK', x: 50, y: 91 }];

  lines.forEach((count, lineIndex) => {
    const y = totalLines === 1 ? 50 : 76 - lineIndex * (56 / (totalLines - 1));
    const role = lineIndex === 0 ? 'DEF' : lineIndex === totalLines - 1 ? 'ATA' : 'MEI';
    for (let i = 0; i < count; i++) {
      slots.push({
        index: slots.length,
        role,
        kind: getSlotKind(lines, lineIndex, i),
        x: ((2 * i + 1) / (2 * count)) * 100,
        y,
      });
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