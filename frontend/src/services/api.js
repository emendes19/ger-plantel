const API_URL = 'http://localhost:8000';

// Extrai uma mensagem legível do erro da API:
// - 409 / 404 / 422 das regras do calendário: detail é texto
// - 422 (validação do Pydantic): detail é uma lista de erros
const extractErrorMessage = async (res, fallback) => {
  try {
    const data = await res.json();

    if (typeof data.detail === 'string') return data.detail;

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0];
      const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : null;
      return field ? `Campo "${field}" inválido: ${first.msg}` : first.msg;
    }
  } catch {
    // resposta sem JSON: usa a mensagem padrão
  }
  return fallback;
};

export const getPlayers = async () => {
  const res = await fetch(`${API_URL}/players`);
  if (!res.ok) throw new Error('Erro ao buscar atletas');
  return res.json();
};

export const createPlayer = async (playerData) => {
  const res = await fetch(`${API_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playerData)
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao cadastrar atleta'));
  return res.json();
};

export const updatePlayer = async (id, playerData) => {
  const res = await fetch(`${API_URL}/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playerData)
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao atualizar atleta'));
  return res.json();
};

export const deletePlayer = async (id) => {
  const res = await fetch(`${API_URL}/players/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao excluir atleta'));
  return res.json();
};

// start e end no formato AAAA-MM-DD
export const getEvents = async (start, end) => {
  const res = await fetch(`${API_URL}/events?start=${start}&end=${end}`);
  if (!res.ok) throw new Error('Erro ao buscar eventos do calendário');
  return res.json();
};

export const createEvent = async (eventData) => {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao salvar evento'));
  return res.json();
};

export const updateEvent = async (id, eventData) => {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao atualizar evento'));
  return res.json();
};

export const deleteEvent = async (id) => {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Erro ao remover evento'));
  return res.json();
};