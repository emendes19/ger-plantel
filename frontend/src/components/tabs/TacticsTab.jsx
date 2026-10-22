import React, { useMemo, useState } from 'react';
import { Layout, UserCheck, RefreshCw, Crown, ArrowUp, ArrowDown, Target } from 'lucide-react';
import {
  FORMATIONS, MODES, TEAM_ROLES, POSITION_KINDS, getSlotPositions, remapLineup, shiftPosition, getMoveArrow
} from '../../constants/tactics';
import { SORT_OPTIONS, sortPlayers } from '../../utils/playerSort';

// Altura (em px) da área de jogo. Para aumentar ou diminuir o campo, mude só este número.
const PITCH_HEIGHT = 440;

const MODE_STYLES = {
  standard: 'bg-emerald-400 text-emerald-950',
  attack: 'bg-amber-300 text-amber-950',
  defense: 'bg-sky-300 text-sky-950',
};

const ROLE_GROUPS = [...new Set(TEAM_ROLES.map((role) => role.group))];

const roleBadgeClass = (roleKey) =>
  roleKey === 'captain' ? 'bg-slate-900 text-amber-300' : 'bg-emerald-600 text-white';

// Lado da vaga no campo, visto da perspectiva da equipe
const getSideLabel = (position) => {
  if (position.kind === 'GK') return '';
  if (position.x < 35) return 'esquerdo';
  if (position.x > 65) return 'direito';
  return '';
};

