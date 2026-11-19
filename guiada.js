/* Demonstração guiada: 11 capítulos, com a Rubi real respondendo no capítulo 3. */
import { createApiClient } from './api.js?v=3ade90f455';
import { cleanProfile, cleanLeadData } from './demo.js?v=3d63898952';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* armazenamento indisponível */ } }
};

/* ---------- ícones (traço, 24px) ---------- */
const I = {
  arrowR: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowL: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 14h.01M15 14h.01M2 14h2M20 14h2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M15 12h6v4h-6a2 2 0 0 1 0-4z"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 5V5L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 22 12a17 17 0 0 1-3 3.6M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M9 12a13 13 0 0 1 11-9 13 13 0 0 1-9 11l-3 1-1-1z"/><path d="M9 12H5l2-4h5M12 15v4l4-2v-5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[n] || ''}</svg>`;

/* ---------- roteiro ---------- */
const CHAPTERS = [
  { id: 'capa', label: 'Capa', icon: 'sparkles', steps: [
    { t: 'Seu SDR de IA que nunca perde um lead', d: 'Digite o nome do cliente na capa e comece a demonstração.', h: 'Preencha o nome e aperte →', n: 'Abra com o nome do cliente na capa. Pergunte quantos leads chegam por semana e quem responde hoje, principalmente à noite e no fim de semana.' }
  ] },
  { id: 'problema', label: 'O problema', icon: 'alert', steps: [
    { t: 'O lead que espera, esfria', d: 'Cinco leads chegaram fora do horário e ninguém respondeu.', n: 'Mostre a fila. Pergunte: “Quanto tempo, em média, um lead de vocês espera pela primeira resposta?”' },
    { t: 'Quem responde primeiro, vende', d: 'Enquanto a fila espera, o concorrente atende e fecha.', n: 'Reforce que o lead pede orçamento em vários lugares ao mesmo tempo. A velocidade decide.' },
    { t: 'Um SDR. Um CRM. Zero lead esquecido.', d: 'Com a IA, todos os leads recebem resposta em segundos, 24 horas por dia.', n: 'Leia os quatro números com calma. Avise que são ilustrativos e que o resultado depende da operação.' }
  ] },
  { id: 'atende', label: 'A IA atende', icon: 'whatsapp', steps: [
    { t: 'Um lead chega às 02:14', d: 'A conversa nova aparece na caixa de entrada, já com a Rubi atendendo.', n: 'Destaque o horário: madrugada, ninguém do time acordado. A Rubi atende mesmo assim.' },
    { t: 'Resposta em segundos', d: 'Clique na primeira sugestão. A Rubi responde de verdade, ao vivo.', h: 'Clique numa sugestão abaixo da conversa', n: 'Esta parte é real: a resposta vem da Rubi, não de um roteiro. Deixe o cliente sugerir uma mensagem se quiser.' },
    { t: 'Uma pergunta por vez', d: 'A Rubi conduz a conversa e descobre interesse, prazo, orçamento e quem decide.', h: 'Continue respondendo como a cliente', n: 'Pergunte: “Hoje, quem faz essas perguntas de qualificação no time de vocês?”' },
    { t: 'A ficha se preenche sozinha', d: 'Cada resposta vira dado no CRM, com o trecho da conversa como evidência.', n: 'Aponte para a ficha à direita: os campos se preenchem conforme a conversa avança, sem digitação.' },
    { t: 'Do atendimento à reunião', d: 'Qualificado, o lead segue para a agenda ou para a pessoa certa do time.', n: 'Mostre que o próximo passo acontece sozinho: agenda ou encaminhamento para o especialista.' }
  ] },
  { id: 'ficha', label: 'Ficha do cliente', icon: 'users', steps: [
    { t: 'Ficha criada sozinha', d: 'Resumo da IA e próximo passo prontos antes de o time chegar.', n: 'Ninguém digitou nada aqui. Pergunte quanto tempo o time gasta hoje preenchendo CRM.' },
    { t: 'Critérios com evidência', d: 'Cada critério de qualificação vem com o trecho da conversa que comprova.', n: 'Explique que o vendedor confia no score porque vê a frase do cliente que justifica cada nota.' },
    { t: 'Linha do tempo automática', d: 'Tudo registrado: mensagens, score, agendamento e tarefas.', n: 'Mostre as tarefas criadas sozinhas. É aqui que o follow-up deixa de depender da disciplina.' }
  ] },
  { id: 'agenda', label: 'Agenda sozinha', icon: 'calendar', steps: [
    { t: 'A reunião já está na agenda', d: 'A Rubi oferece horários livres e marca direto na agenda do time.', n: 'Destaque “Agendada pela IA”. Pergunte quantas reuniões se perdem hoje no vai e vem de horários.' },
    { t: 'Convite, link e lembretes', d: 'Link do Meet, convite e lembrete no WhatsApp na véspera e duas horas antes.', n: 'Lembretes automáticos derrubam o não comparecimento. Pergunte qual é a taxa de faltas hoje.' }
  ] },
  { id: 'funil', label: 'Funil de oportunidades', icon: 'kanban', steps: [
    { t: 'O funil inteiro numa tela', d: 'Pipeline aberto, previsão ponderada e taxa de ganho em tempo real.', n: 'Apresente as colunas. Pergunte como o gestor acompanha o funil hoje.' },
    { t: 'A oportunidade nasce sozinha', d: 'O lead qualificado vira oportunidade, com valor e origem.', n: 'Aponte o selo “Criado pela IA”. Ninguém precisou cadastrar.' },
    { t: 'E anda sozinha no funil', d: 'Com a reunião marcada, o card vai para a etapa certa.', n: 'O card mudou de coluna porque a reunião foi agendada. Nada manual.' },
    { t: 'A previsão se atualiza', d: 'A previsão ponderada recalcula com a nova etapa.', n: 'Feche o capítulo: o gestor vê o impacto no faturamento previsto no mesmo instante.' }
  ] },
  { id: 'assistente', label: 'Assistente de IA', icon: 'sparkles', steps: [
    { t: 'Um assistente para o time', d: 'Pergunte qualquer coisa sobre leads, reuniões e funil.', n: 'Mostre que o assistente é para o time interno, diferente da Rubi que atende o cliente.' },
    { t: 'Resumo do dia em segundos', d: 'O que entrou, quem está quente e o que precisa de atenção.', n: 'Leia o resumo. Pergunte quanto tempo o gestor gasta montando esse panorama hoje.' },
    { t: 'Executa por você', d: 'Peça em uma frase: ele envia a mensagem e marca a reunião.', n: 'Destaque as ações executadas: consulta, WhatsApp enviado e reunião criada.' }
  ] },
  { id: 'controle', label: 'Você no controle', icon: 'settings', steps: [
    { t: 'Você define quem é a IA', d: 'Nome, função, canais e tom de voz da sua empresa.', n: 'Mostre que tudo é configurável sem programação. Pergunte qual tom combina com a marca.' },
    { t: 'Seus critérios, seus pesos', d: 'Você decide o que pesa na qualificação e a nota de corte.', n: 'Mostre os pesos e a nota de corte 75. Acima dela, a IA agenda; abaixo, nutre.' },
    { t: 'Base de conhecimento', d: 'A IA responde só com o que está aqui: procedimentos, dúvidas e políticas.', n: 'Tranquilize: a IA não inventa preço nem promessa. Ela usa a base aprovada por vocês.' },
    { t: 'Humano assume quando quiser', d: 'Um clique e a conversa é sua. Outro clique e a Rubi volta.', h: 'Clique em “Assumir como humano”', n: 'Clique em assumir e mostre que a IA pausa na hora. Depois retome.' }
  ] },
  { id: 'integracoes', label: 'Integrações', icon: 'plug', steps: [
    { t: 'Conectado ao que você usa', d: 'WhatsApp, Instagram, e-mail, Google Agenda, Meta Ads e API.', n: 'Pergunte quais canais trazem mais leads hoje.' },
    { t: 'Seguro desde o primeiro dia', d: 'Dados isolados por conta, LGPD, funções por equipe e login com MFA.', n: 'Responda dúvidas de segurança aqui. Dados de cada conta ficam separados.' }
  ] },
  { id: 'resultados', label: 'Resultados', icon: 'trend', steps: [
    { t: 'O que muda na operação', d: 'Resposta imediata, atendimento contínuo e mais reuniões.', n: 'Repita os números do início, agora como resultado. Lembre que dependem da operação.' },
    { t: 'SDR humano ou SDR de IA?', d: 'Lado a lado: tempo, disponibilidade, custo, escala e dados.', n: 'Não é contra o time: a IA faz a primeira linha e o time fecha. Pergunte quanto custa um SDR hoje.' }
  ] },
  { id: 'proximos', label: 'Próximos passos', icon: 'rocket', steps: [
    { t: 'No ar em 7 dias', d: 'Diagnóstico, treino da IA, conexão dos canais e go-live.', n: 'Mostre que o cliente participa só do diagnóstico e da aprovação. O resto é com a gente.' },
    { t: 'Um time de SDR inteiro', d: 'Tudo o que está incluso no teste de 7 dias.', n: 'Apresente a oferta com o nome do cliente. Proponha a data do diagnóstico ainda nesta reunião.' },
    { t: 'Seu próximo cliente já está chamando', d: 'Encerramento e próximo passo: diagnóstico.', n: 'Feche com o próximo passo concreto: marcar o diagnóstico. Agradeça.' }
  ] }
];
const TOTAL_STEPS = CHAPTERS.reduce((a, c) => a + c.steps.length, 0);

/* ---------- estado ---------- */
const params = new URLSearchParams(location.search);
const PRESENTER = params.has('apresentadora');
const state = {
  empresa: clip(params.get('empresa') || store.get('rubi-guiada-empresa') || 'Clínica Vitalis', 60) || 'Clínica Vitalis',
  c: 0, s: 0, mounted: -1, dockHidden: false
};
const E = () => esc(state.empresa);

/* ---------- Rubi real ---------- */
const api = createApiClient(document.querySelector('meta[name="rubi-api-base"]')?.content || '');
const FIELDS = [
  { key: 'nome', label: 'Nome' },
  { key: 'interesse', label: 'Procedimento de interesse' },
  { key: 'prazo', label: 'Prazo ou ocasião' },
  { key: 'orcamento', label: 'Faixa de investimento' },
  { key: 'campo_decisor', label: 'Quem decide a compra' },
  { key: 'cidade', label: 'Cidade' }
];
const CRIT = [
  { key: 'orcamento', label: 'Orçamento', w: 30, icon: 'wallet' },
  { key: 'interesse', label: 'Necessidade', w: 25, icon: 'target' },
  { key: 'campo_decisor', label: 'Autoridade', w: 25, icon: 'user' },
  { key: 'prazo', label: 'Prazo', w: 20, icon: 'clock' }
];
const FALLBACK = {
  nome: 'Beatriz Nogueira', interesse: 'Harmonização facial', prazo: 'Dezembro, casamento da irmã',
  orcamento: 'Até R$ 4 mil', campo_decisor: 'Ela mesma', cidade: 'São Paulo', temperatura: 'quente',
  resumo: 'Quer harmonização facial para o casamento da irmã em dezembro. Orçamento de até R$ 4 mil e decide sozinha. Pronta para a avaliação com a Dra. Helena.'
};
const CHIPS = [
  'Oi! Vi o anúncio de vocês no Instagram. Vocês fazem avaliação de harmonização facial?',
  'É para o casamento da minha irmã em dezembro.',
  'Até uns R$ 4 mil.',
  'Decido sozinha, não preciso consultar ninguém.'
];

function perfil() {
  return cleanProfile({
    segmento: 'Saúde e estética',
    empresa: state.empresa,
    briefing: {
      produtos: 'Harmonização facial, bioestimuladores de colágeno, preenchimento com ácido hialurônico, toxina botulínica e tratamentos de pele (peeling, limpeza profunda e laser).',
      publico: 'Mulheres e homens de 25 a 55 anos que querem cuidar da aparência com resultado natural, muitas vezes para uma data especial.',
      funcionamento: 'Tudo começa com uma avaliação gratuita com a Dra. Helena. Ela monta um plano personalizado e as sessões são marcadas conforme o plano.',
      diferenciais: 'Resultado natural, equipe médica, avaliação gratuita e acompanhamento depois de cada procedimento.',
      perguntas: 'Procedimento de interesse\nPrazo ou ocasião\nFaixa de investimento\nQuem decide a compra\nCidade',
      tipoPreco: 'sob_consulta',
      proximoPasso: 'Oferecer a avaliação gratuita com a Dra. Helena e encaminhar para a equipe confirmar o melhor horário.',
      duvidas: 'Dói? O desconforto é mínimo e usamos anestésico. Quanto dura? Depende do procedimento; a Dra. Helena explica na avaliação.',
      objecoes: 'Está caro: o valor é definido na avaliação gratuita, com opções de parcelamento. Medo de ficar artificial: o foco da clínica é resultado natural.'
    },
    campos: FIELDS
  });
}

function newIds() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  return { sessionId: 'rubi-' + uuid, conversationKey: [...bytes].map(n => n.toString(16).padStart(2, '0')).join('') };
}
const chat = { ...newIds(), serverStarted: false, messages: [], lead: {}, busy: false, paused: false, firstMs: null, handoff: null, gen: 0, used: new Set() };

