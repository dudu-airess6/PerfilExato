import http from 'k6/http';
import { check, sleep, fail } from 'k6';

const BASE_URL = 'http://localhost:5200/api';

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp-up
    { duration: '30s', target: 100 }, // Carga sustentada de 100 VUs
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // Expectativa de resposta rápida (<200ms)
    http_req_failed: ['rate<0.01'],   // Menos de 1% de erros
  },
};

export function setup() {
  const payload = JSON.stringify({
    email: 'ana@gmail.com', // Substitua pelo e-mail válido da sua base
    senha: 'aninha123',          // Substitua pela senha correspondente
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/login`, payload, params);

  if (res.status !== 200) {
    fail(`Falha na autenticação (Status ${res.status}): Verifique as credenciais no setup()!`);
  }

  return { token: res.json('token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Payload com CPF válido exigido pelo algoritmo ValidarCPF da API (ex: 11144477735)
  const payloadPerfil = JSON.stringify({
    cpf: '11144477735',
    cep: '49000-000',
    cidade: 'Aracaju',
    estado: 'SE',
    curso: 'Análise e Desenvolvimento de Sistemas',
    formacao: 'Superior Cursando',
    competencias: ['C#', '.NET 9', 'SQL Server', 'k6'],
    comportamentais: ['Trabalho em Equipe', 'Comunicação', 'Resolução de Problemas'],
  });

  const resPerfil = http.post(`${BASE_URL}/perfil/salvar`, payloadPerfil, { headers });

  check(resPerfil, {
    'Perfil salvo com sucesso (200)': (r) => r.status === 200,
  });

  sleep(1);
}