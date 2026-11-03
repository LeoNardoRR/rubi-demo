/* Regras locais da demonstração; sem chamadas de rede. */
export const PROFILE_LIMITS = { segmento: 60, empresa: 80, resumo: 4000, leadIdeal: 300 };
export const BRIEFING_LIMITS = { produtos: 600, publico: 300, funcionamento: 400, diferenciais: 300, perguntas: 400, precos: 400, proximoPasso: 400, duvidas: 500, objecoes: 500 };
export const MAX_DEMOS = 30;
const text = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
export const MAX_FIELDS = 8;
export const DEFAULT_FIELDS = [
  { key: 'nome', label: 'Nome' }, { key: 'cidade', label: 'Cidade' },
  { key: 'interesse', label: 'Interesse' }, { key: 'prazo', label: 'Prazo' },
  { key: 'orcamento', label: 'Orçamento' }
];
const coreKeys = new Set(DEFAULT_FIELDS.map(f => f.key));
const compact = (v, max) => typeof v === 'string' || typeof v === 'number'
  ? String(v).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
export function cleanBriefing(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const [key, max] of Object.entries(BRIEFING_LIMITS)) {
    const value = key === 'perguntas' ? text(raw[key], max) : compact(raw[key], max);
    if (value) out[key] = value;
  }
  if (['informar', 'sob_consulta', 'nao_se_aplica'].includes(raw.tipoPreco)) out.tipoPreco = raw.tipoPreco;
  if (out.tipoPreco !== 'informar') delete out.precos;
  return out.produtos ? out : null;
}
export function fieldsFromBriefing(questions) {
  const labels = typeof questions === 'string' ? questions.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
  const fields = [{ key: 'nome', label: 'Nome' }, { key: 'interesse', label: 'Interesse' }];
  const seen = new Set(['nome', 'interesse']);
  for (const label of labels) {
    const normalized = label.toLocaleLowerCase('pt-BR');
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    let hash = 2166136261;
    for (const char of normalized) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    fields.push({ key: 'campo_' + hash.toString(36), label: label.slice(0, 48) });
  }
  return cleanFields(fields);
}
export function validateBriefingStep(raw, step) {
  const required = step === 0 ? [['produtos', 'Conte quais produtos ou serviços oferece.'], ['publico', 'Descreva quem sua empresa atende.']]
    : step === 1 ? [['funcionamento', 'Explique como funciona seu atendimento ou serviço.'], ['perguntas', 'Informe pelo menos dois dados para a Rubi descobrir.']]
    : [['proximoPasso', 'Explique o próximo passo após a qualificação.']];
  for (const [field, message] of required) if (!text(raw[field], 500)) return { field, message };
  if (step === 0 && raw.produtos.length > BRIEFING_LIMITS.produtos) return { field: 'produtos', message: 'Resuma os produtos e serviços em até 600 caracteres. Os demais detalhes têm campos nas próximas etapas.' };
  if (step === 1) {
    const labels = raw.perguntas.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (labels.some(s => s.length > 48)) return { field: 'perguntas', message: 'Use até 48 caracteres por dado, um por linha.' };
    const unique = new Set(labels.map(s => s.toLocaleLowerCase('pt-BR')).filter(s => !['nome', 'interesse'].includes(s)));
    if (unique.size < 2 || unique.size > 6) return { field: 'perguntas', message: 'Defina de 2 a 6 dados diferentes além de nome e interesse, um por linha.' };
  }
  if (step === 2 && !['informar', 'sob_consulta', 'nao_se_aplica'].includes(raw.tipoPreco)) return { field: 'tipoPreco', message: 'Escolha como a Rubi deve tratar os preços.' };
  if (step === 2 && raw.tipoPreco === 'informar' && !text(raw.precos, 400)) return { field: 'precos', message: 'Informe os valores e condições que a Rubi pode apresentar.' };
  return null;
}
export function briefingSummary(raw) {
  const b = cleanBriefing(raw);
  if (!b) return '';
  const prices = { informar: 'Valores informados pela empresa', sob_consulta: 'Sob consulta; especialista confirma valores', nao_se_aplica: 'Preço não se aplica a este atendimento' };
  return [
    ['Produtos e serviços', b.produtos], ['Público atendido', b.publico], ['Como funciona', b.funcionamento],
    ['Diferenciais', b.diferenciais], ['Preços', prices[b.tipoPreco]],
    ['Valores e condições', b.tipoPreco === 'informar' ? b.precos : ''], ['Próximo passo após qualificar', b.proximoPasso],
    ['Dúvidas frequentes e respostas', b.duvidas], ['Objeções e respostas', b.objecoes]
  ].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join('\n');
}
export function cleanFields(raw) {
  if (!Array.isArray(raw)) return null;
  const fields = [], keys = new Set(), labels = new Set();
  for (const field of raw) {
    const key = typeof field?.key === 'string' ? field.key : '';
    const label = compact(field?.label, 48);
    const normalized = label.toLocaleLowerCase('pt-BR');
    if ((!coreKeys.has(key) && !/^campo_[a-z0-9_]{1,32}$/.test(key)) || !label || keys.has(key) || labels.has(normalized)) continue;
    keys.add(key); labels.add(normalized); fields.push({ key, label });
    if (fields.length === MAX_FIELDS) break;
  }
  return fields.length ? fields : null;
}
export const fieldsForProfile = profile => cleanFields(profile?.campos) || DEFAULT_FIELDS.map(f => ({ ...f }));
// Classifica o valor sem apagá-lo. Negativas úteis (ex.: “não tenho experiência”)
// continuam sendo dados conhecidos; só marcadores de ausência/recusa são excluídos.
export function leadFieldStatus(value) {
  const normalized = compact(value, 120).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[.!?]+$/g, '').trim();
  if (!normalized) return 'missing';
  if (/^(?:(?:eu|ele|ela|o lead|a lead|cliente|o cliente|a cliente) )?(?:prefiro|prefere|preferiu|preferimos|optou por|optei por) nao (?:informar|compartilhar|responder|dizer|divulgar)\b/.test(normalized)
    || /^(?:nao (?:quero|quer|quis|desejo|deseja) (?:informar|compartilhar|responder|dizer|divulgar)|recusou(?:-se)? (?:a |em )?(?:informar|compartilhar|responder|dizer|divulgar))\b/.test(normalized)) return 'declined';
  if (/^(?:null|undefined|n\/a|[-–—]|nao informado|nao informada|desconhecido|desconhecida|a definir|a confirmar|indefinido|indefinida|nao definido|nao definida|sem definicao|nao sei|nao sabe|ainda nao sei|ainda nao sabe|nao sei ainda|nao sabe ainda)$/.test(normalized)
    || /^(?:(?:eu|ele|ela|o lead|a lead|cliente|o cliente|a cliente) )?(?:ainda )?nao (?:sei|sabe|sabemos) (?:informar|dizer|responder)(?: ainda| agora| ao certo)?$/.test(normalized)
    || /^(?:nao (?:sei|sabe) (?:qual (?:e|o|a) |meu |seu |o |a |os |as )?(?:nivel|horario|horarios|disponibilidade|orcamento|prazo)|sem (?:orcamento|prazo|horario|horarios) definid[oa]s?)(?: ainda| agora| ao certo)?$/.test(normalized)) return 'unknown';
  return 'known';
}
export const leadFieldStatusLabel = status => ({ unknown: 'Não sabe informar', declined: 'Preferiu não informar', missing: 'Não informado' })[status] || '';
export function createTestOutcome(rawLead, profile) {
  const lead = cleanLeadData(rawLead, profile);
  const fields = fieldsForProfile(profile);
  return {
    collected: fields.filter(f => leadFieldStatus(lead[f.key]) === 'known').map(f => ({ label: f.label, value: lead[f.key] })),
    unresolved: fields.filter(f => ['unknown', 'declined'].includes(leadFieldStatus(lead[f.key]))).map(f => ({ label: f.label, value: lead[f.key], status: leadFieldStatus(lead[f.key]) })),
    missing: fields.filter(f => !lead[f.key]).map(f => f.label),
    total: fields.length
  };
}
export function cleanTestFeedback(raw) {
  if (!raw || !['sim', 'em_parte', 'nao'].includes(raw.rating)) return null;
  return { rating: raw.rating, comment: text(raw.comment, 500) };
}
export function suggestFields(profile) {
  const description = compact(profile?.resumo, PROFILE_LIMITS.resumo).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const fields = [{ key: 'nome', label: 'Nome' }, { key: 'interesse', label: 'Interesse' }];
  const add = (key, label) => { if (!fields.some(f => f.key === key)) fields.push({ key, label }); };
  if (/cidade|regiao|bairro|entrega|presencial|visita|localizacao/.test(description)) add('cidade', 'Cidade');
  if (/prazo|urgencia|quando|previsao|data|agend|consulta|avaliacao/.test(description)) add('prazo', /agend|consulta|avaliacao/.test(description) ? 'Disponibilidade para atendimento' : 'Prazo');
  // Solicitar um orçamento não significa ter uma verba definida para comprar.
  if (/verba|budget|faixa de investimento|quanto (pode|pretende) investir|orcamento (disponivel|maximo)|limite de (orcamento|investimento)/.test(description)) add('orcamento', 'Faixa de investimento');
  if (/quantidade|atacado|unidades|lotes/.test(description)) add('campo_quantidade', 'Quantidade desejada');
  if (/financia|consorcio|forma de (compra|pagamento)/.test(description)) add('campo_forma_compra', 'Forma de compra');
  if (/imoveis|imovel|apartamento|casa para (comprar|alugar)/.test(description)) add('campo_tipo_imovel', 'Tipo de imóvel');
  if (/curso|aulas|escola/.test(description) && /online|presencial|hibrid/.test(description)) add('campo_modalidade', 'Modalidade de preferência');
  return fields.slice(0, MAX_FIELDS);
}
export function cleanLeadData(raw, profile) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  const limits = { nome: 60, cidade: 60, interesse: 120, prazo: 60, orcamento: 60, temperatura: 10, resumo: 280 };
  for (const f of fieldsForProfile(profile)) if (!coreKeys.has(f.key)) limits[f.key] = 120;
  for (const [key, max] of Object.entries(limits)) {
    const value = compact(raw[key], max);
    if (value) out[key] = value;
  }
  if (out.temperatura && !['frio', 'morno', 'quente'].includes(out.temperatura)) delete out.temperatura;
  return out;
}