const hasLive = () => CRIT.some(c => chat.lead[c.key]) || Boolean(chat.lead.nome);
const leadData = () => (hasLive() ? { ...chat.lead } : { ...FALLBACK });
const firstName = L => clip(L.nome || 'Novo contato', 60).split(' ')[0];
const initials = name => clip(name, 60).split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
function score(L) {
  const pts = CRIT.reduce((a, c) => a + (L[c.key] ? c.w : 0), 0);
  if (!pts) return 0;
  return Math.min(98, Math.round(pts * 0.84 + ({ quente: 8, morno: 4 }[L.temperatura] || 0)));
}
const TEMP = { frio: 'Frio', morno: 'Morno', quente: 'Quente' };
const firstSecs = () => (chat.firstMs == null ? null : Math.max(1, Math.round(chat.firstMs / 1000)));

function pushMsg(m) { chat.messages.push({ at: Date.now(), ...m }); syncChat(); }

async function sendLead(raw) {
  const text = clip(raw, 1500);
  if (!text || chat.busy) return;
  pushMsg({ role: 'lead', text });
  if (chat.paused) { pushMsg({ role: 'sys', text: 'A Rubi está pausada. Você está atendendo esta conversa.' }); return; }
  await ask(text);
}

async function ask(text, requestId = crypto.randomUUID()) {
  const g = chat.gen;
  chat.busy = true; syncChat();
  const t0 = performance.now();
  try {
    let res;
    try {
      res = await api('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: chat.sessionId, conversationKey: chat.conversationKey, requestId, start: !chat.serverStarted, message: text, perfil: perfil() })
      });
    } catch {
      throw Object.assign(new Error('rede'), { code: navigator.onLine === false ? 'sem_conexao' : 'rede' });
    }
    let data = null;
    try { data = await res.json(); } catch { /* corpo não-JSON */ }
    if (g !== chat.gen) return;
    if (res.status === 410) { resetChat('Esta conversa expirou. Começamos uma nova.'); return; }
    if (!res.ok || !data?.ok || typeof data.output !== 'string' || !data.output.trim()) {
      throw Object.assign(new Error('resposta'), { code: res.status === 429 ? 'limite' : (data?.error || 'indisponivel') });
    }
    chat.serverStarted = true;
    if (chat.firstMs == null) chat.firstMs = performance.now() - t0;
    const clean = cleanLeadData(data.lead, perfil());
    Object.assign(chat.lead, clean);
    const parts = data.output.trim().split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    for (const [n, part] of parts.entries()) {
      if (n > 0) await sleep(reduce.matches ? 0 : Math.min(400 + part.length * 5, 1000));
      if (g !== chat.gen) return;
      pushMsg({ role: 'bot', text: part });
    }
    if (data.encaminhado === true && !chat.handoff) {
      const nome = clip(data.especialista?.nome, 60);
      chat.handoff = { nome: nome || 'especialista', cargo: clip(data.especialista?.cargo, 60) || 'Especialista comercial' };
      pushMsg({ role: 'sys', text: `Lead qualificado e encaminhado para ${chat.handoff.nome} (${chat.handoff.cargo}).` });
    }
  } catch (err) {
    if (g !== chat.gen) return;
    console.warn('[rubi] falha no atendimento:', err.code || 'indisponivel');
    pushMsg({ role: 'err', text, requestId, code: err.code });
  } finally {
    if (g === chat.gen) { chat.busy = false; syncChat(); }
  }
}

