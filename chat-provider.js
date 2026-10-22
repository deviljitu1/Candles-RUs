export class HostedAI {
  constructor(fetcher = globalThis.fetch.bind(globalThis)) {
    this.fetcher = fetcher;
  }

  async request(options = {}) {
    this.controller = new AbortController();
    const controller = this.controller;
    const timer = setTimeout(() => controller.abort(new Error('Chat timed out.')), 25000);
    try {
      const response = await this.fetcher('/api/chat', {
        ...options, signal: controller.signal, credentials: 'same-origin', cache: 'no-store'
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'Please wait a minute before trying again.' : 'Hosted chat is unavailable.');
      return await response.json();
    } finally {
      clearTimeout(timer);
      if (this.controller === controller) this.controller = null;
    }
  }

  initialize() { return this.request(); }
  generate(messages) {
    return this.request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
  }
  dispose() { this.controller?.abort(); }
}
