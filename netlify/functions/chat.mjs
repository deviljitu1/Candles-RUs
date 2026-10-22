import siteContext from '../../.generated/site-context.js';
import { createChatHandler } from '../../server/chat-handler.js';

export default createChatHandler({ siteContext });

export const config = {
  path: '/api/chat',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
