// A base pública é só um endereço. Nenhuma credencial vai para o navegador.
export function createApiClient(base = '', send = globalThis.fetch.bind(globalThis)) {
  let origin = '';
  if (base) {
    const url = new URL(base);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Endereço da API inválido');
    origin = url.origin;
  }
  return (path, options = {}) => {
    if (!/^\/api\/(chat|status|privacy|conversation)$/.test(path)) throw new Error('Rota da API inválida');
    return send(origin + path, origin ? {
      ...options, credentials: 'omit', mode: 'cors',
      headers: { ...options.headers, 'ngrok-skip-browser-warning': '1' },
    } : options);
  };
}
