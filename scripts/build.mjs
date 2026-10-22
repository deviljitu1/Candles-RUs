import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const publicFiles = ['index.html', 'academy.css', 'academy.js', 'chatbot.css', 'chatbot.js', 'chat-provider.js', 'chat-knowledge.js', 'assets'];
await mkdir(output, { recursive: true });
await rm(path.join(output, 'chat-ai-worker.js'), { force: true });
for (const file of publicFiles) await cp(path.join(root, file), path.join(output, file), { recursive: true });

const html = await readFile(path.join(root, 'index.html'), 'utf8');
const content = [html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1], html.match(/<dialog\b[^>]*>([\s\S]*?)<\/dialog>/i)?.[1]].filter(Boolean).join('\n');
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const context = content.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<!--[^]*?-->/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&([a-z]+);/gi, (match, name) => entities[name] || match)
  .replace(/\s+/g, ' ').trim();
if (!context.includes('1:1') || !context.includes('PDF')) throw new Error('Missing academy website context.');
await mkdir(path.join(root, '.generated'), { recursive: true });
await writeFile(path.join(root, '.generated/site-context.js'), `export default ${JSON.stringify(context)};\n`);
console.log('Built site in dist/ and refreshed server-side website context for chat.');
