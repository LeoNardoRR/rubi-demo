/* Rubi · SDR com IA. Front estático: fala só com /api/status e /api/chat do próprio servidor. */
import { PROFILE_LIMITS, cleanProfile, readDemoLibrary, upsertDemo, restoreBusiness, createDemoReport, MAX_FIELDS, cleanFields, fieldsForProfile, suggestFields, cleanLeadData, createTestOutcome, cleanTestFeedback, BRIEFING_LIMITS, cleanBriefing, fieldsFromBriefing, validateBriefingStep, briefingSummary, leadFieldStatus, leadFieldStatusLabel, TEST_RETENTION_MS, readPrivateData, packPrivateData } from './demo.js?v=3d63898952';
import { createApiClient } from './api.js?v=3ade90f455';
(() => {
  'use strict';
  const fetch = createApiClient(document.querySelector('meta[name="rubi-api-base"]')?.content || '');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  /* ---------- Ícones (traços no estilo Lucide, ISC) ---------- */
  const ICONS = {
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    whatsapp: '<path d="M20.2 3.8A11 11 0 0 0 2.9 17.1L1.5 22.5l5.6-1.4A11 11 0 0 0 20.2 3.8Z"/><path d="M8.2 6.8c-.5-.1-1 .1-1.3.6-.7 1-.6 2.1.2 3.6a11.2 11.2 0 0 0 5.3 5.1c1.5.7 2.7.7 3.7-.1.5-.4.7-1 .5-1.4l-2.5-1.2-.9 1.1c-1.8-.7-3.4-2.2-4.2-4l1-1-1.1-2.7Z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/>',
    brain: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    refresh: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    pencil: '<path d="M21.17 6.81a2.83 2.83 0 0 0-4-4L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>'
  };
  const svgIcon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  const paintIcons = (root = document) => $$('i[data-icon]', root).forEach(el => {
    if (el.firstChild) return;
    el.innerHTML = svgIcon(el.dataset.icon);
    el.setAttribute('aria-hidden', 'true');
  });
  const iconEl = name => {
    const i = document.createElement('i');
    i.dataset.icon = name;
    i.innerHTML = svgIcon(name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  };

  /* ---------- Site ---------- */
  function revealOnScroll() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduce.matches) return items.forEach(el => el.classList.add('in'));
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    items.forEach(el => io.observe(el));
  }

  function navShadow() {
    const nav = $('#nav');
    const on = () => nav.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', on, { passive: true });
    on();
  }

  function heroCycle() {
    const lines = $$('.hero-title .line');
    if (reduce.matches) return lines.at(-1).classList.add('is-active');
    let i = 0;
    const tick = () => { lines.forEach((l, n) => l.classList.toggle('is-active', n === i)); i = (i + 1) % lines.length; };
    setTimeout(() => { tick(); setInterval(tick, 2200); }, 1300);
  }

  /* Animated grid pattern (Magic UI, MIT): quadrados que acendem e trocam de lugar. */
  function gridPattern() {
    const svg = $('#grid-svg'), g = $('#grid-squares');
    if (!svg || !g || reduce.matches) return;
    const S = 56;
    let cols = 1, rows = 1;
    const measure = () => { const b = svg.getBoundingClientRect(); cols = Math.max(1, Math.ceil(b.width / S)); rows = Math.max(1, Math.ceil(b.height / S)); };
    const place = r => { r.setAttribute('x', Math.floor(Math.random() * cols) * S + 1); r.setAttribute('y', Math.floor(Math.random() * rows) * S + 1); };
    measure();
    const total = Math.min(28, Math.max(10, Math.round(cols * rows / 10)));
    for (let n = 0; n < total; n++) {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('width', S - 1);
      r.setAttribute('height', S - 1);
      r.style.animationDuration = (3.5 + Math.random() * 3).toFixed(2) + 's';
      r.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      place(r);
      r.addEventListener('animationiteration', () => place(r));
      g.append(r);
    }
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(measure, 200); });
  }

  /* Conversas de exemplo no celular do hero, uma por segmento. */
  const SCENES = [
    {
      biz: 'Clínica Bella Pele', route: 'Especialista da clínica · agora',
      card: [['Segmento', 'Estética'], ['Interesse', 'Limpeza de pele'], ['Quando', 'Sábado']],
      script: [
        { who: 'lead', text: 'Oi! Quanto custa a limpeza de pele?' },
        { who: 'rubi', text: 'Oi! Eu sou a Rubi, da Bella Pele. O valor depende do tipo de pele, e a avaliação é sem custo. Prefere vir durante a semana ou no sábado?' },
        { who: 'lead', text: 'Sábado de manhã seria ótimo.' },
        { who: 'rubi', text: 'Perfeito! Já passei tudo para a nossa especialista confirmar o horário com você.' }
      ]
    },
    {
      biz: 'Lar Ideal Imóveis', route: 'Corretor da região · agora',
      card: [['Segmento', 'Imobiliária'], ['Interesse', 'Apto 2 quartos'], ['Quando', 'Esta semana']],
      script: [
        { who: 'lead', text: 'O apartamento de 2 quartos do anúncio ainda está disponível?' },
        { who: 'rubi', text: 'Oi! Eu sou a Rubi, da Lar Ideal. Está sim! Você pensa em comprar à vista ou com financiamento?' },
        { who: 'lead', text: 'Financiamento. Queria visitar esta semana.' },
        { who: 'rubi', text: 'Ótimo! Vou passar para o corretor da região agendar a visita com você.' }
      ]
    },
    {
      biz: 'Escola Fala Mais', route: 'Consultora da escola · agora',
      card: [['Segmento', 'Educação'], ['Interesse', 'Inglês à noite'], ['Quando', 'Mês que vem']],
      script: [
        { who: 'lead', text: 'Vocês têm turma de inglês à noite?' },
        { who: 'rubi', text: 'Oi! Eu sou a Rubi, da Fala Mais. Temos sim! Você vai começar do zero ou já arrisca uma conversa?' },
        { who: 'lead', text: 'Do zero. Queria começar no mês que vem.' },
        { who: 'rubi', text: 'Combinado! Já passei para a consultora marcar uma aula experimental com você.' }
      ]
    }
  ];

  function heroLoop() {
    const thread = $('#hero-thread'), visual = $('#hero-visual');
    if (!thread || !visual) return;
    const lead = $('.card-lead', visual), routeCard = $('.card-route', visual);
    const bizEl = $('#hero-biz'), dl = $('dl', lead), routeText = $('small', routeCard);
    const bubble = (who, text) => { const b = document.createElement('div'); b.className = `pb pb-${who}`; b.textContent = text; thread.append(b); return b; };
    const setScene = s => {
      bizEl.textContent = s.biz;
      routeText.textContent = s.route;
      dl.replaceChildren(...s.card.map(([k, v]) => {
        const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = k; dd.textContent = v; row.append(dt, dd);
        return row;
      }));
    };

    if (reduce.matches) {
      setScene(SCENES[0]);
      SCENES[0].script.forEach(m => bubble(m.who, m.text));
      lead.classList.add('show'); routeCard.classList.add('show');
      return;
    }

    let visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(visual);
    // Espera que congela fora da tela ou com a aba escondida.
    const wait = ms => new Promise(res => {
      let left = ms, last = performance.now();
      const tick = now => { if (visible && !document.hidden) left -= Math.min(now - last, 100); last = now; left <= 0 ? res() : requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });

    (async () => {
      await wait(1100);
      for (let k = 0; ; k = (k + 1) % SCENES.length) {
        setScene(SCENES[k]);
        for (const [n, m] of SCENES[k].script.entries()) {
          if (m.who === 'rubi') {
            const typing = bubble('rubi', '');
            typing.classList.add('pb-typing');
            typing.innerHTML = '<span></span><span></span><span></span>';
            await wait(1300);
            typing.remove();
          }
          bubble(m.who, m.text);
          if (n === 2) { await wait(500); lead.classList.add('show'); }
          if (n === 3) { await wait(700); routeCard.classList.add('show'); }
          await wait(m.who === 'lead' ? 700 : 1500);
        }
        await wait(3600);
        thread.classList.add('is-clearing');
        lead.classList.remove('show'); routeCard.classList.remove('show');
        await wait(600);
        thread.textContent = '';
        thread.classList.remove('is-clearing');
        await wait(500);
      }
    })();
  }

  /* ---------- Conversa ---------- */
  const presentationMode = new URLSearchParams(location.search).get('modo') === 'apresentacao';
  const STORE = presentationMode ? 'rubi-chat-v1' : 'rubi-chat-v1-cliente';
  const site = $('#site'), chat = $('#chat'), scroller = $('#chat-scroll'), list = $('#messages'), welcome = $('#welcome');
  const form = $('#composer'), input = $('#input'), sendBtn = $('#send'), statusEl = $('#agent-status'), toBottom = $('#to-bottom');
  const IDLE = 'Online';
  const baseTitle = document.title;
  const clip = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  const short = (text, max) => text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;

  // Card do lead: mesmo filtro do servidor, só texto curto.
  const TEMPS = { frio: 'Frio', morno: 'Morno', quente: 'Quente' };

  let state;
  let erasing = false;
  let busy = false, chatOpen = false, gen = 0, lastPoint = null, slowTimer = 0;

  function newId() {
    const raw = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    return 'rubi-' + raw;
  }
  const PRIVATE_STORES = ['rubi-chat-v1', 'rubi-chat-v1-cliente', 'rubi-perfil-v1', 'rubi-perfil-v1-cliente', 'rubi-demos-v1', 'rubi-pending-erases-v2'];
  function readStored(key) {
    try {
      const value = readPrivateData(localStorage.getItem(key));
      if (value === null) localStorage.removeItem(key);
      return value;
    } catch { return null; }
  }
  function writeStored(key, value, expiresAt) {
    if (!expiresAt) {
      try {
        const previous = JSON.parse(localStorage.getItem(key));
        if (readPrivateData(JSON.stringify(previous)) !== null) expiresAt = previous.expiresAt;
      } catch { /* novo prazo */ }
    }
    localStorage.setItem(key, packPrivateData(value, expiresAt));
  }
  PRIVATE_STORES.forEach(readStored);
  function blankState() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return { sessionId: newId(), conversationKey: [...bytes].map(n => n.toString(16).padStart(2, '0')).join(''),
      serverStarted: false, expiresAt: Date.now() + TEST_RETENTION_MS, messages: [], lead: {}, handoff: null, feedback: null };
  }
  const cleanLead = (l, profile) => cleanLeadData(l, profile);
  function cleanHandoff(h) {
    const nome = typeof h?.nome === 'string' ? clip(h.nome, 60) : '';
    if (!nome) return null;
    return { nome, cargo: typeof h.cargo === 'string' && clip(h.cargo, 60) || 'Especialista comercial', at: Number(h.at) || Date.now() };
  }
  function load() {
    try {
      const s = readStored(STORE);
      if (s && /^[A-Za-z0-9-]{8,64}$/.test(s.sessionId) && /^[a-f0-9]{64}$/.test(s.conversationKey) && s.expiresAt > Date.now() && Array.isArray(s.messages)) {
        return { sessionId: s.sessionId, conversationKey: s.conversationKey, serverStarted: s.serverStarted === true, expiresAt: s.expiresAt, messages: s.messages, lead: cleanLead(s.lead, s.perfil), handoff: cleanHandoff(s.handoff), feedback: cleanTestFeedback(s.feedback), perfil: Object.hasOwn(s, 'perfil') ? cleanProfile(s.perfil) : undefined };
      }
    } catch { /* sem armazenamento: segue com conversa nova */ }
    return blankState();
  }
  function save() { try { writeStored(STORE, state, state.expiresAt); } catch { /* ignora */ } }

  /* ---------- Perfil do negócio: a Rubi se adapta ao que o visitante contou ---------- */
  const PROFILE_STORE = presentationMode ? 'rubi-perfil-v1' : 'rubi-perfil-v1-cliente';
  const LIMITS = PROFILE_LIMITS;
  const DEMOS_STORE = 'rubi-demos-v1';
  // Conteúdo de serviços consultado no site oficial da V4 Company em 31/10/2026.
  // O roteiro abaixo é uma proposta para demonstração, não um processo comercial oficial.
  const V4_EXAMPLE = {
    segmento: 'Serviços para empresas', empresa: 'V4 Company',
    resumo: 'Assessoria de marketing digital focada em vendas, com soluções de gestão, mídia paga, criativos, páginas, dados, CRM e vendas. As soluções se adaptam à necessidade da empresa. Nesta demo, entenda o negócio e o desafio do lead e encaminhe a um especialista.',
    leadIdeal: 'Empresas que querem melhorar suas vendas com marketing digital e avaliar soluções adequadas ao momento do negócio.',
    campos: [{ key: 'nome', label: 'Nome' }, { key: 'campo_negocio', label: 'Empresa e segmento' }, { key: 'interesse', label: 'Principal desafio de vendas' }]
  };
  const GUESS = [
    [/est[eé]tic|cl[ií]nic|odont|dent[aiu]|sa[uú]de|fisio|psic|nutri|sal[aã]o|beleza|barbear/i, 'Saúde e estética'],
    [/im[oó]ve|imobili|apartament|corretor|alug/i, 'Imobiliária'],
    [/escola|curso|idioma|ingl[eê]s|faculdade|aula|mentoria|treinamento/i, 'Educação e cursos'],
    [/carro|moto|ve[ií]cul|concession|autom[oó]v|seminov/i, 'Automóveis'],
    [/loja|e-?commerce|varejo|roupa|moda|cal[cç]ado|pet ?shop|mercado/i, 'Varejo e e-commerce'],
    [/consultoria|ag[eê]ncia|software|saas|contab|b2b|marketing|sistema/i, 'Serviços para empresas']
  ];

  function loadProfile() {
    try {
      const s = readStored(PROFILE_STORE);
      if (s && typeof s === 'object') return { perfil: cleanProfile(s.perfil), pulou: s.pulou === true, demoId: typeof s.demoId === 'string' ? s.demoId : null };
    } catch { /* sem armazenamento: começa sem perfil */ }
    return { perfil: null, pulou: false };
  }
  function saveProfile() { try { writeStored(PROFILE_STORE, biz); } catch { /* ignora */ } }

  let biz = loadProfile();
  state = load();
  let demos = [];
  try { if (presentationMode) demos = readDemoLibrary(JSON.stringify(readStored(DEMOS_STORE))); } catch { /* biblioteca vazia */ }
  biz = restoreBusiness(biz, state, demos);
  if (state.messages.length && state.perfil === undefined) state.perfil = cleanProfile(biz.perfil);

  const hhmm = at => new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 140;
  function scrollToEnd(smooth = true) {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
  }

  function setStatus(text, live = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle('shimmer', live && !reduce.matches);
  }
  function syncSend() {
    sendBtn.disabled = busy || erasing || Boolean(state.handoff) || !input.value.trim();
    $('#test-prompts').hidden = presentationMode || Boolean(state.handoff);
    $$('[data-test-prompt]').forEach(b => { b.disabled = busy || erasing || Boolean(state.handoff) || Boolean(input.value.trim()); });
  }
  function syncReport() { $$('[data-open-report]').forEach(b => { b.disabled = busy || !state.messages.length; }); }
  const idleStatus = () => state.handoff ? `Atendimento encerrado · com ${firstName(state.handoff.nome)}` : IDLE;

  // *negrito* e **negrito** no estilo WhatsApp, sempre via textContent.
  function segments(text) {
    const out = [], re = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index) });
      out.push({ t: m[1] || m[2], b: true });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ t: text.slice(last) });
    return out;
  }
  function renderRich(el, text, animate) {
    el.textContent = '';
    const words = text.split(/\s+/).filter(Boolean).length || 1;
    const step = Math.min(42, 1500 / words);
    let i = 0;
    for (const s of segments(text)) {
      const host = s.b ? el.appendChild(document.createElement('strong')) : el;
      for (const part of s.t.split(/(\s+)/)) {
        if (!part) continue;
        if (!animate || /^\s+$/.test(part)) { host.append(part); continue; }
        const w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--d', Math.round(i++ * step) + 'ms');
        w.textContent = part;
        host.append(w);
      }
    }
    return Math.round(i * step);
  }

  function messageRow(role, at, animate) {
    const row = document.createElement('div');
    row.className = `msg msg-${role}` + (animate ? '' : ' static');
    if (role === 'bot') row.innerHTML = '<span class="msg-avatar" aria-hidden="true"><svg class="gem"><use href="#gem"/></svg></span>';
    const col = document.createElement('div');
    col.className = 'msg-col';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    col.append(bubble);
    if (at) {
      const meta = document.createElement('span');
      meta.className = 'msg-meta';
      meta.textContent = (role === 'bot' ? 'Rubi · ' : 'Você · ') + hhmm(at);
      col.append(meta);
    }
    row.append(col);
    list.append(row);
    return { row, col, bubble };
  }

  function renderMessage(m, animate) {
    const { bubble } = messageRow(m.role, m.at, animate);
    if (m.role === 'bot') return renderRich(bubble, m.text, animate);
    bubble.textContent = m.text;
    return 0;
  }

  function renderAll() {
    list.textContent = '';
    welcome.classList.remove('is-leaving');
    welcome.hidden = state.messages.length > 0;
    state.messages.forEach(m => renderMessage(m, false));
    if (state.handoff) handoffRow(state.handoff, false);
    renderLead();
    renderHandoff();
    syncSend();
    syncReport();
  }

  /* ---------- Card do lead e encaminhamento ---------- */
  const leadPeek = $('#lead-peek'), leadOwner = $('#lead-owner');
  const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const firstName = name => name.split(/\s+/)[0];

  // Destaca só o que acabou de mudar; o destaque some sozinho.
  function flash(el, on) {
    if (!on || reduce.matches) return;
    el.classList.remove('is-new');
    void el.offsetWidth;
    el.classList.add('is-new');
    clearTimeout(el.flashTimer);
    el.flashTimer = setTimeout(() => el.classList.remove('is-new'), 2000);
  }

  function mergeLead(raw) {
    const changed = [];
    for (const [k, v] of Object.entries(cleanLead(raw, biz.perfil))) if (state.lead[k] !== v) { state.lead[k] = v; changed.push(k); }
    return changed;
  }

  function renderLead(changed = []) {
    const l = state.lead;
    const fields = fieldsForProfile(biz.perfil);
    const filled = fields.filter(f => leadFieldStatus(l[f.key]) === 'known').length;
    const stage = state.handoff ? 'encaminhado' : filled || l.temperatura || l.resumo ? 'qualificando' : 'novo';
    const stageText = { novo: 'Novo lead', qualificando: 'Qualificando', encaminhado: 'Encaminhado' }[stage];
    for (const el of [$('#lead-stage'), $('#peek-stage')]) { el.dataset.stage = stage; el.textContent = stageText; }

    $('#lead-name').textContent = l.nome || 'Novo lead';
    $('#lead-sub').textContent = presentationMode
      ? (l.cidade ? `${l.cidade} · pelo WhatsApp` : 'Chegou pelo WhatsApp')
      : (l.cidade ? `${l.cidade} · atendimento simulado` : 'Dados deste atendimento simulado');
    const avatar = $('#lead-avatar');
    avatar.textContent = '';
    if (l.nome) avatar.textContent = initials(l.nome); else avatar.append(iconEl('user'));
    flash(avatar, changed.includes('nome'));

    const pct = filled / fields.length * 100 + '%';
    $('#lead-fill').style.width = pct;
    $('#peek-fill').style.width = pct;
    $('#lead-count').textContent = `${filled} de ${fields.length} dados conhecidos`;
    $('#peek-count').textContent = `${filled}/${fields.length}`;
    const fieldList = $('#lead-fields');
    if (fieldList.dataset.schema !== JSON.stringify(fields)) {
      fieldList.textContent = '';
      for (const field of fields) {
        const row = document.createElement('div'), label = document.createElement('dt'), value = document.createElement('dd');
        row.dataset.field = field.key; label.textContent = field.label;
        row.append(label, value); fieldList.append(row);
      }
      fieldList.dataset.schema = JSON.stringify(fields);
    }
    for (const row of $$('#lead-fields > div')) {
      const k = row.dataset.field;
      const status = leadFieldStatus(l[k]);
      const value = $('dd', row);
      value.textContent = l[k] || '';
      if (['unknown', 'declined'].includes(status)) {
        const note = document.createElement('small');
        note.className = 'lead-field-status'; note.textContent = leadFieldStatusLabel(status);
        value.append(note);
      }
      row.classList.toggle('is-filled', status === 'known');
      flash(row, changed.includes(k));
    }

    $('#lead-temp').dataset.temp = l.temperatura || '';
    $('#lead-temp-text').textContent = TEMPS[l.temperatura] || 'A definir';
    const resumo = $('#lead-resumo');
    resumo.textContent = l.resumo || 'A Rubi preenche este card sozinha enquanto conversa.';
    resumo.classList.toggle('is-empty', !l.resumo);
    flash(resumo.parentElement, changed.includes('resumo'));
    flash(leadPeek, changed.length > 0);
  }

  // Encaminhado: o card ganha o especialista e a conversa trava até começar outra.
  function renderHandoff(animate = false) {
    const h = state.handoff;
    chatMain.classList.toggle('is-ended', Boolean(h));
    $('#chat-ended').hidden = !h;
    input.disabled = Boolean(h);
    leadOwner.classList.toggle('is-done', Boolean(h));
    const avatar = $('#owner-avatar');
    avatar.textContent = '';
    if (h) {
      avatar.textContent = initials(h.nome);
      $('#owner-name').textContent = h.nome;
      $('#owner-sub').textContent = `${h.cargo} · encaminhamento demonstrativo às ${hhmm(h.at)}`;
      $('#ended-avatar').textContent = initials(h.nome);
      $('#ended-title').textContent = presentationMode ? `Conversa encaminhada para ${h.nome}` : 'Gostou do que viu?';
    } else {
      avatar.append(iconEl('route'));
      $('#owner-name').textContent = 'Aguardando qualificação';
      $('#owner-sub').textContent = 'Quando o lead estiver pronto, a Rubi passa para alguém do time.';
    }
    flash(leadOwner, animate);
    flash(leadPeek, animate);
    renderTestOutcome();
  }

  function renderTestOutcome() {
    const show = !presentationMode && Boolean(state.handoff);
    $('#test-outcome').hidden = !show;
    const feedback = cleanTestFeedback(state.feedback);
    $$('input[name="rating"]').forEach(radio => { radio.checked = radio.value === feedback?.rating; });
    $('#feedback-comment').value = feedback?.comment || '';
    $('#feedback-detail').hidden = !feedback;
    $('#feedback-status').textContent = feedback ? 'Feedback salvo neste navegador. Obrigado!' : '';
    if (!show) return;
    const outcome = createTestOutcome(state.lead, biz.perfil);
    $('#outcome-count').textContent = outcome.collected.length
      ? `${outcome.collected.length} de ${outcome.total} dados previstos são conhecidos nesta conversa.`
      : 'Nenhum dado do roteiro é conhecido nesta conversa.';
    const list = $('#outcome-fields'); list.textContent = '';
    for (const field of [...outcome.collected, ...outcome.unresolved]) {
      const row = document.createElement('div'), label = document.createElement('dt'), value = document.createElement('dd');
      label.textContent = field.label; value.textContent = field.value;
      if (field.status) {
        const note = document.createElement('small');
        note.className = 'lead-field-status'; note.textContent = leadFieldStatusLabel(field.status);
        value.append(note);
      }
      row.append(label, value); list.append(row);
    }
    $('#outcome-missing').hidden = !outcome.missing.length;
    $('#outcome-missing').textContent = `Ainda não informado: ${outcome.missing.join(', ')}.`;
  }

  function handoffRow(h, animate) {
    const row = document.createElement('div');
    row.className = 'msg-system' + (animate ? '' : ' static');
    const tag = document.createElement('span');
    tag.append(iconEl('check'), `${presentationMode ? 'Encaminhada' : 'Encaminhamento simulado'} para ${h.nome} · ${hhmm(h.at)}`);
    row.append(tag);
    list.append(row);
  }

  // No celular o card abre como gaveta.
  const sheetQuery = matchMedia('(max-width: 860px)');
  function openLead() {
    chat.classList.add('lead-open');
    leadPeek.setAttribute('aria-expanded', 'true');
    $('#lead-close').focus({ preventScroll: true });
  }
  function closeLead(restoreFocus = false) {
    if (!chat.classList.contains('lead-open')) return;
    chat.classList.remove('lead-open');
    leadPeek.setAttribute('aria-expanded', 'false');
    if (restoreFocus) leadPeek.focus({ preventScroll: true });
  }

  function hideWelcome() {
    if (welcome.hidden || welcome.classList.contains('is-leaving')) return;
    if (reduce.matches) { welcome.hidden = true; return; }
    welcome.classList.add('is-leaving');
    setTimeout(() => { welcome.hidden = true; welcome.classList.remove('is-leaving'); }, 380);
  }

  function showTyping() {
    const { row, bubble } = messageRow('bot', 0, true);
    row.classList.add('msg-typing');
    row.setAttribute('aria-hidden', 'true');
    bubble.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
    setStatus('digitando…', true);
    scrollToEnd();
    return row;
  }

  const FRIENDLY = {
    tempo_esgotado: 'A Rubi demorou mais que o normal para responder. Tente de novo em instantes.',
    falha_de_rede: 'Não consegui falar com o atendimento agora. Confira sua conexão e tente de novo.',
    sem_conexao: 'Sem conexão com a internet. Confira sua rede e tente de novo.',
    nao_configurado: 'O atendimento ainda não está disponível neste endereço.',
    pedido_invalido: 'Não consegui entender essa mensagem. Tente escrever de outro jeito.',
    resposta_vazia: 'A Rubi não conseguiu montar uma resposta agora. Tente de novo.',
    limite_diario: 'O limite diário desta demonstração foi atingido. Volte mais tarde.',
    limite_uso: 'Você chegou ao limite de uso. Aguarde antes de enviar outra mensagem.',
    limite_conversa: 'Este teste chegou a 30 mensagens. Veja o resumo ou inicie outra conversa.',
    muitos_atendimentos: 'Há vários testes acontecendo. Tente novamente em alguns instantes.',
    resposta_em_andamento: 'Uma resposta ainda está sendo preparada. Aguarde um instante.',
    conversa_negada: 'Não foi possível acessar esta conversa. Inicie um novo teste.',
    capacidade: 'Os testes estão no limite de capacidade. Tente mais tarde.',
    servico_indisponivel: 'O atendimento está indisponível. Tente novamente em instantes.',
    nao_autorizado: 'Seu acesso expirou. Recarregue a página para entrar de novo.'
  };

  function showError(code, text, requestId) {
    const { row, col, bubble } = messageRow('bot', 0, true);
    row.classList.add('msg-error');
    bubble.textContent = FRIENDLY[code] || 'O atendimento encontrou um erro. Tente de novo em instantes.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'retry';
    retry.append(iconEl('refresh'), 'Tentar de novo');
    retry.addEventListener('click', () => { if (busy) return; row.remove(); ask(text, requestId); });
    col.append(retry);
    scrollToEnd();
  }

  async function ask(text, requestId = crypto.randomUUID()) {
    const myGen = gen;
    busy = true; syncSend(); syncReport();
    const typing = showTyping();
    const t0 = performance.now();
    clearTimeout(slowTimer);
    slowTimer = setTimeout(() => setStatus('pensando na melhor resposta…', true), 7000);
    try {
      let res;
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ sessionId: state.sessionId, conversationKey: state.conversationKey, requestId, start: !state.serverStarted, message: text, ...(biz.perfil ? { perfil: biz.perfil } : {}) })
        });
      } catch (e) {
        throw Object.assign(new Error('rede'), { code: navigator.onLine === false ? 'sem_conexao' : 'falha_de_rede', detail: String(e) });
      }
      let data = null;
      try { data = await res.json(); } catch { /* corpo não-JSON */ }
      if (myGen !== gen) return;
      if (res.status === 410) { resetConversation('Este teste expirou. Comece uma nova conversa.'); return; }
      if (!res.ok || !data || !data.ok || typeof data.output !== 'string' || !data.output.trim()) {
        throw Object.assign(new Error('resposta'), { code: res.status === 401 ? 'nao_autorizado' : data?.error, detail: data });
      }
      state.serverStarted = true;
      if (Number.isFinite(data.expiresAt)) state.expiresAt = Math.min(state.expiresAt, data.expiresAt);
      save();
      const elapsed = performance.now() - t0;
      if (elapsed < 650) await sleep(650 - elapsed);
      if (myGen !== gen) return;
      typing.remove();
      const changed = mergeLead(data.lead);
      if (changed.length) { save(); renderLead(changed); }
      // Parágrafos viram balões separados, como no WhatsApp.
      const parts = data.output.trim().split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      for (const [n, part] of parts.entries()) {
        if (myGen !== gen) return;
        if (n > 0) {
          const more = showTyping();
          await sleep(reduce.matches ? 0 : Math.min(450 + part.length * 6, 1000));
          more.remove();
          if (myGen !== gen) return;
        }
        const m = { role: 'bot', text: part, at: Date.now() };
        state.messages.push(m); save();
        const stick = nearBottom();
        const dur = renderMessage(m, true);
        if (stick) scrollToEnd(); else toBottom.hidden = false;
        await sleep(reduce.matches ? 0 : Math.min(dur, 900));
        if (myGen !== gen) return;
        if (stick) scrollToEnd();
      }
      if (myGen !== gen) return;
      const handoff = data.encaminhado === true ? cleanHandoff({ ...data.especialista, at: Date.now() }) : null;
      if (handoff && !state.handoff) {
        state.handoff = handoff; save();
        handoffRow(handoff, true);
        renderLead();
        renderHandoff(true);
        scrollToEnd();
        if (document.activeElement === input || document.activeElement === sendBtn) $(presentationMode ? '#ended-new' : '#outcome-title').focus({ preventScroll: true });
      }
    } catch (err) {
      if (myGen !== gen) return;
      typing.remove();
      console.warn('[rubi] falha no atendimento:', err.code || 'indisponivel');
      showError(err.code, text, requestId);
    } finally {
      if (myGen === gen) { clearTimeout(slowTimer); busy = false; setStatus(idleStatus()); syncSend(); syncReport(); }
    }
  }

  function send(raw) {
    const text = String(raw || '').trim().slice(0, 1500);
    if (!text || busy || erasing || state.handoff) return false;
    expireLocalTest();
    if (!state.messages.length) state.perfil = cleanProfile(biz.perfil);
    hideWelcome();
    const m = { role: 'user', text, at: Date.now() };
    state.messages.push(m); save();
    renderMessage(m, true);
    scrollToEnd();
    ask(text);
    return true;
  }

  function resetConversation(note) {
    if (erasing) return;
    const previous = state;
    // A chave já existe antes da primeira chamada, inclusive durante uma resposta.
    // O servidor guarda uma marca sem conteúdo para impedir recriação atrasada.
    if (previous.messages.length) {
      const pending = readStored('rubi-pending-erases-v2') || [];
      pending.push({ sessionId: previous.sessionId, conversationKey: previous.conversationKey });
      try { writeStored('rubi-pending-erases-v2', pending.slice(-200)); } catch { /* memória expira no servidor */ }
      eraseRemote(previous).then(() => clearPendingErase(previous.sessionId)).catch(() => toast('A exclusão do teste anterior ficou pendente. Tente em Privacidade e exclusão.'));
    }
    gen++;
    busy = false;
    clearTimeout(slowTimer);
    state = blankState();
    state.perfil = cleanProfile(biz.perfil);
    save();
    closeLead();
    closeReport();
    renderAll();
    setStatus(IDLE);
    input.value = ''; autosize(); syncSend();
    if (note) toast(note);
  }
  function newConversation() {
    resetConversation('Nova conversa iniciada');
    focusInput();
  }

  function clearPendingErase(id) {
    try { writeStored('rubi-pending-erases-v2', (readStored('rubi-pending-erases-v2') || []).filter(s => s.sessionId !== id)); } catch { /* sem armazenamento */ }
  }
  async function eraseRemote(snapshot) {
    const response = await fetch('/api/conversation', {
      method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: snapshot.sessionId, conversationKey: snapshot.conversationKey })
    });
    if (!response.ok && response.status !== 410) throw new Error('exclusao_indisponivel');
  }
  async function eraseTest(all = false) {
    const button = $(all ? '#erase-browser' : '#erase-conversation');
    erasing = true; chat.inert = true; button.disabled = true; syncSend();
    const note = $('#privacy-status'); note.textContent = 'Apagando o contexto do teste…';
    const snapshots = [...(all ? ['rubi-chat-v1', 'rubi-chat-v1-cliente'].map(readStored).filter(Boolean) : [state]), ...(readStored('rubi-pending-erases-v2') || [])];
    try {
      await Promise.all(snapshots.filter(s => s.conversationKey).map(async s => { await eraseRemote(s); clearPendingErase(s.sessionId); }));
      gen++; busy = false; clearTimeout(slowTimer);
      if (all) {
        PRIVATE_STORES.forEach(key => localStorage.removeItem(key));
        biz = { perfil: null, pulou: false }; demos = []; applyProfile();
      } else localStorage.removeItem(STORE);
      state = blankState(); state.perfil = cleanProfile(biz.perfil);
      closeLead(); closeReport(); renderAll();
      input.value = ''; autosize(); syncSend(); setStatus(IDLE);
      $('#privacy-confirm').hidden = true;
      note.textContent = all ? 'Dados deste navegador e contexto dos testes removidos.' : 'Conversa, card e feedback apagados deste navegador e da memória ativa da IA.';
    } catch {
      note.textContent = 'Não consegui confirmar a exclusão no servidor. Os dados locais foram mantidos para você tentar novamente.';
    } finally { erasing = false; chat.inert = false; button.disabled = false; syncSend(); }
  }
  function expireLocalTest() {
    PRIVATE_STORES.forEach(readStored);
    if (state.expiresAt <= Date.now()) resetConversation('O prazo deste teste terminou. A conversa foi removida.');
    if (!readStored(PROFILE_STORE) && biz.perfil) {
      biz = { perfil: null, pulou: false }; demos = []; applyProfile();
    }
  }
  async function loadPrivacy() {
    try {
      const r = await fetch('/api/privacy', { credentials: 'same-origin' });
      if (!r.ok) throw new Error();
      const data = await r.json();
      $('#privacy-providers').textContent = data.providers;
      $('#privacy-controller').textContent = data.controller && data.contact
        ? `Responsável: ${data.controller}. Pedidos de privacidade: ${data.contact}.`
        : 'O responsável e o contato de privacidade ainda precisam ser informados antes da abertura ao público. Por enquanto, use apenas dados fictícios.';
    } catch {
      $('#privacy-providers').textContent = 'Não foi possível carregar os detalhes dos fornecedores. Evite enviar dados pessoais até restabelecer a conexão.';
    }
  }

  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  }
  function focusInput() {
    if (setupOpen) $('#setup-title').focus({ preventScroll: true });
    else if (state.handoff) $('#ended-new').focus({ preventScroll: true });
    else if (matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
    else $('#chat-title').focus({ preventScroll: true });
  }

  /* ---------- Tela "Monte sua Rubi" ---------- */
  const setup = $('#setup'), chatMain = $('#chat-main'), resumoEl = $('#f-resumo'), outroEl = $('#seg-outro');
  const segmentSelect = $('#f-segmento');
  let setupOpen = false, pendingResumo = '';
  let editingDemoId = null;
  let draftFields = [], fieldsEdited = false;
  let guidedStep = 0;
  const guidedKeys = [...Object.keys(BRIEFING_LIMITS), 'tipoPreco'];
  const readBriefing = () => Object.fromEntries(guidedKeys.map(key => [key, $('#g-' + key).value]));
  function syncGuidedPrice() {
    $('#guided-price-details').hidden = $('#g-tipoPreco').value !== 'informar';
  }
  function showGuidedStep(step, focus = true) {
    guidedStep = step;
    if (presentationMode) return;
    $$('[data-guided-step]').forEach(section => { section.hidden = Number(section.dataset.guidedStep) !== step; });
    $('#setup-basics').hidden = step !== 0;
    $('#guided-back').hidden = step === 0;
    $('#guided-next').hidden = step === 2;
    $('#setup-start-label').closest('button').hidden = step !== 2;
    $('#guided-position').textContent = `Etapa ${step + 1} de 3`;
    $$('#guided-progress li').forEach((item, index) => {
      if (index === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      item.classList.toggle('is-done', index < step);
    });
    setupError();
    $('.setup-body').scrollTop = 0;
    setup.scrollTop = 0;
    if (focus) (step === 0 ? $('#f-empresa') : $(`#guided-title-${step}`)).focus({ preventScroll: true });
  }
  function validateGuided(step) {
    if (step === 0) {
      if (!clip($('#f-empresa').value, LIMITS.empresa)) return setupError('Informe o nome da sua empresa.', $('#f-empresa'));
      if (segmentSelect.value === 'outro' && !clip(outroEl.value, LIMITS.segmento)) return setupError('Escreva qual é o seu segmento.', outroEl);
    }
    const error = validateBriefingStep(readBriefing(), step);
    return error ? setupError(error.message, $('#g-' + error.field)) : true;
  }
  function fillBriefing(p) {
    const b = cleanBriefing(p?.briefing) || {};
    for (const key of guidedKeys) $('#g-' + key).value = b[key] || '';
    if (!p?.briefing) {
      $('#g-produtos').value = p?.resumo || '';
      $('#g-publico').value = p?.leadIdeal || '';
      const extra = cleanFields(p?.campos)?.filter(f => !['nome', 'interesse'].includes(f.key));
      $('#g-perguntas').value = extra?.length >= 2 ? extra.map(f => f.label).join('\n') : 'Objetivo com a compra\nComo resolve essa necessidade hoje';
      // Descrições legadas maiores ficam disponíveis integralmente, sem truncar silenciosamente.
      $('#g-produtos').maxLength = Math.max(BRIEFING_LIMITS.produtos, (p?.resumo || '').length);
    } else $('#g-produtos').maxLength = BRIEFING_LIMITS.produtos;
    $$('.guided-extra').forEach(detail => { detail.open = false; });
    syncGuidedPrice();
    showGuidedStep(0, false);
  }

  function renderDraftFields() {
    const list = $('#qualification-fields'); list.textContent = '';
    draftFields.forEach((field, index) => {
      const row = document.createElement('div'), input = document.createElement('input'), remove = document.createElement('button');
      row.className = 'qualification-row';
      input.className = 'input'; input.value = field.label; input.maxLength = 48;
      input.setAttribute('aria-label', `Nome do campo ${index + 1}`);
      input.addEventListener('change', () => {
        const label = input.value.trim();
        if (!label || draftFields.some(f => f !== field && f.label.toLocaleLowerCase('pt-BR') === label.toLocaleLowerCase('pt-BR'))) {
          input.value = field.label; $('#fields-feedback').textContent = 'Use um nome diferente e não deixe o campo vazio.'; return;
        }
        if (label !== field.label && !field.key.startsWith('campo_')) field.key = 'campo_' + newId().replace(/[^a-z0-9]/g, '').slice(-20);
        field.label = label; remove.setAttribute('aria-label', `Remover campo ${label}`); fieldsEdited = true; $('#fields-feedback').textContent = ''; toast('Nome do campo atualizado.');
      });
      remove.type = 'button'; remove.className = 'icon-btn'; remove.append(iconEl('x'));
      remove.setAttribute('aria-label', `Remover campo ${field.label}`); remove.disabled = draftFields.length === 1;
      remove.addEventListener('click', () => {
        draftFields = draftFields.filter(f => f !== field); fieldsEdited = true; renderDraftFields();
        $('#fields-feedback').textContent = ''; toast(`${field.label} removido desta demo.`);
        $('#qualification-fields input')?.focus();
      });
      row.append(input, remove); list.append(row);
    });
    $('#fields-count').textContent = `${draftFields.length}/${MAX_FIELDS}`;
    $('#field-add').disabled = draftFields.length >= MAX_FIELDS;
    $('#field-add-toggle').disabled = draftFields.length >= MAX_FIELDS;
  }

  function suggestDraftFields() {
    draftFields = suggestFields({ resumo: resumoEl.value }); fieldsEdited = false; renderDraftFields();
    $('#fields-feedback').textContent = ''; if (presentationMode) toast('Sugestão atualizada. Revise os campos antes de iniciar.');
  }

  let librarySelection = '';
  function closeDemoMenu(restoreFocus = false) {
    $('#demo-options').hidden = true;
    $('#demo-select').setAttribute('aria-expanded', 'false');
    if (restoreFocus) $('#demo-select').focus();
  }
  function chooseDemo(id) {
    editingDemoId = demos.find(d => d.id === id)?.id || null;
    fillSetup(id === 'example-v4' ? V4_EXAMPLE : demos.find(d => d.id === editingDemoId)?.perfil || null);
    $('#demo-save').checked = true;
    closeDemoMenu(true);
  }
  function renderDemoLibrary(selectedId = librarySelection) {
    librarySelection = selectedId || '';
    const options = $('#demo-options'); options.textContent = '';
    const entries = [
      { id: 'example-v4', title: 'Exemplo V4 Company', detail: 'Referência pronta para apresentar' },
      { id: '', title: 'Nova demo', detail: 'Começar com outro negócio' },
      ...demos.map(d => ({ id: d.id, title: d.perfil.empresa, detail: d.perfil.segmento }))
    ];
    $('#demo-selected').textContent = entries.find(d => d.id === librarySelection)?.title || 'Nova demo';
    for (const entry of entries) {
      const option = document.createElement('button');
      option.type = 'button'; option.className = 'demo-option'; option.tabIndex = -1;
      option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(entry.id === librarySelection));
      const title = document.createElement('span'), detail = document.createElement('small');
      title.textContent = entry.title; detail.textContent = entry.detail;
      option.append(title, detail); option.addEventListener('click', () => chooseDemo(entry.id)); options.append(option);
    }
    $('#demo-count').textContent = `${demos.length} ${demos.length === 1 ? 'salva' : 'salvas'}`;
  }
  function openDemoMenu(last = false) {
    const menu = $('#demo-options'), bounds = setup.getBoundingClientRect(), trigger = $('#demo-select').getBoundingClientRect();
    const below = bounds.bottom - trigger.bottom - 12, above = trigger.top - bounds.top - 12;
    const openAbove = below < 160 && above > below;
    menu.classList.toggle('opens-above', openAbove);
    menu.style.maxHeight = Math.max(80, Math.min(320, innerHeight * .42, openAbove ? above : below)) + 'px';
    menu.hidden = false;
    $('#demo-select').setAttribute('aria-expanded', 'true');
    const options = [...$('#demo-options').children];
    (last ? options.at(-1) : options.find(o => o.getAttribute('aria-selected') === 'true') || options[0])?.focus();
  }

  function newDemo() {
    editingDemoId = null;
    renderDemoLibrary();
    fillSetup(null);
    $('#demo-save').checked = true;
    $('#f-empresa').focus();
  }

  function applyProfile() {
    const p = biz.perfil, name = p?.empresa || '';
    $('#chat-title').textContent = name ? `Rubi · ${name}` : 'Rubi';
    $('#side-role').textContent = p ? `SDR com IA · ${p.segmento || 'seu negócio'}` : 'SDR com IA para o seu negócio';
    const seg = $('#biz-seg');
    seg.hidden = !p?.segmento;
    seg.textContent = p?.segmento || '';
    $('#biz-name').textContent = p ? name || 'Sua empresa' : 'Ainda sem perfil';
    $('#biz-text').textContent = p
      ? short(p.resumo || 'Sem descrição. Conte mais para a Rubi responder melhor.', 150)
      : 'Conte o que sua empresa faz e a Rubi passa a atender como alguém do seu time.';
    $('#biz-edit-label').textContent = presentationMode ? (p ? 'Editar perfil' : 'Montar perfil') : (p ? 'Editar negócio' : 'Informar meu negócio');
    $('#welcome-text').textContent = p
      ? 'Já conheço o seu negócio. Agora escreva como se fosse um cliente chegando pelo WhatsApp e veja como eu atendo.'
      : 'Me conte o segmento e o que sua empresa vende, que eu mostro como atenderia os seus clientes.';
    const pills = $('#suggestions');
    pills.textContent = '';
    const pill = (label, onClick, icon) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (icon) { b.className = 'pill-main'; b.append(iconEl(icon)); }
      b.append(label);
      b.addEventListener('click', onClick);
      pills.append(b);
    };
    if (p) ['Oi! Vi o anúncio de vocês', 'Quanto custa?', 'Como funciona?'].forEach(t => pill(t, () => send(t)));
    else {
      pill('Montar minha Rubi', () => openSetup(), 'briefcase');
      pill('O que você faz?', () => send('O que você faz?'));
    }
  }

  function countResumo() {
    const n = resumoEl.value.length;
    const c = $('#resumo-count');
    c.textContent = `${n}/${LIMITS.resumo}`;
    c.classList.toggle('near', n > LIMITS.resumo - 60);
  }
  function syncOutro() { outroEl.hidden = segmentSelect.value !== 'outro'; }
  function setupError(text = '', field = null) {
    $('#setup-error').textContent = text;
    if (field) field.focus();
    return false;
  }

  function fillSetup(p) {
    const known = Array.from(segmentSelect.options).find(c => c.value !== 'outro' && c.value === p?.segmento);
    segmentSelect.value = known ? known.value : p?.segmento ? 'outro' : '';
    outroEl.value = p?.segmento && !known ? p.segmento : '';
    syncOutro();
    $('#f-empresa').value = p?.empresa || '';
    resumoEl.value = p?.resumo || '';
    $('#f-lead').value = p?.leadIdeal || '';
    if (!presentationMode) fillBriefing(p);
    $('#lead-details').hidden = true;
    $('#lead-toggle').setAttribute('aria-expanded', 'false');
    draftFields = cleanFields(p?.campos) || suggestFields(p); fieldsEdited = false;
    renderDraftFields(); $('#field-name').value = ''; $('#fields-feedback').textContent = '';
    $('#field-add-panel').hidden = true; $('#field-add-toggle').setAttribute('aria-expanded', 'false');
    countResumo();
    renderDemoLibrary(editingDemoId || (p?.empresa === V4_EXAMPLE.empresa && p?.resumo === V4_EXAMPLE.resumo ? 'example-v4' : ''));
    setupError();
  }

  function openSetup({ resumo = '' } = {}) {
    if (setupOpen && !resumo) { $('#setup-title').focus({ preventScroll: true }); return; }
    // Texto vindo da chamada final começa um perfil limpo, com o segmento deduzido quando dá.
    closeReport();
    editingDemoId = resumo ? null : demos.find(d => d.id === biz.demoId)?.id || null;
    renderDemoLibrary();
    $('#demo-save').checked = true;
    fillSetup(resumo ? null : biz.perfil || (presentationMode ? V4_EXAMPLE : null));
    if (resumo) {
      resumoEl.value = resumo.slice(0, LIMITS.resumo);
      const guess = GUESS.find(([re]) => re.test(resumo));
      if (guess) { segmentSelect.value = guess[1]; syncOutro(); }
      countResumo();
      suggestDraftFields();
      if (!presentationMode) $('#g-produtos').value = resumo;
    }
    const editing = Boolean(biz.perfil) || state.messages.length > 0;
    $('#setup-title').textContent = presentationMode ? 'Prepare uma demo para o cliente' : 'Teste a IA no seu negócio';
    $('#demo-reset-note').hidden = !state.messages.length;
    $('#setup-cancel').hidden = !editing;
    $('#setup-skip').hidden = editing || !presentationMode;

    setupOpen = true;
    setup.hidden = false;
    chatMain.classList.add('setup-on');
    setup.scrollTop = 0;
    if (chatOpen && chat.classList.contains('is-open')) $('#setup-title').focus({ preventScroll: true });
  }

  function closeSetup() {
    if (!setupOpen) return;
    setupOpen = false;
    closeDemoMenu();
    setup.hidden = true;
    chatMain.classList.remove('setup-on');
    scrollToEnd(false);
  }

  function submitSetup() {
    if (!presentationMode) {
      for (let step = 0; step <= guidedStep; step++) {
        if (step !== guidedStep) {
          const error = validateBriefingStep(readBriefing(), step);
          if (error) { showGuidedStep(step); return setupError(error.message, $('#g-' + error.field)); }
        } else if (!validateGuided(step)) return false;
      }
      if (guidedStep < 2) { showGuidedStep(guidedStep + 1); return; }
    }
    const picked = segmentSelect.value;
    if (presentationMode && !picked) return setupError('Escolha o segmento da sua empresa.', segmentSelect);
    if (!presentationMode && !clip($('#f-empresa').value, LIMITS.empresa)) return setupError('Informe o nome da sua empresa.', $('#f-empresa'));
    if (picked === 'outro' && !clip(outroEl.value, LIMITS.segmento)) return setupError('Escreva qual é o seu segmento.', outroEl);
    if (presentationMode && clip(resumoEl.value, LIMITS.resumo).length < 20) return setupError('Conte um pouco mais sobre o que sua empresa faz, pelo menos uma frase.', resumoEl);
    const briefing = presentationMode ? null : cleanBriefing(readBriefing());
    const summary = briefing ? briefingSummary(briefing) : resumoEl.value;
    const p = cleanProfile({
      segmento: picked === 'outro' ? outroEl.value : picked || GUESS.find(([re]) => re.test(summary))?.[1] || 'Outros serviços',
      empresa: $('#f-empresa').value,
      resumo: summary,
      leadIdeal: presentationMode ? $('#f-lead').value : briefing.publico,
      ...(briefing ? { briefing } : {}),
      campos: presentationMode ? draftFields : fieldsFromBriefing(briefing.perguntas)
    });
    const keep = presentationMode && $('#demo-save').checked;
    if (keep && !p.empresa) return setupError('Informe o nome da empresa para encontrar esta demo depois, ou desmarque a opção de salvar.', $('#f-empresa'));
    let demoId = keep ? editingDemoId || newId() : null;
    if (keep) {
      let next;
      try { next = upsertDemo(demos, demoId, p); }
      catch { return setupError('Você já tem 30 demos salvas. Edite uma delas ou desmarque a opção de salvar.'); }
      try { writeStored(DEMOS_STORE, next); }
      catch { return setupError('O navegador não conseguiu salvar a demo. Libere espaço ou desmarque a opção de salvar para testar sem guardar.'); }
      demos = next;
    }
    const changed = JSON.stringify(p) !== JSON.stringify(biz.perfil) || demoId !== (biz.demoId || null);
    biz = { perfil: p, pulou: false, demoId };
    saveProfile();
    applyProfile();
    closeSetup();
    // Perfil novo pede conversa nova: a Rubi não mistura o negócio antigo com o atual.
    if (changed) resetConversation(state.messages.length ? 'Perfil salvo. Conversa reiniciada.' : 'Rubi pronta para o seu negócio');
    focusInput();
  }

  /* ---------- Resumo da experiência, montado com os dados já recebidos ---------- */
  const reportPanel = $('#demo-report');
  let reportOpen = false, reportOrigin = null, reportContent = '', reportBusiness = '';
  function openReport(event) {
    if (busy || !state.messages.length) return;
    closeSetup();
    closeLead();
    const report = createDemoReport(state, state.perfil === undefined ? biz.perfil : state.perfil);
    reportOrigin = event?.currentTarget || null;
    reportContent = report.content;
    reportBusiness = report.business;
    $('#report-business').textContent = report.business + ' · ' + report.stats;
    $('#report-outcome').textContent = report.outcome;
    $('#report-context').textContent = report.context;
    $('#report-temperature').textContent = report.temperature;
    $('#report-missing').textContent = report.pending;
    $('#report-next').textContent = report.next;
    const fields = $('#report-fields'); fields.textContent = '';
    for (const field of report.fields) {
      const row = document.createElement('div'), label = document.createElement('dt'), value = document.createElement('dd');
      label.textContent = field.label; value.textContent = field.value || 'Não informado';
      if (['unknown', 'declined'].includes(field.status)) {
        const note = document.createElement('small');
        note.className = 'lead-field-status'; note.textContent = leadFieldStatusLabel(field.status);
        value.append(note);
      }
      row.classList.toggle('is-empty', field.status !== 'known');
      row.append(label, value); fields.append(row);
    }
    $('#report-feedback').textContent = '';
    $('#report-copy-fallback').hidden = true;
    $('#report-copy-label').hidden = true;
    reportOpen = true; reportPanel.hidden = false;
    chatMain.classList.add('report-on');
    reportPanel.scrollTop = 0;
    $('#report-title').focus({ preventScroll: true });
  }
  function closeReport(restoreFocus = false) {
    if (!reportOpen) return;
    reportOpen = false; reportPanel.hidden = true;
    chatMain.classList.remove('report-on');
    if (restoreFocus && reportOrigin?.isConnected && !reportOrigin.disabled) reportOrigin.focus({ preventScroll: true });
  }
  async function copyReport() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(reportContent);
      $('#report-feedback').textContent = 'Resumo copiado. Pronto para usar na apresentação.';
    } catch {
      const fallback = $('#report-copy-fallback');
      fallback.value = reportContent; fallback.hidden = false;
      $('#report-copy-label').hidden = false;
      $('#report-feedback').textContent = 'A cópia automática não está disponível. Copie o texto selecionado abaixo.';
      fallback.focus(); fallback.select();
    }
  }
  function downloadReport() {
    const url = URL.createObjectURL(new Blob([reportContent], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    const name = reportBusiness.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    link.download = `rubi-resumo-${name || 'demo'}.txt`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#report-feedback').textContent = 'Arquivo de resumo preparado para baixar.';
  }

  let toastTimer;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  async function checkStatus() {
    try {
      const r = await fetch('/api/status', { credentials: 'same-origin' });
      const s = await r.json();
      if (s && s.configured === false && !busy) setStatus('Indisponível no momento');
    } catch { /* o erro aparece ao enviar */ }
  }

  /* ---------- Rotas: #simulador abre a conversa em tela cheia ---------- */
  let openedFromSite = false;

  function openChat(animate = true) {
    if (chatOpen) return;
    chatOpen = true;
    const p = lastPoint || { x: innerWidth / 2, y: innerHeight / 2 };
    lastPoint = null;
    chat.style.setProperty('--cx', p.x + 'px');
    chat.style.setProperty('--cy', p.y + 'px');
    chat.classList.toggle('no-anim', !animate || reduce.matches);
    // Sem perfil e sem conversa, a primeira tela é "Monte sua Rubi".
    if (pendingResumo || (!biz.perfil && !biz.pulou && !state.messages.length)) {
      openSetup({ resumo: pendingResumo });
      pendingResumo = '';
    }
    chat.hidden = false;
    site.inert = true;
    document.documentElement.classList.add('chat-on');
    document.title = 'Conversa com a Rubi';
    void chat.offsetWidth;
    chat.classList.add('is-open');
    scrollToEnd(false);
    document.fonts?.ready.then(() => chatOpen && scrollToEnd(false));
    setTimeout(() => { if (chatOpen) focusInput(); }, animate && !reduce.matches ? 520 : 0);
    checkStatus();
  }

  function closeChat() {
    if (!chatOpen) return;
    chatOpen = false;
    closeLead();
    closeReport();
    site.inert = false;
    document.documentElement.classList.remove('chat-on');
    document.title = baseTitle;
    chat.classList.remove('is-open');
    const done = () => { if (!chatOpen) chat.hidden = true; };
    if (chat.classList.contains('no-anim') || reduce.matches) done(); else setTimeout(done, 760);
  }

  function route() {
    if (location.hash === '#simulador') openChat(openedFromSite);
    else closeChat();
  }

  function leaveChat() {
    if (openedFromSite) { history.back(); return; }
    history.replaceState(null, '', location.pathname + location.search);
    route();
  }

  function pointFrom(e, el) {
    if (e && e.detail > 0 && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }

  /* ---------- Ligações ---------- */
  chat.classList.toggle('is-client', !presentationMode);
  if (!presentationMode) {
    $('.setup-sub').textContent = 'Preencha os tópicos do seu negócio. Depois, teste a Rubi como se fosse um cliente.';
    $('#guided-progress').hidden = false;
    $('#guided-business').hidden = false;
    $('#setup-start-label').textContent = 'Testar meu atendimento';
    $('#empresa-optional').hidden = true; $('#empresa-help').hidden = true;
    $('#segment-optional').hidden = false;
    $('#f-empresa').required = true;
    $('.head-edit span').textContent = 'Meu negócio';
    $('.head-edit').setAttribute('aria-label', 'Editar meu negócio');
    $('.ended-text p').textContent = 'Tenha uma SDR como esta no seu negócio. Saiba mais com a V4 Company.';
    $('#ended-contact').hidden = false;
    $('#ended-new').textContent = 'Testar de novo';
  }
  $('#guided-next').addEventListener('click', () => { if (validateGuided(guidedStep)) showGuidedStep(guidedStep + 1); });
  $('#guided-back').addEventListener('click', () => showGuidedStep(Math.max(0, guidedStep - 1)));
  $('#g-tipoPreco').addEventListener('change', syncGuidedPrice);
  paintIcons();
  revealOnScroll();
  navShadow();
  heroCycle();
  gridPattern();
  heroLoop();
  applyProfile();
  renderAll();
  setStatus(idleStatus());

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href="#simulador"]');
    if (link) { lastPoint = pointFrom(e, link); openedFromSite = true; }
  });
  $$('[data-close-chat]').forEach(b => b.addEventListener('click', leaveChat));
  $$('[data-open-privacy]').forEach(button => button.addEventListener('click', () => {
    $('#privacy-confirm').hidden = true; $('#privacy-status').textContent = '';
    $('#privacy-dialog').showModal(); loadPrivacy();
  }));
  $('#privacy-close').addEventListener('click', () => $('#privacy-dialog').close());
  $$('[data-erase-choice]').forEach(button => button.addEventListener('click', () => {
    const all = button.dataset.eraseChoice === 'browser';
    $('#privacy-confirm-text').textContent = all
      ? 'Isso remove as conversas, perfis e demos salvas neste navegador e o contexto ativo dos testes. Cópias externas e registros de fornecedores não são apagados aqui. Deseja continuar?'
      : 'Isso remove as mensagens, o card, o feedback e o contexto ativo desta conversa. O perfil do negócio será mantido. Deseja continuar?';
    $('#privacy-confirm').hidden = false;
    $('#erase-conversation').hidden = all; $('#erase-browser').hidden = !all;
    $(all ? '#erase-browser' : '#erase-conversation').focus();
  }));
  $('#erase-cancel').addEventListener('click', () => { $('#privacy-confirm').hidden = true; });
  $('#erase-conversation').addEventListener('click', () => eraseTest());
  $('#erase-browser').addEventListener('click', () => eraseTest(true));
  setInterval(expireLocalTest, 30_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) expireLocalTest(); });
  loadPrivacy();
  $('#new-chat').addEventListener('click', () => {
    if (!state.messages.length && !busy) { toast('Esta conversa já está zerada'); return; }
    newConversation();
  });
  $('#ended-new').addEventListener('click', newConversation);
  $$('[data-test-prompt]').forEach(button => button.addEventListener('click', () => {
    if (busy || state.handoff || input.value.trim()) return;
    input.value = button.dataset.testPrompt;
    autosize(); syncSend(); input.focus();
  }));
  $('#test-feedback').addEventListener('change', () => {
    if (presentationMode || !state.handoff) return;
    $('#feedback-detail').hidden = false;
    $('#feedback-status').textContent = '';
  });
  $('#feedback-comment').addEventListener('input', () => { $('#feedback-status').textContent = ''; });
  $('#test-feedback').addEventListener('submit', event => {
    event.preventDefault();
    if (presentationMode || !state.handoff) return;
    const feedback = cleanTestFeedback({ rating: $('input[name="rating"]:checked')?.value, comment: $('#feedback-comment').value });
    if (!feedback) return;
    const previous = state.feedback;
    state.feedback = feedback;
    try {
      writeStored(STORE, state, state.expiresAt);
      $('#feedback-status').textContent = 'Feedback salvo neste navegador. Obrigado!';
    } catch {
      state.feedback = previous;
      $('#feedback-status').textContent = 'Não foi possível salvar neste navegador. Seu texto continua aqui para tentar novamente.';
    }
  });
  $$('[data-open-report]').forEach(b => b.addEventListener('click', openReport));
  $('#report-back').addEventListener('click', () => closeReport(true));
  $('#report-copy').addEventListener('click', copyReport);
  $('#report-download').addEventListener('click', downloadReport);
  leadPeek.addEventListener('click', openLead);
  $('#lead-close').addEventListener('click', () => closeLead(true));
  $('#lead-scrim').addEventListener('click', () => closeLead(true));
  chat.addEventListener('keydown', e => {
    if (e.key === 'Escape' && reportOpen) { e.stopPropagation(); closeReport(true); return; }
    if (e.key === 'Escape' && chat.classList.contains('lead-open')) { e.stopPropagation(); closeLead(true); }
  });
  sheetQuery.addEventListener('change', e => { if (!e.matches) closeLead(); });

  // O texto da chamada final vira o começo do resumo na tela "Monte sua Rubi".
  $('#cta-form').addEventListener('submit', e => {
    e.preventDefault();
    const field = $('#cta-input');
    const text = field.value.trim();
    if (!text) { field.focus(); return; }
    pendingResumo = text;
    field.value = '';
    lastPoint = pointFrom(null, e.submitter || field);
    openedFromSite = true;
    location.hash = '#simulador';
  });

  $$('[data-edit-profile]').forEach(b => b.addEventListener('click', () => openSetup()));
  $('#demo-select').addEventListener('click', () => {
    if ($('#demo-options').hidden) openDemoMenu(); else closeDemoMenu();
  });
  $('#demo-select').addEventListener('keydown', e => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openDemoMenu(e.key === 'ArrowUp'); }
  });
  $('#demo-options').addEventListener('keydown', e => {
    const options = [...e.currentTarget.children], current = options.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDemoMenu(true); }
    else if (e.key === 'Tab') closeDemoMenu();
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (current + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[index]?.focus();
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.demo-dropdown')) closeDemoMenu(); });
  $('.demo-dropdown').addEventListener('focusout', e => { if (!e.currentTarget.contains(e.relatedTarget)) closeDemoMenu(); });
  $('#demo-new').addEventListener('click', newDemo);
  $('#lead-toggle').addEventListener('click', () => {
    const panel = $('#lead-details'); panel.hidden = !panel.hidden;
    $('#lead-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) $('#f-lead').focus();
  });
  setup.addEventListener('submit', e => { e.preventDefault(); submitSetup(); });
  setup.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#setup-cancel').hidden) { closeSetup(); focusInput(); }
  });
  segmentSelect.addEventListener('change', () => {
    syncOutro();
    setupError();
    if (segmentSelect.value === 'outro') outroEl.focus();
  });
  resumoEl.addEventListener('input', countResumo);
  resumoEl.addEventListener('change', () => {
    if (!fieldsEdited) suggestDraftFields();
    else $('#fields-feedback').textContent = 'Descrição alterada. Confira se os campos ainda fazem sentido para este atendimento.';
  });
  $('#fields-suggest').addEventListener('click', suggestDraftFields);
  function addDraftField() {
    const input = $('#field-name'), label = input.value.trim();
    if (!label) { $('#fields-feedback').textContent = 'Escreva o dado que a Rubi deve descobrir, como quantidade desejada.'; input.focus(); return; }
    if (draftFields.length >= MAX_FIELDS) return;
    if (draftFields.some(f => f.label.toLocaleLowerCase('pt-BR') === label.toLocaleLowerCase('pt-BR'))) {
      $('#fields-feedback').textContent = 'Esse campo já está na lista. Você pode editar o nome acima.'; input.focus(); return;
    }
    const known = { cidade: 'cidade', orçamento: 'orcamento', orcamento: 'orcamento', prazo: 'prazo', nome: 'nome', interesse: 'interesse' }[label.toLocaleLowerCase('pt-BR')];
    const key = known && !draftFields.some(f => f.key === known) ? known : 'campo_' + newId().replace(/[^a-z0-9]/g, '').slice(-20);
    draftFields.push({ key, label }); fieldsEdited = true; renderDraftFields(); input.value = '';
    $('#fields-feedback').textContent = ''; toast(`${label} adicionado ao roteiro.`);
    input.focus();
  }
  $('#field-add-toggle').addEventListener('click', () => {
    const panel = $('#field-add-panel'); panel.hidden = !panel.hidden;
    $('#field-add-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) $('#field-name').focus();
  });
  $('#field-add').addEventListener('click', addDraftField);
  $('#field-name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addDraftField(); } });
  $('#setup-example').addEventListener('click', e => {
    editingDemoId = null; renderDemoLibrary();
    fillSetup(V4_EXAMPLE);
    e.currentTarget.textContent = 'Restaurar exemplo V4';
  });
  $('#setup-cancel').addEventListener('click', () => { closeSetup(); focusInput(); });
  $('#setup-skip').addEventListener('click', () => {
    biz = { perfil: null, pulou: true };
    saveProfile();
    closeSetup();
    focusInput();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (send(input.value)) {
      input.value = ''; autosize(); syncSend();
      sendBtn.classList.remove('fly'); void sendBtn.offsetWidth; sendBtn.classList.add('fly');
    }
  });
  sendBtn.addEventListener('animationend', () => sendBtn.classList.remove('fly'), true);
  input.addEventListener('input', () => { autosize(); syncSend(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });

  scroller.addEventListener('scroll', () => {
    const far = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > 260;
    toBottom.hidden = !far;
  }, { passive: true });
  toBottom.addEventListener('click', () => scrollToEnd());

  addEventListener('hashchange', route);
  route();
  syncSend();
})();