function eraseRemote(ids, keepalive = false) {
  try {
    return api('/api/conversation', {
      method: 'DELETE', keepalive, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: ids.sessionId, conversationKey: ids.conversationKey })
    }).catch(() => {});
  } catch { return Promise.resolve(); }
}

function resetChat(note = '') {
  if (chat.serverStarted) eraseRemote({ sessionId: chat.sessionId, conversationKey: chat.conversationKey });
  Object.assign(chat, newIds(), { serverStarted: false, messages: [], lead: {}, busy: false, paused: false, firstMs: null, handoff: null, used: new Set() });
  chat.gen++;
  if (note) chat.messages.push({ role: 'sys', text: note, at: Date.now() });
  syncChat();
}
addEventListener('pagehide', () => { if (chat.serverStarted) eraseRemote({ sessionId: chat.sessionId, conversationKey: chat.conversationKey }, true); });

const ERRORS = {
  limite: 'Muitas mensagens em pouco tempo. Espere um minuto e tente de novo.',
  sem_conexao: 'Sem conexão com a internet.',
  rede: 'Não foi possível falar com a Rubi agora.'
};
const fmtTime = t => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
function msgHTML(m, i) {
  if (m.role === 'sys') return `<div class="m-sys">${icon('sparkles')}<span>${esc(m.text)}</span></div>`;
  if (m.role === 'err') return `<div class="m-err">${icon('alert')}<span>${esc(ERRORS[m.code] || 'A Rubi não respondeu agora.')}</span><button type="button" class="link-btn" data-action="retry" data-i="${i}">${icon('refresh')} Tentar de novo</button></div>`;
  const who = m.role === 'lead' ? 'in' : m.role === 'human' ? 'out human' : 'out';
  const tag = m.role === 'bot' ? '<b class="m-who">Rubi · IA</b>' : m.role === 'human' ? '<b class="m-who">Você · humano</b>' : '';
  return `<div class="bub ${who}">${tag}${esc(m.text).replace(/\n/g, '<br>')}<time>${fmtTime(m.at)}</time></div>`;
}

function leadCardHTML(L, { live = false } = {}) {
  const sc = score(L);
  const known = FIELDS.filter(f => L[f.key]).length;
  const rows = FIELDS.map(f => `<li class="${L[f.key] ? 'is-on' : ''}"><span>${esc(f.label)}</span><b>${L[f.key] ? esc(L[f.key]) : (live ? 'aguardando a conversa' : 'a confirmar')}</b></li>`).join('');
  const crit = CRIT.map(c => `<li class="${L[c.key] ? 'is-on' : ''}">${icon(L[c.key] ? 'check' : c.icon)}<div><span>${c.label}</span>${L[c.key] ? `<q>${esc(L[c.key])}</q>` : '<em>a descobrir</em>'}</div></li>`).join('');
  const temp = L.temperatura ? `<span class="tag t-${esc(L.temperatura)}">${TEMP[L.temperatura]}</span>` : '';
  return `
    <header class="lc-head"><div><p class="micro">Ficha do lead</p><h3>${sc ? 'Preenchida pela IA' : 'Esperando o primeiro contato'}</h3></div>${temp}</header>
    <div class="score"><div class="score-top"><span>Score</span><b>${sc || '–'}</b></div><div class="bar"><i style="width:${sc}%"></i></div><small>${sc >= 75 ? 'Acima da nota de corte · pronto para reunião' : sc ? 'Em qualificação' : 'A Rubi calcula conforme a conversa'}</small></div>
    <p class="micro">Dados capturados · ${known}/${FIELDS.length}</p>
    <ul class="lc-fields">${rows}</ul>
    <p class="micro">Critérios de qualificação</p>
    <ul class="lc-crit">${crit}</ul>`;
}

function syncChat() {
  const L = chat.lead;
  $$('[data-msgs]').forEach(box => {
    const empty = !chat.messages.length;
    box.innerHTML = empty
      ? `<div class="m-empty">${icon('sparkles')}<p><b>A Rubi responde de verdade.</b> Clique numa sugestão ou escreva como se fosse a cliente.</p></div>`
      : chat.messages.map(msgHTML).join('') + (chat.busy ? '<div class="bub out typing" aria-label="Rubi digitando"><i></i><i></i><i></i></div>' : '');
    box.scrollTop = box.scrollHeight;
  });
  $$('[data-leadcard]').forEach(el => { el.innerHTML = leadCardHTML(L, { live: true }); });
  $$('[data-chatname]').forEach(el => { el.textContent = L.nome || 'Novo contato'; });
  $$('[data-chatavatar]').forEach(el => { el.textContent = L.nome ? initials(L.nome) : 'NC'; });
  $$('[data-firstresp]').forEach(el => {
    const s = firstSecs();
    el.innerHTML = `${icon('zap')} ${s ? `1ª resposta em ${s}s` : '1ª resposta: aguardando'}`;
    el.classList.toggle('is-on', Boolean(s));
  });
  $$('[data-chatstatus]').forEach(el => {
    el.innerHTML = chat.paused ? `<span class="dot amber"></span>Você assumiu` : chat.busy ? '<span class="dot"></span>Rubi digitando…' : '<span class="dot"></span>Rubi · IA atendendo';
  });
  $$('[data-chip]').forEach(b => { b.disabled = chat.busy; b.classList.toggle('used', chat.used.has(+b.dataset.chip)); });
  $$('form[data-composer] button').forEach(b => { b.disabled = chat.busy; });
  $$('[data-takeover]').forEach(el => {
    el.innerHTML = chat.paused
      ? `<div class="takeover-on">${icon('user')}<div><b>Você assumiu a conversa</b><small>A Rubi pausou. As mensagens abaixo saem como humano.</small></div><button type="button" class="btn btn-ghost" data-action="resume">${icon('play')} Retomar IA</button></div>
         <form class="composer" data-composer="human"><input name="msg" maxlength="1500" autocomplete="off" placeholder="Responda como atendente…" aria-label="Mensagem do atendente"><button type="submit" aria-label="Enviar">${icon('send')}</button></form>`
      : `<button type="button" class="btn btn-red" data-action="takeover" data-advance-skip>${icon('pause')} Assumir como humano</button><small>A Rubi segue atendendo até você assumir.</small>`;
  });
  $$('[data-handoff]').forEach(el => {
    el.innerHTML = chat.handoff
      ? `${icon('user')}<div><b>Encaminhado para ${esc(chat.handoff.nome)}</b><small>${esc(chat.handoff.cargo)} · com a ficha completa</small></div>`
      : `${icon('calendar')}<div><b>Avaliação · quinta às 14:30</b><small>Com a Dra. Helena · convite e lembretes automáticos</small></div>`;
  });
}