export function cleanProfile(p) {
  if (!p || typeof p !== 'object') return null;
  const out = {};
  for (const [key, max] of Object.entries(PROFILE_LIMITS)) {
    const value = compact(p[key], max);
    if (value) out[key] = value;
  }
  const campos = cleanFields(p.campos);
  if (campos) out.campos = campos;
  const briefing = cleanBriefing(p.briefing);
  if (briefing) {
    out.briefing = briefing;
    out.resumo = briefingSummary(briefing);
    out.leadIdeal = briefing.publico || '';
  }
  return out.segmento || out.resumo ? out : null;
}

export function readDemoLibrary(raw) {
  try {
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries.flatMap(entry => {
      const perfil = cleanProfile(entry?.perfil);
      if (!/^[A-Za-z0-9-]{8,64}$/.test(entry?.id) || seen.has(entry.id) || !perfil?.empresa || !perfil.segmento || (perfil.resumo?.length || 0) < 20) return [];
      seen.add(entry.id);
      return [{ id: entry.id, perfil }];
    }).slice(0, MAX_DEMOS);
  } catch { return []; }
}

export function upsertDemo(demos, id, perfil) {
  const others = demos.filter(d => d.id !== id);
  if (others.length >= MAX_DEMOS) throw new Error('library_full');
  return [{ id, perfil: cleanProfile(perfil) }, ...others];
}

