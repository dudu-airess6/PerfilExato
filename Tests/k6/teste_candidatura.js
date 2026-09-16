import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp-up
    { duration: '30s', target: 100 }, // Carga de 100 VUs em rotas de escrita
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Meta de resposta abaixo de 500ms
    http_req_failed: ['rate<0.01'],   // Menos de 1% de erros
  },
};

const BASE_URL = 'http://localhost:5200/api';

// Obtém o token JWT uma vez antes de iniciar o teste de carga
export function setup() {
  const payload = JSON.stringify({
    email: 'ana@gmail.com', // Ajuste para um e-mail cadastrado na sua base
    senha: 'aninha123',          // Ajuste para a senha correspondente
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/login`, payload, params);

  if (res.status === 200) {
    return { token: res.json('token') };
  }
  return { token: '' };
}

export default function (data) {
  if (!data.token) return;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Gerador de títulos únicos para evitar a trava jaEstaInscrito no SQL Server
  const vagaTitulo = `Vaga Teste VU-${__VU}-ITER-${__ITER}`;
  const vagaEmpresa = 'Empresa K6 Testes';

  // 1. POST: Grava a candidatura (INSERT)
  const payloadCandidatura = JSON.stringify({
    tituloVaga: vagaTitulo,
    empresa: vagaEmpresa,
  });

  const resCandidatar = http.post(`${BASE_URL}/vagas/candidatar`, payloadCandidatura, { headers });
  check(resCandidatar, {
    'Candidatura criada com sucesso (200)': (r) => r.status === 200,
  });

  // 2. GET: Consulta o ID da candidatura recém-criada
  const resUsuario = http.get(`${BASE_URL}/usuario`, { headers });
  let inscricaoId = null;

  if (resUsuario.status === 200) {
    const inscricoes = resUsuario.json('inscricoes');
    if (inscricoes && inscricoes.length > 0) {
      const item = inscricoes.find((i) => i.tituloVaga === vagaTitulo);
      if (item) inscricaoId = item.id;
    }
  }

  // 3. DELETE: Remove a candidatura para manter a base limpa (DELETE)
  if (inscricaoId) {
    const resCancelar = http.del(`${BASE_URL}/vagas/cancelar/${inscricaoId}`, null, { headers });
    check(resCancelar, {
      'Candidatura removida com sucesso (200)': (r) => r.status === 200,
    });
  }

  sleep(1);
}