/* ---------- peças visuais ---------- */
const brand = () => `<span class="brand"><img src="assets/v4-logo.svg" alt="V4 Company" width="90" height="20"><span class="brand-sep"></span><span>Oliveira&amp;Co</span></span>`;
const STATS = [['8s', 'Primeira resposta'], ['24/7', 'Atendimento contínuo'], ['3x', 'Mais reuniões'], ['-70%', 'Custo por lead qualificado']];
const statsHTML = () => `<div class="stats">${STATS.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
const CHANNEL = { Instagram: 'instagram', WhatsApp: 'whatsapp', 'Formulário': 'file', 'E-mail': 'mail' };
const QUEUE = [
  ['Beatriz Nogueira', 'Instagram', '02:14', 7], ['Rafael Menezes', 'WhatsApp', '23:40', 9], ['Juliana Prado', 'Formulário', '21:05', 12],
  ['Carlos Eduardo', 'WhatsApp', '19:32', 13], ['Patrícia Lima', 'E-mail', '18:10', 15]
];

const NAV = [
  ['Operação comercial', [['visao', 'Visão geral', 'grid'], ['inbox', 'Caixa de entrada', 'inbox'], ['contatos', 'Contatos/CRM', 'users'], ['oportunidades', 'Oportunidades', 'kanban'], ['reunioes', 'Reuniões', 'calendar']]],
  ['Inteligência artificial', [['agentes', 'Agentes de IA', 'bot'], ['base', 'Base de conhecimento', 'book'], ['playground', 'Playground', 'play']]],
  ['Gestão', [['integracoes', 'Integrações', 'plug'], ['uso', 'Uso da IA', 'chart'], ['config', 'Configurações', 'settings']]]
];
function shell(active, crumb, body) {
  return `<section class="scene crm">
    <div class="shell">
      <aside class="sb">
        <div class="sb-brand"><span class="sb-mark">${icon('sparkles')}</span><div><b>SDR AI &amp; CRM</b><small>${E()}</small></div></div>
        <nav class="sb-nav" aria-label="Menu do CRM (demonstração)">
          ${NAV.map(([g, items]) => `<p class="sb-group">${g}</p>${items.map(([k, l, ic]) => `<span class="sb-item${k === active ? ' is-active' : ''}" data-nav="${k}">${icon(ic)}${l}${k === 'inbox' ? '<em class="sb-badge">5</em>' : ''}</span>`).join('')}`).join('')}
        </nav>
        <div class="sb-foot"><span class="avatar sm">EC</span><div><b>Equipe Comercial</b><small>Administrador</small></div></div>
      </aside>
      <div class="main">
        <header class="topbar">
          <p class="crumb">${E()} <span>/</span> <b data-crumb>${crumb}</b></p>
          <span class="pill pill-soft">Demonstração · dados fictícios</span>
          <span class="search">${icon('search')}<span>Buscar</span><kbd>⌘K</kbd></span>
          <span class="tb-ico">${icon('bell')}<i></i></span>
          <span class="avatar sm">EC</span>
        </header>
        <div class="content">${body}</div>
      </div>
    </div>
  </section>`;
}

const panelHead = (title, sub = '', right = '') => `<header class="ph"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>${right}</header>`;

/* ---------- cenas ---------- */
const SCENES = {
  capa: () => `<section class="scene cover">
    <div class="cover-copy">
      <div class="brand-row">${brand()}<span class="pill pill-red">${icon('sparkles')}Demonstração guiada</span></div>
      <p class="eyebrow">SDR com IA + CRM completo para vendas</p>
      <h1 class="display">Seu SDR de IA que nunca perde <em>um lead.</em></h1>
      <p class="lede">Atende no WhatsApp, Instagram e e-mail em segundos, qualifica cada contato e agenda a reunião direto na agenda do seu time. Tudo dentro de um CRM feito para vender.</p>
      <form class="cover-form" data-form="empresa">
        <label class="cover-field"><span>Preparada para</span><input name="empresa" maxlength="60" value="${E()}" autocomplete="organization" spellcheck="false" aria-label="Nome do cliente da demonstração"></label>
        <button class="btn btn-red" type="submit">Iniciar demonstração ${icon('arrowR')}</button>
      </form>
      <p class="keys"><kbd>→</kbd> avança <kbd>←</kbd> volta <kbd>P</kbd> painel da apresentadora <kbd>H</kbd> esconde os controles</p>
    </div>
    <div class="cover-art" aria-hidden="true">
      <div class="phone">
        <div class="phone-head"><span class="avatar av-rose">BN</span><div><b>Beatriz Nogueira</b><small>${icon('whatsapp')} WhatsApp · <span class="dot"></span> IA atendendo</small></div></div>
        <div class="phone-body">
          <div class="bub in">Oi! Vi o anúncio de vocês no Instagram. Vocês fazem harmonização facial?<time>02:14</time></div>
          <div class="bub out"><b class="m-who">Rubi · IA</b>Oi, Beatriz! Fazemos sim 😊 Aqui é a Rubi, da <span data-emp>${E()}</span>. Posso te fazer duas perguntas rápidas para indicar a melhor avaliação?<time>02:14</time></div>
          <div class="bub in">Pode! É para o casamento da minha irmã em dezembro.<time>02:15</time></div>
          <div class="bub out typing"><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="float f1">${icon('calendar')}<div><b>Reunião agendada</b><small>Quinta às 14:30</small></div></div>
      <div class="float f2">${icon('target')}<div><b>Lead qualificado · Score 92</b><small>pronto para reunião</small></div></div>
      <div class="float f3">${icon('zap')}<div><b>Resposta em 8s</b><small>Via WhatsApp, às 02:14</small></div></div>
    </div>
  </section>`,

  problema: () => `<section class="scene problem">
    <p class="kicker"><span>(01)</span> O problema</p>
    <h2 class="display h2" data-show="1">Todo lead que espera mais de 5 minutos <em>já esfriou.</em></h2>
    <h2 class="display h2" data-show="2">Enquanto isso, quem responde primeiro, <em>vende.</em></h2>
    <h2 class="display h2" data-show="3">Um SDR. Um CRM. <em>Zero lead esquecido.</em></h2>
    <div class="queue" data-advance>
      <header><b>Fila de leads</b><span data-until="2">${icon('clock')} fora do horário comercial</span><span data-from="3" class="ok">${icon('check')} todos atendidos</span></header>
      ${QUEUE.map(([n, ch, t, h], i) => `<div class="q-row" style="--d:${i * 70}ms">
        <span class="avatar sm">${initials(n)}</span>
        <div class="q-who"><b>${n}</b><small>${icon(CHANNEL[ch])} ${ch} · ${t}</small></div>
        <span class="q-st warn" data-show="1">${icon('clock')} Sem resposta · há ${h}h</span>
        <span class="q-st cold" data-show="2">${icon('alert')} Esfriou</span>
        <span class="q-st ok" data-show="3">${icon('check')} Respondido em 8s</span>
      </div>`).join('')}
    </div>
    <div data-from="3">${statsHTML()}</div>
    <p class="fine">Exemplo ilustrativo, não são dados reais.</p>
  </section>`,

  atende: () => shell('inbox', 'Caixa de entrada', `<div class="inbox-grid">
    <aside class="panel inbox-list" data-hl="1">
      ${panelHead('Conversas', '', '<span class="tabs"><b>Todas</b><span>IA</span><span>Humano</span></span>')}
      <div class="conv is-active is-new"><span class="avatar av-rose" data-chatavatar>NC</span><div><b data-chatname>Novo contato</b><small>${icon('instagram')} Instagram · agora</small></div><span class="tag t-ia">IA</span></div>
      ${[['Rafael Menezes', 'whatsapp', 'Quero saber do pacote de pele', 'IA'], ['Juliana Prado', 'file', 'Formulário: bioestimulador', 'IA'], ['Carlos Eduardo', 'whatsapp', 'Posso remarcar para sexta?', 'Humano'], ['Patrícia Lima', 'mail', 'Retorno da avaliação', 'IA']]
        .map(([n, ic, msg, who]) => `<div class="conv"><span class="avatar">${initials(n)}</span><div><b>${n}</b><small>${icon(ic)} ${msg}</small></div><span class="tag ${who === 'IA' ? 't-ia' : 't-human'}">${who}</span></div>`).join('')}
    </aside>
    <section class="panel convo" data-hl="2,3">
      <header class="convo-head">
        <span class="avatar av-rose" data-chatavatar>NC</span>
        <div class="grow"><b data-chatname>Novo contato</b><small>${icon('instagram')} Instagram · anúncio Harmonização</small></div>
        <span class="badge" data-firstresp></span>
        <span class="status" data-chatstatus></span>
        <button type="button" class="icon-btn" data-action="new-chat" title="Nova conversa" aria-label="Começar nova conversa">${icon('refresh')}</button>
      </header>
      <div class="msgs" data-msgs role="log" aria-live="polite"></div>
      <div class="chips">${CHIPS.map((c, i) => `<button type="button" class="chip" data-chip="${i}">${esc(c)}</button>`).join('')}</div>
      <form class="composer" data-composer="lead"><input name="msg" maxlength="1500" autocomplete="off" placeholder="Escreva como se fosse a cliente…" aria-label="Mensagem da cliente"><button type="submit" aria-label="Enviar">${icon('send')}</button></form>
    </section>
    <aside class="panel lead-panel" data-hl="4,5">
      <div data-leadcard></div>
      <div class="next-card" data-from="5" data-hl="5" data-handoff></div>
    </aside>
  </div>`),

  ficha: () => {
    const L = leadData(), sc = score(L), s = firstSecs() || 8;
    const tasks = [['Confirmar avaliação na véspera', 'automático · WhatsApp'], ['Lembrete 2h antes', 'automático · WhatsApp'], ['Preparar plano personalizado', 'Dra. Helena · antes da avaliação']];
    const timeline = [
      ['02:14', `Lead chegou pelo Instagram`, 'anúncio Harmonização'],
      ['02:14', `Rubi respondeu em ${s}s`, 'sem ninguém do time online'],
      ['02:16', 'Dados capturados', CRIT.filter(c => L[c.key]).map(c => c.label.toLowerCase()).join(', ') || 'em andamento'],
      ['02:17', `Score ${sc || '–'} · lead ${(TEMP[L.temperatura] || 'em análise').toLowerCase()}`, 'acima da nota de corte 75'],
      ['02:18', 'Avaliação agendada', 'quinta às 14:30 com a Dra. Helena'],
      ['02:18', 'Oportunidade criada no funil', 'etapa Reunião agendada']
    ];
    return shell('contatos', 'Contatos / Ficha', `<div class="ficha">
      <header class="panel ficha-head">
        <span class="avatar lg av-rose">${initials(L.nome || 'NC')}</span>
        <div class="grow"><h2>${esc(L.nome || 'Novo contato')}</h2><p>${icon('instagram')} Instagram · ${esc(L.cidade || 'cidade a confirmar')} · <span class="tag t-ia">${icon('sparkles')} Criado pela IA</span> ${L.temperatura ? `<span class="tag t-${esc(L.temperatura)}">${TEMP[L.temperatura]}</span>` : ''}</p></div>
        <div class="ring" style="--p:${sc}"><b>${sc || '–'}</b><small>score</small></div>
      </header>
      <div class="ficha-grid">
        <div class="col">
          <section class="panel" data-hl="1">${panelHead(`${icon('sparkles')} Resumo da IA`)}<p class="summary">${esc(L.resumo || `${L.nome || 'O lead'} procura ${L.interesse || 'um procedimento'}${L.prazo ? `, com prazo ${L.prazo}` : ''}${L.orcamento ? `, orçamento ${L.orcamento}` : ''}.`)}</p>
            <div class="nextstep">${icon('flag')}<div><small>Próximo passo</small><b>Avaliação gratuita com a Dra. Helena · quinta às 14:30</b></div></div></section>
          <section class="panel" data-hl="2">${panelHead('Critérios de qualificação', 'Pesos definidos pela sua equipe')}
            <div class="crit-grid">${CRIT.map(c => `<div class="crit ${L[c.key] ? 'is-on' : ''}"><div class="crit-top">${icon(c.icon)}<span>${c.label}</span><b>${L[c.key] ? c.w : 0}/${c.w}</b></div><div class="bar"><i style="width:${L[c.key] ? 100 : 6}%"></i></div>${L[c.key] ? `<q>${esc(L[c.key])}</q>` : '<em>a descobrir na conversa</em>'}</div>`).join('')}</div>
          </section>
        </div>
        <div class="col">
          <section class="panel" data-hl="3">${panelHead('Linha do tempo', 'Registrada automaticamente')}<ol class="timeline">${timeline.map(([t, a, b]) => `<li><time>${t}</time><div><b>${esc(a)}</b><small>${esc(b)}</small></div></li>`).join('')}</ol></section>
          <section class="panel" data-hl="3">${panelHead('Tarefas', 'Criadas pela IA')}<ul class="tasks">${tasks.map(([a, b]) => `<li><span class="cb"></span><div><b>${a}</b><small>${b}</small></div></li>`).join('')}</ul></section>
        </div>
      </div>
    </div>`);
  },

  agenda: () => {
    const L = leadData();
    const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
    const first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
    const thu = new Date(now); thu.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
    const marks = new Set([thu.getMonth() === mo ? thu.getDate() : -1, Math.min(days, now.getDate() + 1), Math.min(days, now.getDate() + 3)]);
    const cells = Array.from({ length: first }, () => '<span></span>').concat(Array.from({ length: days }, (_, i) => `<span class="${i + 1 === now.getDate() ? 'today' : ''}${marks.has(i + 1) ? ' has' : ''}">${i + 1}</span>`)).join('');
    const month = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return shell('reunioes', 'Reuniões', `<div class="agenda">
      <div class="kpis">${[['Próximas', 4], ['Realizadas', 12], ['Agendadas pela IA', 9], ['Total', 17]].map(([l, v]) => `<div class="kpi"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
      <div class="agenda-grid">
        <section class="panel">${panelHead('Próximas reuniões')}
          <div class="meet is-ai" data-hl="1,2" data-advance>
            <div class="meet-date"><small>qui</small><b>${thu.getDate()}</b></div>
            <div class="grow"><b>Avaliação · ${esc(firstName(L))}</b><small>14:30 – 15:15 · Dra. Helena</small></div>
            <span class="tag t-ia">${icon('sparkles')} Agendada pela IA</span>
          </div>
          <div class="meet-more" data-from="2">
            <div>${icon('video')}<span><b>Google Meet</b><small>meet.google.com/abc-defg-hij</small></span></div>
            <div>${icon('mail')}<span><b>Convite enviado</b><small>para ${esc(firstName(L))} e para a Dra. Helena</small></span></div>
            <div>${icon('whatsapp')}<span><b>Lembretes no WhatsApp</b><small>véspera às 18:00 e 2h antes</small></span></div>
            <div>${icon('calendar')}<span><b>Google Agenda</b><small>agenda da Dra. Helena, sem conflito</small></span></div>
          </div>
          <div class="meet"><div class="meet-date"><small>sex</small><b>${Math.min(days, now.getDate() + 1)}</b></div><div class="grow"><b>Diagnóstico · Rafael</b><small>10:00 – 10:30 · Dra. Helena</small></div><span class="tag t-ia">IA</span></div>
          <div class="meet"><div class="meet-date"><small>seg</small><b>${Math.min(days, now.getDate() + 3)}</b></div><div class="grow"><b>Retorno · Patrícia</b><small>16:00 – 16:20 · Equipe</small></div><span class="tag t-human">Humano</span></div>
        </section>
        <div class="col">
          <section class="panel gcal">${icon('calendar')}<div class="grow"><b>Google Agenda</b><small>Dra. Helena · Recepção</small></div><span class="tag t-ok">${icon('check')} Conectado</span></section>
          <section class="panel">${panelHead(month[0].toUpperCase() + month.slice(1))}<div class="cal"><b>D</b><b>S</b><b>T</b><b>Q</b><b>Q</b><b>S</b><b>S</b>${cells}</div></section>
        </div>
      </div>
    </div>`);
  },

  funil: () => {
    const L = leadData();
    const card = (step) => `<div class="deal is-ai" ${step}><span class="tag t-ia">${icon('sparkles')} Criado pela IA</span><b>${esc(clip(L.interesse || 'Avaliação', 40))} · ${esc(clip(L.nome || 'Novo contato', 40))}</b><small>${esc(L.orcamento || 'Valor a definir')}</small><div class="deal-foot"><span class="avatar xs">${initials(L.nome || 'NC')}</span>${icon('instagram')}<em>agora</em></div></div>`;
    const deal = (t, v, n, ic = 'whatsapp') => `<div class="deal"><b>${t}</b><small>${v}</small><div class="deal-foot"><span class="avatar xs">${initials(n)}</span>${icon(ic)}<em>${n.split(' ')[0]}</em></div></div>`;
    return shell('oportunidades', 'Oportunidades', `<div class="funil">
      <div class="kpis">
        <div class="kpi"><span>Pipeline aberto</span><b><span data-until="1">R$ 87.200</span><span data-from="2">R$ 91.200</span></b></div>
        <div class="kpi" data-hl="4"><span>Previsão ponderada</span><b><span data-until="3">R$ 47.890</span><span data-from="4" class="up">R$ 50.290 ${icon('trend')}</span></b></div>
        <div class="kpi"><span>Ganho no mês</span><b>R$ 31.800</b></div>
        <div class="kpi"><span>Taxa de ganho</span><b>34%</b></div>
      </div>
      <div class="board">
        <div class="col-k"><header>Novo lead <em>4</em></header>${card('data-show="2" data-hl="2" data-advance')}${deal('Limpeza de pele · Rafael', 'R$ 600', 'Rafael Menezes')}${deal('Bioestimulador · Juliana', 'R$ 3.200', 'Juliana Prado', 'file')}</div>
        <div class="col-k"><header>Em qualificação <em>3</em></header>${deal('Preenchimento · Carlos', 'R$ 2.400', 'Carlos Eduardo')}${deal('Peeling · Marina', 'R$ 900', 'Marina Alves', 'instagram')}</div>
        <div class="col-k"><header>Qualificado <em>3</em></header>${deal('Toxina · Patrícia', 'R$ 1.800', 'Patrícia Lima', 'mail')}${deal('Laser · Fernanda', 'R$ 2.100', 'Fernanda Reis', 'instagram')}</div>
        <div class="col-k is-target"><header>Reunião agendada <em>2</em></header>${card('data-from="3" data-hl="3"')}${deal('Harmonização · Lúcia', 'R$ 3.800', 'Lúcia Campos')}</div>
        <div class="col-k"><header>Proposta <em>2</em></header>${deal('Plano facial · Renata', 'R$ 6.500', 'Renata Dias', 'mail')}${deal('Bioestimulador · Ana', 'R$ 3.400', 'Ana Souza')}</div>
      </div>
    </div>`);
  },

  assistente: () => {
    const L = leadData(), h = new Date().getHours();
    const hi = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    return shell('visao', 'Assistente de IA', `<div class="assist">
      <div class="assist-hero" data-until="1"><span class="sb-mark lg">${icon('sparkles')}</span><h2 class="display">${hi}, equipe.</h2><p>Pergunte sobre leads, reuniões e funil, ou peça para eu fazer por você.</p></div>
      <div class="assist-chips" data-until="1"><button type="button" class="chip hl-able" data-hl="1" data-advance>${icon('list')} Resumir meu dia</button><span class="chip">${icon('target')} Leads quentes sem retorno</span><span class="chip">${icon('calendar')} Reuniões de amanhã</span></div>
      <div class="assist-thread">
        <div data-from="2"><div class="bub out human">Resumir meu dia</div>
          <div class="ai-answer">${icon('sparkles')}<div><p>Hoje entraram <b>14 leads</b> e a Rubi atendeu todos em menos de 10 segundos. <b>4 estão quentes.</b></p>
            <p>A mais pronta é <b>${esc(L.nome || 'Beatriz Nogueira')}</b> (score ${score(L) || 92}): ${esc(L.interesse || 'harmonização facial')}${L.prazo ? `, ${esc(L.prazo)}` : ''}. Avaliação marcada para quinta às 14:30.</p>
            <p>Atenção: <b>Juliana Prado</b> está sem retorno há 2 dias e há 3 avaliações amanhã.</p></div></div></div>
        <div data-from="3" data-hl="3"><div class="bub out human">Manda um WhatsApp para a Juliana e marca uma avaliação amanhã às 11h.</div>
          <ul class="tools"><li>${icon('book')} Consultou a base: horários da Dra. Helena <em>${icon('check')}</em></li><li>${icon('whatsapp')} WhatsApp enviado para Juliana Prado <em>${icon('check')}</em></li><li>${icon('calendar')} Reunião criada: amanhã, 11:00 <em>${icon('check')}</em></li></ul>
          <div class="ai-answer">${icon('sparkles')}<div><p>Pronto. Mandei a mensagem para a Juliana e reservei a avaliação amanhã às 11h na agenda da Dra. Helena. Ela recebe o convite e os lembretes automáticos.</p></div></div></div>
      </div>
      <div class="composer ghost"><input disabled placeholder="Pergunte ao assistente…" aria-label="Campo do assistente (ilustrativo)"><button disabled aria-label="Enviar">${icon('send')}</button></div>
    </div>`);
  },

  controle: () => shell('agentes', 'Agentes de IA', `<div class="controle">
    <div class="agent-grid" data-until="2">
      <div class="col">
        <section class="panel" data-hl="1">${panelHead('Identidade', 'Quem atende em nome da empresa')}
          <dl class="kv"><dt>Nome</dt><dd>Rubi</dd><dt>Função</dt><dd>SDR · qualificação e agendamento</dd><dt>Empresa</dt><dd>${E()}</dd><dt>Canais</dt><dd>WhatsApp, Instagram e e-mail</dd></dl></section>
        <section class="panel" data-hl="1">${panelHead('Tom de voz')}<div class="seg"><b>Consultiva</b><span>Amigável</span><span>Formal</span><span>Especialista</span></div></section>
        <section class="panel" data-hl="2">${panelHead('Critérios de qualificação', 'Peso de cada critério no score')}
          <ul class="weights">${CRIT.map(c => `<li><span>${icon(c.icon)} ${c.label}</span><div class="bar"><i style="width:${c.w * 2.5}%"></i></div><b>${c.w}%</b></li>`).join('')}</ul>
          <div class="cut"><span>Nota de corte</span><b>75</b><small>Acima dela, a Rubi agenda. Abaixo, nutre.</small></div></section>
      </div>
      <div class="col">
        <section class="panel" data-hl="2">${panelHead('Instruções')}<p class="instr">Faça uma pergunta por vez. Nunca informe preços: o valor é definido na avaliação gratuita. Se o lead pedir para falar com uma pessoa, encaminhe na hora. Use o nome do lead.</p></section>
        <section class="panel preview">${panelHead('Prévia', 'Como a Rubi se apresenta')}<div class="bub out"><b class="m-who">Rubi · IA</b>Oi! Aqui é a Rubi, da ${E()} 😊 Me conta: qual procedimento você tem em mente?</div></section>
      </div>
    </div>
    <section class="panel kb" data-show="3">${panelHead(`${icon('book')} Base de conhecimento`, 'A IA responde só com o que está aqui', `<span class="btn btn-ghost sm">${icon('plus')} Adicionar conteúdo</span>`)}
      <div class="kb-grid">${[['Procedimentos', '18 itens · indicações e cuidados'], ['Perguntas frequentes', '42 respostas aprovadas'], ['Unidades', 'Endereços, horários e estacionamento'], ['Política de remarcação', 'Prazos e regras de cancelamento']]
        .map(([t, d]) => `<div class="kb-item">${icon('file')}<div><b>${t}</b><small>${d}</small></div><span class="tag t-ok">${icon('check')} Treinado</span></div>`).join('')}</div></section>
    <section class="panel takeover" data-show="4">
      <header class="convo-head"><span class="avatar av-rose" data-chatavatar>NC</span><div class="grow"><b data-chatname>Novo contato</b><small>${icon('instagram')} Instagram</small></div><span class="status" data-chatstatus></span></header>
      <div class="msgs short" data-msgs role="log"></div>
      <div class="takeover-bar" data-takeover data-hl="4"></div>
    </section>
  </div>`),

  integracoes: () => shell('integracoes', 'Integrações', `<div class="integ">
    <div class="banner">${icon('check')}<div><b>Tudo conectado</b><small>Os canais e a agenda conversam com o CRM em tempo real.</small></div></div>
    <div class="integ-grid" data-hl="1">${[['whatsapp', 'WhatsApp', 'API oficial · 2 números'], ['instagram', 'Instagram', 'Direct e comentários'], ['mail', 'E-mail', 'Caixa comercial'], ['calendar', 'Google Agenda', '3 agendas'], ['megaphone', 'Meta Ads', 'Leads de formulário'], ['code', 'API e Webhooks', 'Seu ERP ou sistema']]
      .map(([ic, t, d]) => `<div class="integ-card"><span class="ic">${icon(ic)}</span><div class="grow"><b>${t}</b><small>${d}</small></div><span class="tag t-ok">Conectado</span></div>`).join('')}</div>
    <section class="sec" data-from="2" data-hl="2"><p class="micro">Segurança</p><div class="sec-grid">${[['lock', 'Dados isolados por conta', 'Cada empresa enxerga só os próprios dados.'], ['shield', 'LGPD', 'Consentimento, retenção e exclusão sob controle.'], ['users', 'Equipe com funções', 'Administrador, gestor e vendedor.'], ['lock', 'Login seguro com MFA', 'Autenticação em dois fatores.']]
      .map(([ic, t, d]) => `<div class="sec-card">${icon(ic)}<b>${t}</b><small>${d}</small></div>`).join('')}</div></section>
  </div>`),

  resultados: () => `<section class="scene results">
    <div data-show="1">
      <p class="kicker"><span>(02)</span> Resultados</p>
      <h2 class="display h2">O que muda quando nenhum lead <em>fica sem resposta.</em></h2>
      ${statsHTML()}
      <p class="fine">Números ilustrativos. O resultado depende do volume de leads, do ticket e da operação de cada empresa.</p>
    </div>
    <div data-show="2">
      <p class="kicker"><span>(03)</span> Comparativo</p>
      <h2 class="display h2">SDR humano ou <em>SDR de IA?</em></h2>
      <div class="compare" role="table" aria-label="Comparativo entre SDR tradicional e SDR de IA">
        <div class="cmp-row head" role="row"><span role="columnheader"></span><span role="columnheader">SDR tradicional</span><span role="columnheader" class="win">SDR AI &amp; CRM</span></div>
        ${[['Primeira resposta', 'Minutos ou horas', '8 segundos'], ['Disponibilidade', 'Horário comercial', '24 horas, 7 dias'], ['Custo mensal', 'Salário, comissão e encargos', 'Uma fração do custo'], ['Escala', 'Contratar e treinar', 'Ilimitada, na hora'], ['Follow-up', 'Depende da disciplina', '100% automático'], ['Dados', 'Planilhas espalhadas', 'CRM atualizado sozinho']]
          .map(([a, b, c], i) => `<div class="cmp-row" role="row" style="--d:${i * 60}ms"><span role="rowheader">${a}</span><span role="cell">${b}</span><span role="cell" class="win">${icon('check')} ${c}</span></div>`).join('')}
      </div>
    </div>
  </section>`,

  proximos: () => `<section class="scene next">
    <div data-show="1">
      <p class="kicker"><span>(04)</span> Implantação</p>
      <h2 class="display h2">No ar em 7 dias, <em>sem dor de cabeça.</em></h2>
      <div class="plan">${[['01', 'Diagnóstico', 'Dia 1', 'Entendemos funil, canais, perguntas e objeções do seu time.'], ['02', 'Treino da IA', 'Dias 2 a 4', 'Montamos a base de conhecimento, o tom de voz e os critérios.'], ['03', 'Conexão dos canais', 'Dia 5', 'WhatsApp, Instagram, e-mail e agenda ligados ao CRM.'], ['04', 'Go-live e otimização', 'Dia 7', 'A Rubi entra no ar e ajustamos com as conversas reais.']]
        .map(([n, t, d, x], i) => `<div class="plan-card" style="--d:${i * 80}ms"><span class="num">${n}</span><small>${d}</small><b>${t}</b><p>${x}</p></div>`).join('')}</div>
    </div>
    <div data-show="2" class="offer">
      <div><p class="kicker"><span>(05)</span> A proposta</p><h2 class="display h2">Um time de SDR inteiro, <em>pronto em 7 dias.</em></h2></div>
      <div class="offer-card">
        <ul>${['SDR de IA no WhatsApp, Instagram e e-mail', 'Qualificação com os seus critérios', 'Agendamento direto na agenda do time', 'CRM com funil, fichas e tarefas automáticas', 'Assistente de IA para o time comercial', 'Implantação e acompanhamento da nossa equipe'].map(t => `<li>${icon('check')} ${t}</li>`).join('')}</ul>
        <a class="btn btn-red lg" href="simulador.html">Teste de 7 dias para a <span data-emp>${E()}</span> ${icon('arrowR')}</a>
        <small>O botão abre o simulador para testar a Rubi com o seu negócio.</small>
      </div>
    </div>
    <div data-show="3" class="final">
      <div class="marquee" aria-hidden="true"><div>${'<span>Seu próximo cliente já está chamando ✦</span>'.repeat(8)}</div></div>
      <h2 class="display">Seu próximo cliente <br>já está chamando.</h2>
      <p>Enquanto a gente conversa, um lead da <span data-emp>${E()}</span> pode estar esperando resposta.</p>
      <div class="final-cta"><a class="btn btn-white lg" href="simulador.html">Próximo passo: diagnóstico ${icon('arrowR')}</a><button type="button" class="btn btn-outline" data-action="restart">${icon('refresh')} Recomeçar</button></div>
    </div>
  </section>`
};

