import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuração do comportamento do teste
export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Ramp-up: Sobe para 10 usuários virtuais em 10s
    { duration: '30s', target: 50 },  // Carga: Mantém 50 usuários simultâneos por 30s
    { duration: '10s', target: 0 },   // Ramp-down: Reduz gradualmente para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Meta: 95% das requisições devem responder em menos de 500ms
    http_req_failed: ['rate<0.01'],   // Meta: Menos de 1% de falhas
  },
};

export default function () {
  // Altere a URL para a porta onde sua API .NET está rodando
  const res = http.get('http://localhost:5200/api/vagas/match');

  check(res, {
    'status é 401 (sem token)': (r) => r.status === 401,
  });

  sleep(1); // Simula uma pausa de 1 segundo entre requisições
}