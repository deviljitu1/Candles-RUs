# Candles RUs Academy

Candle-making PDF guides and 1:1 guidance, with the original geometric design and animations retained. Enquiries go to [@candlesrusacademy](https://www.instagram.com/candlesrusacademy/). Prices, payment, delivery and session arrangements need confirmation. Photos, covers and sample pages are labelled concepts.

## Deploy on Netlify

Import this repository and deploy `main`. Settings are supplied in `netlify.toml`:

- Build: `npm run build`
- Publish: `dist`
- Functions: `netlify/functions`
- Node: 22; no npm dependencies

The hosted chatbot uses [Groq](https://console.groq.com/docs/models) with `openai/gpt-oss-20b` when `GROQ_API_KEY` is set. Add that key privately in Netlify's project environment variables, then redeploy. This works on the existing Free Legacy plan; no Netlify plan change is required. No visitor login or model download is needed. Groq account quotas and rate limits apply. Optional `GROQ_MODEL` selects another compatible Groq model.

If no Groq key is set, the existing OpenRouter/Netlify AI Gateway option remains available using `OPENROUTER_API_KEY` and `OPENROUTER_BASE_URL`. Netlify only injects Gateway credentials on credit-based plans with AI features enabled and a production deploy. Gateway usage consumes Netlify credits. Optional `CHAT_MODEL` overrides the OpenRouter default `qwen/qwen3.5-9b`. Never put provider keys in frontend files or Git.

Use a Git-connected deployment to include the function. Uploading only `dist` to Netlify Drop or GitHub Pages provides the website and curated guide answers, without hosted AI.

## Chat knowledge and privacy

- `chat-knowledge.js` holds approved academy facts and guide replies. Update it when real pricing, delivery or 1:1 arrangements are confirmed.
- Each build extracts the current page and concept samples into `.generated/site-context.js`, bundled only into the server function. Rebuild/redeploy after website edits to refresh AI context. This is reference grounding, not model training.
- The server creates the system prompt. Client-supplied system roles are rejected. Prices, logistics and material-specific testing questions use curated replies. Other candle-making questions use hosted AI with recent conversation context.
- Questions and up to two previous exchanges are sent to the hosted service. The app does not persist chat history or log messages. Service providers may process/retain data according to their policies. AI answers can be wrong; supplier instructions and full burn testing still apply.
- The endpoint limits input/history and output length, uses a 20-second upstream timeout and configures 10 requests per IP per minute on Netlify. Verify the rate-limit rule is applied after deployment. This is not a total spending cap.
- If the service is unconfigured, unavailable or rate limited, labelled guide answers remain available. The UI never presents these as generated AI replies.

## Local checks

```sh
npm run check
npm run preview
```

Open the printed localhost URL. Rebuild after edits. Local preview serves `/api/chat` with the same handler; without private provider environment variables it intentionally uses guide answers. Tests mock hosted inference and cover provider selection, routing, grounding, validation, rate limits, failure handling and cancellation. Check a live AI answer after deployment with the private Groq key configured.