/* ---------- navegação ---------- */
const stage = $('#stage');
const NAV_BY_STEP = { controle: s => (s === 3 ? 'base' : s === 4 ? 'inbox' : 'agentes') };
const CRUMB_BY_STEP = { controle: s => (s === 3 ? 'Base de conhecimento' : s === 4 ? 'Caixa de entrada' : 'Agentes de IA') };

function applyStep(root, step) {
  root.dataset.step = step;
  $$('[data-show],[data-from],[data-until]', root).forEach(el => {
    const d = el.dataset;
    const on = (!d.show || d.show.split(',').includes(String(step))) && (!d.from || step >= +d.from) && (!d.until || step <= +d.until);
    const wasOff = el.classList.contains('off');
    el.classList.toggle('off', !on);
    if (on && wasOff && !reduce.matches) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); }
  });
  $$('[data-hl]', root).forEach(el => el.classList.toggle('hl', el.dataset.hl.split(',').includes(String(step))));
  const ch = CHAPTERS[state.c];
  const navKey = NAV_BY_STEP[ch.id]?.(step);
  if (navKey) $$('[data-nav]', root).forEach(el => el.classList.toggle('is-active', el.dataset.nav === navKey));
  const crumb = CRUMB_BY_STEP[ch.id]?.(step);
  if (crumb) { const el = $('[data-crumb]', root); if (el) el.textContent = crumb; }
}

