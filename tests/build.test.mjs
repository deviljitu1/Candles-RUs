import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
test('production build publishes only public site files, without model downloads or private server files', async () => {
  const output = readdirSync(path.join(root, 'dist')).sort();
  assert.deepEqual(output, ['academy.css', 'academy.js', 'assets', 'chat-knowledge.js', 'chat-provider.js', 'chatbot.css', 'chatbot.js', 'index.html'].sort());
  const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  assert.match(html, /src="chatbot.js"/);
  assert.match(html, /id="academy-chat"/);
  assert.doesNotMatch(html, /cloudflareinsights/);
  assert.doesNotMatch(html, /on-device AI|WebGPU|Cancel download/);
  const { default: context } = await import('../.generated/site-context.js');
  for (const phrase of ['PDF', '1:1', 'Illustrative concept content', 'Start with the candle', 'START']) assert.ok(context.includes(phrase));
  assert.doesNotMatch(context, /<script|<svg|gsap\./);
  const { default: handler, config } = await import('../netlify/functions/chat.mjs');
  assert.equal(typeof handler, 'function');
  assert.equal(config.path, '/api/chat');
  assert.equal(config.rateLimit.windowLimit, 10);
});
