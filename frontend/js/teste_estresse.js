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

export function setup() {
  const urlLogin = 'http://localhost:5200/api/login'; // Confirme o endpoint correto de login
  const payload = JSON.stringify({
    email: 'ana@gmail.com', // Substitua pelo e-mail cadastrado no banco
    senha: 'aninha123'             // Substitua pela senha cadastrada
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(urlLogin, payload, params);

  // Valida o retorno do login para evitar a quebra do JSON.parse
  if (res.status !== 200) {
    console.error(`[ERRO NO LOGIN] Status HTTP: ${res.status} | Resposta: ${res.body}`);
    throw new Error(`Não foi possível obter o token JWT. Status: ${res.status}`);
  }

  return { token: JSON.parse(res.body).token };
}

export default function (data) {
  const res = http.get('http://localhost:5200/api/vagas/match', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });

  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(0.3); // Pausa menor para injetar mais volume de requisições por segundo
}