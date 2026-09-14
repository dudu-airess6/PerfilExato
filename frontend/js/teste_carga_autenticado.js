import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 250 },  // Estágio base
    { duration: '30s', target: 750 },  // Estresse intermediário
    { duration: '40s', target: 1500 }, // Pico extremo de 1500 VUs
    { duration: '20s', target: 0 },    // Despressurização
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // Tolera até 1.5s no pico de estresse
    http_req_failed: ['rate<0.05'],    // Aceita no máximo 5% de falhas no limite
  },
};

// 1. O setup roda uma única vez para autenticar e obter o Token
export function setup() {
  const urlLogin = 'http://localhost:5200/api/login';
  const payload = JSON.stringify({
    email: 'ana@gmail.com', // Informe um e-mail válido no banco
    senha: 'aninha123'      // Informe a senha do usuário
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(urlLogin, payload, params);
  const body = JSON.parse(res.body);

  return { token: body.token };
}

// 2. A função principal executa o estresse reutilizando o Token
export default function (data) {
  const urlMatch = 'http://localhost:5200/api/vagas/match';
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(urlMatch, params);

  check(res, {
    'status é 200 (autorizado)': (r) => r.status === 200,
  });

  sleep(1);
}