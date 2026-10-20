export const POSITION_GROUPS = {
  GOLEIRO: 'Goleiros',
  DEFESA: 'Defesa',
  MEIO: 'Meio-campo',
  ATAQUE: 'Ataque',
};

export const POSITIONS = [
  { code: 'GK',  label: 'Goleiro',           group: 'GOLEIRO' },

  { code: 'ZAG', label: 'Zagueiro',          group: 'DEFESA' },
  { code: 'LD',  label: 'Lateral Direito',   group: 'DEFESA' },
  { code: 'LE',  label: 'Lateral Esquerdo',  group: 'DEFESA' },

  { code: 'VOL', label: 'Volante',           group: 'MEIO' },
  { code: 'MC',  label: 'Meia Central',      group: 'MEIO' },
  { code: 'MD',  label: 'Meia Direita',      group: 'MEIO' },
  { code: 'ME',  label: 'Meia Esquerda',     group: 'MEIO' },
  { code: 'MEI', label: 'Meia Atacante',     group: 'MEIO' },

  { code: 'PD',  label: 'Ponta Direita',     group: 'ATAQUE' },
  { code: 'PE',  label: 'Ponta Esquerda',    group: 'ATAQUE' },
  { code: 'SA',  label: 'Segundo Atacante',  group: 'ATAQUE' },
  { code: 'CA',  label: 'Centroavante',      group: 'ATAQUE' },
];

// Valores genéricos que já existem no banco (cadastrados antes desta mudança)
const LEGACY_GROUPS = {
  meia: 'MEIO',
  atacante: 'ATAQUE',
};

const GROUP_ORDER = Object.keys(POSITION_GROUPS);

export function getPosition(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  return (
    POSITIONS.find(
      (p) => p.code.toLowerCase() === v || p.label.toLowerCase() === v
    ) || null
  );
}

export function getPositionLabel(value) {
  return getPosition(value)?.label || value || 'Sem posição';
}

export function getPositionGroup(value) {
  const found = getPosition(value);
  if (found) return found.group;
  return LEGACY_GROUPS[String(value || '').trim().toLowerCase()] || null;
}

// Ordem para ordenação: goleiros -> defesa -> meio -> ataque (posições genéricas ficam no fim do setor)
export function getPositionOrder(value) {
  const found = getPosition(value);
  const group = getPositionGroup(value);
  const groupIndex = group ? GROUP_ORDER.indexOf(group) : GROUP_ORDER.length;
  const positionIndex = found ? POSITIONS.indexOf(found) : 99;
  return groupIndex * 100 + positionIndex;
}