function globalIndex(c, s) { let n = 0; for (let i = 0; i < c; i++) n += CHAPTERS[i].steps.length; return n + s; }

function go(c, s, { force = false } = {}) {
  c = Math.max(0, Math.min(CHAPTERS.length - 1, c));
  s = Math.max(0, Math.min(CHAPTERS[c].steps.length - 1, s));
  const changed = force || c !== state.mounted;
  state.c = c; state.s = s;
  if (changed) {
    stage.innerHTML = SCENES[CHAPTERS[c].id]();
    state.mounted = c;
    syncChat();
    stage.scrollTop = 0; scrollTo(0, 0);
  }
  applyStep(stage.firstElementChild, s + 1);
  renderDock();
  const hash = `#${c + 1}.${s + 1}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  broadcast();
}
function next() { const ch = CHAPTERS[state.c]; if (state.s < ch.steps.length - 1) go(state.c, state.s + 1); else if (state.c < CHAPTERS.length - 1) go(state.c + 1, 0); }
function prev() { if (state.s > 0) go(state.c, state.s - 1); else if (state.c > 0) go(state.c - 1, CHAPTERS[state.c - 1].steps.length - 1); }
function parseHash() {
  const m = /^#(\d{1,2})(?:\.(\d{1,2}))?$/.exec(location.hash);
  return m ? [Number(m[1]) - 1, Number(m[2] || 1) - 1] : [0, 0];
}

function renderDock() {
  const ch = CHAPTERS[state.c], st = ch.steps[state.s];
  $('#dock-ico').innerHTML = icon(ch.icon);
  $('#dock-label').textContent = `${state.c + 1}. ${ch.label} · ${state.s + 1}/${ch.steps.length}`;
  $('#dock-title').textContent = st.t;
  $('#dock-desc').textContent = st.d;
  $('#dock-hint').innerHTML = `${icon('target')} ${esc(st.h || (stage.querySelector('.hl') ? 'Clique no destaque ou aperte →' : 'Aperte → para avançar'))}`;
  const last = state.c === CHAPTERS.length - 1 && state.s === ch.steps.length - 1;
  $('#prev').disabled = state.c === 0 && state.s === 0;
  $('#next').disabled = last;
  $('#dock-progress').innerHTML = CHAPTERS.map((c, i) => {
    const fill = i < state.c ? 100 : i > state.c ? 0 : ((state.s + 1) / c.steps.length) * 100;
    return `<button type="button" class="seg-btn${i === state.c ? ' is-cur' : ''}" data-action="chapter" data-c="${i}" aria-label="Capítulo ${i + 1}: ${esc(c.label)}" title="${i + 1}. ${esc(c.label)}"><i style="width:${fill}%"></i></button>`;
  }).join('');
  $('#topline').style.width = `${((globalIndex(state.c, state.s) + 1) / TOTAL_STEPS) * 100}%`;
  $('#live').textContent = `${ch.label}, passo ${state.s + 1}: ${st.t}`;
  document.body.classList.toggle('on-final', ch.id === 'proximos' && state.s === 2);
}

function toggleDock(force) {
  state.dockHidden = force ?? !state.dockHidden;
  document.body.classList.toggle('dock-hidden', state.dockHidden);
  $('#dock-show').hidden = !state.dockHidden;
}

/* ---------- painel da apresentadora ---------- */
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('rubi-guiada') : null;
function broadcast() { channel?.postMessage({ type: 'state', c: state.c, s: state.s, empresa: state.empresa }); }
function openPresenter() {
  const url = `${location.pathname}?apresentadora${location.hash}`;
  window.open(url, 'rubi-apresentadora', 'popup,width=560,height=720');
}

function startPresenter() {
  document.body.classList.add('presenter');
  document.title = 'Painel da apresentadora';
  const t0 = Date.now();
  let cur = { c: 0, s: 0 };
  [cur.c, cur.s] = parseHash();
  const render = () => {
    const ch = CHAPTERS[cur.c], st = ch.steps[cur.s];
    let nc = cur.c, ns = cur.s + 1;
    if (ns >= ch.steps.length) { nc++; ns = 0; }
    const nxt = CHAPTERS[nc]?.steps[ns];
    document.body.innerHTML = `<main class="pp">
      <header class="pp-head"><span class="pill pill-red">${icon('monitor')} Painel da apresentadora</span><span class="pp-timer" id="pp-timer">00:00</span></header>
      <p class="dock-label">${cur.c + 1}. ${esc(ch.label)} · ${cur.s + 1}/${ch.steps.length}</p>
      <h1 class="pp-title">${esc(st.t)}</h1>
      <p class="pp-desc">${esc(st.d)}</p>
      <section class="pp-note"><p class="micro">O que falar</p><p>${esc(st.n)}</p></section>
      <section class="pp-next"><p class="micro">A seguir</p><p>${nxt ? esc(nxt.t) : 'Fim da demonstração'}</p></section>
      <div class="pp-actions"><button type="button" class="btn btn-ghost" data-pp="-1">${icon('arrowL')} Voltar</button><button type="button" class="btn btn-red" data-pp="1">Avançar ${icon('arrowR')}</button></div>
      <p class="fine">Use ← e → aqui também. A demonstração precisa estar aberta em outra janela.</p>
    </main>`;
    tick();
  };
  const tick = () => { const sec = Math.floor((Date.now() - t0) / 1000); const el = $('#pp-timer'); if (el) el.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
  setInterval(tick, 1000);
  const send = dir => channel?.postMessage({ type: 'go', dir });
  document.addEventListener('click', e => { const b = e.target.closest('[data-pp]'); if (b) send(Number(b.dataset.pp)); });
  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); send(1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); send(-1); }
  });
  channel?.addEventListener('message', e => { if (e.data?.type === 'state') { cur = { c: e.data.c, s: e.data.s }; render(); } });
  render();
  channel?.postMessage({ type: 'hello' });
}

/* ---------- eventos ---------- */
function setEmpresa(v) {
  const name = clip(v, 60);
  if (!name) return;
  state.empresa = name;
  store.set('rubi-guiada-empresa', name);
  $$('[data-emp]').forEach(el => { el.textContent = name; });
  broadcast();
}

function bind() {
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]');
    if (a) {
      const act = a.dataset.action;
      if (act === 'next') next();
      else if (act === 'prev') prev();
      else if (act === 'chapter') go(Number(a.dataset.c), 0);
      else if (act === 'presenter') openPresenter();
      else if (act === 'hide-dock') toggleDock();
      else if (act === 'restart') go(0, 0);
      else if (act === 'new-chat') resetChat();
      else if (act === 'takeover') { chat.paused = true; pushMsg({ role: 'sys', text: 'Você assumiu a conversa. A Rubi pausou.' }); $('form[data-composer="human"] input')?.focus(); }
      else if (act === 'resume') { chat.paused = false; pushMsg({ role: 'sys', text: 'A Rubi voltou a atender.' }); }
      else if (act === 'retry') {
        const i = Number(a.dataset.i), m = chat.messages[i];
        if (m?.role === 'err' && !chat.busy) { chat.messages.splice(i, 1); syncChat(); ask(m.text, m.requestId); }
      }
      return;
    }
    const chip = e.target.closest('[data-chip]');
    if (chip) { if (chat.busy) return; chat.used.add(Number(chip.dataset.chip)); sendLead(CHIPS[Number(chip.dataset.chip)]); return; }
    const adv = e.target.closest('[data-advance]');
    if (adv && adv.classList.contains('hl')) next();
  });

  document.addEventListener('submit', e => {
    const form = e.target;
    e.preventDefault();
    if (form.dataset.form === 'empresa') { setEmpresa(form.empresa.value); go(1, 0); return; }
    const kind = form.dataset.composer;
    const input = form.msg;
    if (!kind || !input) return;
    const text = input.value;
    if (!clip(text, 1500) || chat.busy) return;
    input.value = '';
    if (kind === 'human') pushMsg({ role: 'human', text: clip(text, 1500) });
    else sendLead(text);
    $(`form[data-composer="${kind}"] input`)?.focus();
  });

  document.addEventListener('input', e => { if (e.target.matches('.cover-form input')) { const v = clip(e.target.value, 60); if (v) { state.empresa = v; $$('[data-emp]').forEach(el => { el.textContent = v; }); } } });
  document.addEventListener('change', e => { if (e.target.matches('.cover-form input')) setEmpresa(e.target.value); });

  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !t.closest?.('button, a'))) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0, 0); }
    else if (k === 'End') { e.preventDefault(); go(CHAPTERS.length - 1, CHAPTERS.at(-1).steps.length - 1); }
    else if (k === 'p' || k === 'P') openPresenter();
    else if (k === 'h' || k === 'H') toggleDock();
  });

  addEventListener('hashchange', () => { const [c, s] = parseHash(); if (c !== state.c || s !== state.s) go(c, s); });
  channel?.addEventListener('message', e => {
    if (e.data?.type === 'go') (e.data.dir > 0 ? next : prev)();
    if (e.data?.type === 'hello') broadcast();
  });

  $('[data-action="presenter"]').innerHTML = icon('monitor');
  $('[data-action="hide-dock"]').innerHTML = icon('eyeOff');
  $('#prev').innerHTML = icon('arrowL');
  $('#next').insertAdjacentHTML('beforeend', icon('arrowR'));
}

if (PRESENTER) startPresenter();
else {
  bind();
  const [c, s] = parseHash();
  go(c, s, { force: true });
}
