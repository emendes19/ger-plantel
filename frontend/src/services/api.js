const API_URL = 'http://localhost:8000';

// Extrai uma mensagem legível do erro da API:
// - 409 / 404: detail é texto
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