// Seta de movimento: aponta para cima e é girada pelo ângulo calculado
function MoveArrow({ angle, length }) {
  return (
    <svg
      width="16"
      height={length}
      viewBox={`0 0 16 ${length}`}
      style={{ transform: `rotate(${angle}deg)`, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))' }}
      aria-hidden="true"
    >
      <line x1="8" y1={length - 2} x2="8" y2="5" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 10 L8 3 L14 10" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TacticsTab({ players, startingLineup, setStartingLineup, tactics, setTactics }) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [sortDir, setSortDir] = useState('asc');

  const { formations, activeMode, roles } = tactics;
  const currentFormation = formations[activeMode];
  const activeModeInfo = MODES.find((m) => m.key === activeMode);

  // Funções táticas da formação que está no campo: { índiceDaPosição: chaveDaFunção }
  const currentPositionRoles = tactics.positionRoles?.[currentFormation] || {};

  // Exibição das funções no campo (ambas ligadas por padrão)
  const display = { shiftByRole: true, arrows: true, ...(tactics.display || {}) };

  const availablePlayers = useMemo(
    () => sortPlayers(players.filter((p) => p.status === 'AVAILABLE'), sortBy, sortDir),
    [players, sortBy, sortDir]
  );

  // Escalação sempre com 11 vagas (null = vaga vazia). É única: vale para os três modos.
  const lineup = useMemo(
    () => Array.from({ length: 11 }, (_, i) => startingLineup[i] ?? null),
    [startingLineup]
  );

  // Posição base de cada vaga no campo, conforme a formação do modo ativo
  const positions = useMemo(
    () => getSlotPositions(formations.standard, currentFormation),
    [formations.standard, currentFormation]
  );

  const starters = lineup.map((id) => players.find((p) => p.id === id)).filter(Boolean);
  const startersByNumber = [...starters].sort((a, b) => a.number - b.number);
  const starterIds = new Set(starters.map((p) => p.id));

  // Funções da equipe ativas: só valem para quem está entre os titulares
  const rolesByPlayer = {};
  TEAM_ROLES.forEach((role) => {
    const playerId = roles[role.key];
    if (playerId != null && starterIds.has(playerId)) {
      (rolesByPlayer[playerId] = rolesByPlayer[playerId] || []).push(role);
    }
  });

  // Função tática de uma posição do campo (null = função padrão)
  const getPositionRole = (position) =>
    POSITION_KINDS[position.kind].roles.find((r) => r.key === currentPositionRoles[position.index]) || null;

  // Linhas do painel de funções táticas, da defesa para o ataque
  const tacticalRows = lineup
    .map((playerId, slotIndex) => ({
      slotIndex,
      position: positions[slotIndex],
      player: players.find((p) => p.id === playerId),
    }))
    .sort((a, b) => a.position.index - b.position.index);

  const hasPositionRoles = Object.keys(currentPositionRoles).length > 0;

  const toggleDisplay = (key) => {
    setTactics((prev) => {
      const current = { shiftByRole: true, arrows: true, ...(prev.display || {}) };
      return { ...prev, display: { ...current, [key]: !current[key] } };
    });
  };

  const handleModeChange = (modeKey) => {
    setTactics((prev) => ({ ...prev, activeMode: modeKey }));
    setSelectedSlotIndex(null);
  };

  const handleFormationChange = (formationKey) => {
    // Trocar a formação padrão reorganiza os titulares perto de onde já estavam.
    // Ataque e defesa só mudam o posicionamento, nunca os atletas.
    if (activeMode === 'standard') {
      setStartingLineup(remapLineup(lineup, formations.standard, formationKey));
    }
    setTactics((prev) => ({
      ...prev,
      formations: { ...prev.formations, [activeMode]: formationKey },
    }));
    setSelectedSlotIndex(null);
  };

  const assignRole = (roleKey, value) => {
    setTactics((prev) => {
      const nextRoles = { ...prev.roles };
      if (value === '') {
        delete nextRoles[roleKey];
      } else {
        const playerId = Number(value);
        nextRoles[roleKey] = playerId;
        const rival = TEAM_ROLES.find((r) => r.key === roleKey)?.exclusiveWith;
        if (rival && nextRoles[rival] === playerId) delete nextRoles[rival];
      }
      return { ...prev, roles: nextRoles };
    });
  };

  const assignPositionRole = (formationKey, positionIndex, roleKey) => {
    setTactics((prev) => {
      const forFormation = { ...(prev.positionRoles?.[formationKey] || {}) };
      if (roleKey === '') {
        delete forFormation[positionIndex];
      } else {
        forFormation[positionIndex] = roleKey;
      }
      return {
        ...prev,
        positionRoles: { ...prev.positionRoles, [formationKey]: forFormation },
      };
    });
  };

  const resetPositionRoles = (formationKey) => {
    setTactics((prev) => ({
      ...prev,
      positionRoles: { ...prev.positionRoles, [formationKey]: {} },
    }));
  };

  // Coloca um atleta reserva na vaga selecionada
  const swapPlayerInLineup = (newPlayerId) => {
    if (selectedSlotIndex === null) return;
    const updated = [...lineup];
    updated[selectedSlotIndex] = newPlayerId;
    setStartingLineup(updated);
    setSelectedSlotIndex(null);
  };

  // Troca dois titulares de lugar (ou move um titular para uma vaga vazia)
  const swapSlots = (slotA, slotB) => {
    const updated = [...lineup];
    const temp = updated[slotA];
    updated[slotA] = updated[slotB];
    updated[slotB] = temp;
    setStartingLineup(updated);
    setSelectedSlotIndex(null);
  };

  // Titular da lista lateral: troca de lugar com o atleta da vaga selecionada
  const swapStarterIntoSelectedSlot = (playerId) => {
    if (selectedSlotIndex === null) return;
    const currentSlot = lineup.indexOf(playerId);
    if (currentSlot === -1) return;
    swapSlots(selectedSlotIndex, currentSlot);
  };

  const handleSlotClick = (slotIndex) => {
    if (selectedSlotIndex === null) {
      setSelectedSlotIndex(slotIndex);
    } else if (selectedSlotIndex === slotIndex) {
      setSelectedSlotIndex(null);
    } else {
      swapSlots(selectedSlotIndex, slotIndex);
    }
  };

  const renderPitchCard = (slotIndex) => {
    const position = positions[slotIndex];
    const player = players.find((p) => p.id === lineup[slotIndex]);
    const isSelected = selectedSlotIndex === slotIndex;
    const playerRoles = player ? rolesByPlayer[player.id] || [] : [];
    const tacticalRole = getPositionRole(position);
    const nameParts = player ? player.name.split(' ') : [];

    // Posição no campo: ajustada pela função tática, se o botão estiver ligado
    const shown = display.shiftByRole && tacticalRole ? shiftPosition(position, tacticalRole.key) : position;
    const arrow = display.arrows && tacticalRole ? getMoveArrow(position, tacticalRole.key) : null;

    return (
      <div
        key={slotIndex}
        style={{ left: `${shown.x}%`, top: `${shown.y}%` }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 w-[18%] min-w-[74px] max-w-[120px] transition-[left,top] duration-500 ease-in-out ${
          isSelected ? 'z-20' : 'z-10'
        }`}
      >
        {arrow && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${arrow.sx * 50}% + ${arrow.sx * (arrow.length / 2 + 4)}px)`,
              top: `calc(50% + ${arrow.sy * 50}% + ${arrow.sy * (arrow.length / 2 + 4)}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <MoveArrow angle={arrow.angle} length={arrow.length} />
          </div>
        )}

        <div
          onClick={() => handleSlotClick(slotIndex)}
          className={`cursor-pointer transition-all p-1.5 rounded-xl border text-center ${
            isSelected
              ? 'bg-amber-300 text-slate-900 border-amber-400 scale-105 shadow-lg'
              : 'bg-white/95 hover:bg-white text-slate-900 border-emerald-300 shadow-md hover:scale-105'
          }`}
        >
          <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider truncate">
            {player ? `#${player.number} ${player.position}` : position.role}
          </p>
          <p className="text-xs font-bold truncate">
            {player ? `${nameParts[0]} ${nameParts[1] || ''}` : 'Vazio'}
          </p>

          {tacticalRole && (
            <p
              className="text-[9px] font-bold italic text-slate-500 truncate"
              title={`${POSITION_KINDS[position.kind].label}: ${tacticalRole.label}`}
            >
              {tacticalRole.label}
            </p>
          )}

          {playerRoles.length > 0 && (
            <div className="mt-1 flex flex-wrap justify-center gap-0.5">
              {playerRoles.map((role) => (
                <span
                  key={role.key}
                  title={role.title}
                  className={`px-1 rounded text-[9px] font-black leading-4 ${roleBadgeClass(role.key)}`}
                >
                  {role.short}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filledSlots = starters.length;
  const selectedPlayer =
    selectedSlotIndex !== null ? players.find((p) => p.id === lineup[selectedSlotIndex]) : null;

  const toggleClass = (active) =>
    `px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
      active ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-800/80 hover:bg-emerald-700'
    }`;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prancheta Tática</h2>
          <p className="text-xs text-slate-500">Escalação dos 11 titulares. Qualquer atleta pode jogar em qualquer posição: clique em uma vaga no campo e depois em outra vaga ou em um atleta da lista para trocar.</p>
        </div>
        {selectedSlotIndex !== null && (
          <div className="bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 animate-pulse shrink-0">
            Escolha outra vaga no campo ou um atleta da lista para trocar {selectedPlayer ? selectedPlayer.name.split(' ')[0] : 'a vaga selecionada'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* self-start: o conteúdo não estica para acompanhar a altura da coluna da direita */}
        <div className="lg:col-span-2 self-start space-y-6">
          <div className="bg-emerald-800 rounded-3xl p-4 border-4 border-emerald-700 shadow-xl text-white flex flex-col">
            <div className="bg-emerald-900/80 backdrop-blur-md p-3 rounded-2xl border border-emerald-600/50 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-sm flex items-center gap-2">
                  <Layout size={18} className="text-emerald-300" /> Esquema Tático:
                </span>
                <div className="flex gap-2">
                  {MODES.map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => handleModeChange(mode.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeMode === mode.key ? MODE_STYLES[mode.key] : 'bg-emerald-800/80 hover:bg-emerald-700'
                      }`}
                    >
                      {mode.label} <span className="opacity-70 font-semibold">· {formations[mode.key]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  {activeModeInfo.formationLabel}:
                </span>
                {Object.keys(FORMATIONS).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFormationChange(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentFormation === f ? MODE_STYLES[activeMode] : 'bg-emerald-800/80 hover:bg-emerald-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  Funções no campo:
                </span>
                <button
                  type="button"
                  onClick={() => toggleDisplay('shiftByRole')}
                  aria-pressed={display.shiftByRole}
                  className={toggleClass(display.shiftByRole)}
                >
                  Posição pela função
                </button>
                <button
                  type="button"
                  onClick={() => toggleDisplay('arrows')}
                  aria-pressed={display.arrows}
                  className={toggleClass(display.arrows)}
                >
                  Setas de movimento
                </button>
              </div>

              <p className="text-[11px] text-emerald-200/80">{activeModeInfo.description}</p>
            </div>

            {/* Área de jogo: marcações do campo + vagas dos atletas */}
            <div className="relative my-3" style={{ minHeight: PITCH_HEIGHT }}>
              <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/40 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-500/40 rounded-full pointer-events-none"></div>

              <div className="absolute inset-x-2 inset-y-3">
                {lineup.map((_, slotIndex) => renderPitchCard(slotIndex))}
              </div>
            </div>

            <div className="text-center text-xs text-emerald-200 bg-emerald-900/60 p-2 rounded-xl">
              {filledSlots === 11 ? '✔ 11 atletas titulares escalados' : `⚠ ${filledSlots} de 11 titulares escalados`}
              {' '}• {activeModeInfo.label} {currentFormation}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Target className="text-emerald-500" size={20} /> Funções Táticas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activeModeInfo.label} {currentFormation}: escolha a função de cada posição. A função fica na vaga do campo, então quem assumir a vaga assume a função, e cada formação guarda as suas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetPositionRoles(currentFormation)}
                disabled={!hasPositionRoles}
                className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Limpar funções
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {tacticalRows.map(({ slotIndex, position, player }) => {
                const kind = POSITION_KINDS[position.kind];
                const side = getSideLabel(position);
                const activeRole = getPositionRole(position);

                return (
                  <div key={slotIndex} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {player ? `#${player.number} ${player.name}` : 'Vaga vazia'}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 shrink-0">
                        {kind.label}{side ? ` · ${side}` : ''}
                      </span>
                    </div>
                    <select
                      value={activeRole?.key ?? ''}
                      onChange={(e) => assignPositionRole(currentFormation, position.index, e.target.value)}
                      aria-label={`Função tática: ${kind.label}${side ? ` ${side}` : ''}`}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Função padrão</option>
                      {kind.roles.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 self-start">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
              <Crown className="text-amber-500" size={20} /> Funções da Equipe
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Escolha o responsável entre os titulares. Um atleta pode acumular funções; se ele sair da escalação, a função fica vazia.
            </p>

            <div className="space-y-4">
              {ROLE_GROUPS.map((group) => (
                <div key={group}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1.5">{group}</p>
                  <div className="space-y-2">
                    {TEAM_ROLES.filter((role) => role.group === group).map((role) => (
                      <div key={role.key} className="flex items-center justify-between gap-3">
                        <label htmlFor={`role-${role.key}`} className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 min-w-0">
                          <span className={`px-1 rounded text-[9px] font-black leading-4 shrink-0 ${roleBadgeClass(role.key)}`}>
                            {role.short}
                          </span>
                          <span className="truncate">{role.label}</span>
                        </label>
                        <select
                          id={`role-${role.key}`}
                          value={starterIds.has(roles[role.key]) ? String(roles[role.key]) : ''}
                          onChange={(e) => assignRole(role.key, e.target.value)}
                          className="w-44 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">Sem responsável</option>
                          {startersByNumber.map((p) => (
                            <option key={p.id} value={p.id}>
                              #{p.number} {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <UserCheck className="text-emerald-500" size={20} /> Atletas Disponíveis
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {selectedSlotIndex !== null
                ? "Clique em 'Colocar' (reserva) ou 'Trocar' (titular) no atleta desejado para levá-lo à posição selecionada."
                : "Clique primeiro em um jogador no campo para habilitar a troca."}
            </p>

            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Ordenar por</p>
            <div className="flex gap-2 items-center mb-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar atletas por"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                disabled={sortBy === 'default'}
                title={sortDir === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {sortDir === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {availablePlayers.map((player) => {
                const isAlreadyStarting = lineup.includes(player.id);
                const isInSelectedSlot = selectedSlotIndex !== null && lineup[selectedSlotIndex] === player.id;

                return (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 border rounded-xl transition-all ${
                      isAlreadyStarting ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${isAlreadyStarting ? 'opacity-60' : ''}`}>
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        #{player.number}
                      </span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">{player.name}</h5>
                        <p className="text-[10px] text-slate-400">{player.position} {isAlreadyStarting && '• (Titular)'}</p>
                      </div>
                    </div>

                    {selectedSlotIndex !== null && !isInSelectedSlot && (
                      isAlreadyStarting ? (
                        <button
                          onClick={() => swapStarterIntoSelectedSlot(player.id)}
                          className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <RefreshCw size={12} /> Trocar
                        </button>
                      ) : (
                        <button
                          onClick={() => swapPlayerInLineup(player.id)}
                          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <RefreshCw size={12} /> Colocar
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}