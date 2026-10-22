import { HostedAI } from './chat-provider.js';
import { getGuideReply } from './chat-knowledge.js';

const root = document.getElementById('academy-chat');
const launcher = root.querySelector('.ach-launcher');
const panel = root.querySelector('.ach-panel');
const log = root.querySelector('.ach-messages');
const form = root.querySelector('.ach-form');
const input = root.querySelector('textarea');
const send = root.querySelector('.ach-send');
const status = root.querySelector('.ach-status');
const aiNotice = root.querySelector('.ach-ai-notice');
const retry = root.querySelector('.ach-retry');
const provider = new HostedAI();
let aiReady = false;
let checked = false;
let checking = false;
let busy = false;
let history = [];
let generation = 0;

function updateMode() {
  status.textContent = checking ? 'Checking hosted chat…' : aiReady ? 'Hosted AI + academy answers' : 'Academy guide answers';
  retry.hidden = aiReady;
  retry.disabled = checking || busy;
}

async function checkAI() {
  if (checking || busy) return;
  checking = true;
  checked = true;
  updateMode();
  try { aiReady = Boolean((await provider.initialize()).available); }
  catch { aiReady = false; }
  finally {
    checking = false;
    aiNotice.textContent = aiReady
      ? 'AI uses the academy’s website and learning notes. No model download or visitor account is needed. AI can make mistakes.'
      : 'Hosted AI is unavailable here. You can still explore the academy using the guide answers, or ask us on Instagram.';
    updateMode();
  }
}

function setOpen(open) {
  panel.hidden = !open;
  launcher.setAttribute('aria-expanded', String(open));
  launcher.setAttribute('aria-label', open ? 'Close Academy chat' : 'Open Academy chat');
  if (open) { input.focus(); if (!checked) checkAI(); }
  else launcher.focus();
}
launcher.addEventListener('click', () => setOpen(panel.hidden));
root.querySelector('.ach-close').addEventListener('click', () => setOpen(false));
root.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false); }
});
retry.addEventListener('click', checkAI);

function addMessage(role, text, source = '') {
  const article = document.createElement('article');
  article.className = 'ach-message ach-' + role;
  const who = document.createElement('span');
  who.className = 'ach-who';
  who.textContent = role === 'user' ? 'You' : 'Academy helper';
  const content = document.createElement('p');
  content.textContent = text;
  const meta = document.createElement('small');
  meta.textContent = source;
  article.append(who, content, meta);
  log.append(article);
  while (log.children.length > 40) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
  return { article, content, meta };
}

function guideMessage(reply, prefix = '') {
  const message = addMessage('assistant', prefix + reply.answer, reply.source);
  const link = document.createElement('a');
  link.href = reply.link;
  link.textContent = reply.label;
  if (reply.link.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  else link.addEventListener('click', () => setOpen(false));
  message.article.append(link);
  log.scrollTop = log.scrollHeight;
  return message;
}

function remember(question, answer) {
  history = [...history.slice(-2), { role: 'user', content: question }, { role: 'assistant', content: answer }];
}

function setBusy(value) {
  busy = value;
  input.disabled = value;
  send.textContent = value ? 'Stop' : 'Send ↗';
  send.setAttribute('aria-label', value ? 'Stop AI response' : 'Send message');
  root.querySelectorAll('[data-chat-question]').forEach(button => { button.disabled = value; });
  updateMode();
}

async function submit(question) {
  question = question.trim().slice(0, 600);
  if (!question || busy) return;
  addMessage('user', question);
  input.value = '';
  const reply = getGuideReply(question);
  if (!aiReady || reply.business || ['fragrance', 'testing'].includes(reply.id)) {
    guideMessage(reply);
    remember(question, reply.answer);
    input.focus();
    return;
  }
  const current = ++generation;
  setBusy(true);
  status.textContent = 'Thinking…';
  const message = addMessage('assistant', 'Thinking…', 'Hosted AI');
  try {
    const result = await provider.generate([...history.slice(-4), { role: 'user', content: question }]);
    if (current !== generation) return;
    if (typeof result.answer !== 'string' || !result.answer.trim()) throw new Error('Empty reply');
    message.content.textContent = result.answer;
    message.meta.textContent = result.source;
    remember(question, result.answer);
  } catch (error) {
    if (current !== generation) return;
    if (error.name === 'AbortError') {
      message.content.textContent = 'Response stopped.';
      message.meta.textContent = 'Hosted AI · Stopped';
    } else {
      aiReady = false;
      message.article.remove();
      guideMessage(reply, 'AI couldn’t finish that reply. Here is a guide answer instead. ');
      remember(question, reply.answer);
      aiNotice.textContent = 'Hosted AI is unavailable right now. Guide answers still work. You can retry the connection below.';
    }
  } finally {
    if (current === generation) {
      setBusy(false);
      if (!panel.hidden) input.focus();
    }
  }
}

form.addEventListener('submit', event => { event.preventDefault(); if (busy) provider.dispose(); else submit(input.value); });
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
});
root.querySelectorAll('[data-chat-question]').forEach(button => button.addEventListener('click', () => submit(button.dataset.chatQuestion)));
root.querySelector('.ach-reset').addEventListener('click', () => {
  ++generation;
  provider.dispose();
  setBusy(false);
  history = [];
  log.replaceChildren();
  welcome();
  input.focus();
});
function welcome() { addMessage('assistant', 'Hi! I can help you explore the PDF guide, 1:1 guidance, and candle-making basics. Where are you starting?', 'Academy guide helper'); }
welcome();
updateMode();
window.addEventListener('pagehide', () => provider.dispose());