export function restoreBusiness(business, state, demos) {
  if (!state.messages.length) return business;
  // Ausência significa conversa legada; null significa conversa iniciada sem perfil.
  const perfil = state.perfil === undefined ? business.perfil : state.perfil;
  const match = demos.find(d => JSON.stringify(d.perfil) === JSON.stringify(perfil));
  return { perfil, pulou: !perfil, demoId: match?.id || null };
}

const TEMPERATURE = { frio: 'Frio', morno: 'Morno', quente: 'Quente' };
export function createDemoReport(state, profile) {
  const lead = state.lead || {};
  const replies = state.messages.filter(m => m.role === 'bot').length;
  const questions = state.messages.filter(m => m.role === 'user').length;
  const fields = fieldsForProfile(profile).map(({key, label}) => ({ key, label, value: compact(lead[key], 120), status: leadFieldStatus(lead[key]) }));
  const missing = fields.filter(f => f.status === 'missing').map(f => f.label.toLocaleLowerCase('pt-BR'));
  const unresolved = fields.filter(f => ['unknown', 'declined'].includes(f.status));
  const business = profile?.empresa || profile?.segmento || 'Demonstração sem perfil de empresa';
  const outcome = state.handoff ? 'Etapa da Rubi concluída · encaminhamento demonstrativo'
    : replies ? 'Conversa em andamento · resumo parcial' : 'Ainda sem resposta da Rubi · resumo parcial';
  const context = text(lead.resumo, 280) || 'A Rubi ainda não retornou um resumo para esta conversa.';
  const temperature = 'Temperatura indicada pela IA: ' + (TEMPERATURE[lead.temperatura] || 'ainda não definida') + '. Essa classificação precisa de validação comercial.';
  const pending = [
    missing.length ? 'Ainda falta confirmar: ' + missing.join(', ') + '.' : '',
    unresolved.length ? 'Dados ainda não conhecidos: ' + unresolved.map(f => `${f.label.toLocaleLowerCase('pt-BR')} (${leadFieldStatusLabel(f.status).toLocaleLowerCase('pt-BR')})`).join(', ') + '. Não insistir em dados recusados.' : '',
    !missing.length && !unresolved.length ? 'Todos os dados definidos para esta demo foram preenchidos. Isso não confirma uma venda.' : ''
  ].filter(Boolean).join(' ');
  const next = state.handoff
    ? `Na demonstração, ${state.handoff.nome} (${state.handoff.cargo}) assumiria com este contexto. Próximo passo sugerido: validar os dados e combinar o atendimento com o lead.`
    : 'Próximo passo sugerido: continuar a conversa e validar interesse e condições antes de encaminhar ao time.';
  const scope = 'Encaminhamento simulado. Nenhum vendedor, CRM ou WhatsApp recebeu esta conversa.';
  const stats = `${questions} ${questions === 1 ? 'mensagem enviada' : 'mensagens enviadas'} · ${replies} ${replies === 1 ? 'balão de resposta' : 'balões de resposta'}`;
  const content = [
    'Rubi · Resumo da demonstração', business, profile?.segmento || '', outcome, stats,
    '', 'Contexto para o vendedor', context, '', 'Dados captados na conversa',
    ...fields.map(f => `${f.label}: ${f.value || 'Não informado'}${['unknown', 'declined'].includes(f.status) ? ` (${leadFieldStatusLabel(f.status)}; não conta como dado conhecido)` : ''}`),
    '', 'Qualificação e próximo passo', temperature, pending, next, '', scope
  ].filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');
  return { business, outcome, context, fields, temperature, pending, next, stats, content };
}

// Dados de teste persistidos no navegador têm prazo absoluto; não renovar ao ler.
export const TEST_RETENTION_MS = 24 * 60 * 60 * 1000;
export function readPrivateData(raw, now = Date.now()) {
  try {
    const envelope = JSON.parse(raw);
    return envelope?.version === 2 && Number.isFinite(envelope.expiresAt) &&
      envelope.expiresAt > now && envelope.expiresAt <= now + TEST_RETENTION_MS
      ? envelope.value : null;
  } catch { return null; }
}
export function packPrivateData(value, expiresAt = Date.now() + TEST_RETENTION_MS) {
  return JSON.stringify({ version: 2, expiresAt, value });
}
