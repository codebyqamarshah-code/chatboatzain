
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM = `You are Zain Durani AI, a helpful, accurate, professional general-purpose assistant. Answer questions across topics, understand follow-up context, adapt to the user's language (including Urdu and Roman Urdu), and provide clear practical answers. Be honest about uncertainty and capabilities. Never claim to have browsed or performed actions unless true. Format code and explanations clearly.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || !messages.length || messages.length > 60) {
      return Response.json({ error: 'Invalid message history.' }, { status: 400 });
    }

    const safe = messages
      .filter(m => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 20000) }));

    if (!safe.length) {
      return Response.json({ error: 'No valid messages provided.' }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return Response.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        systemInstruction: SYSTEM,
      });

      const history = safe.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(safe.at(-1).content);
      const text = result.response.text();

      return new Response(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const rawKey = process.env.GROQ_API_KEY || '';
    const apiKey = rawKey.trim();

    if (!apiKey) {
      return Response.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    if (!/^[\x21-\x7E]+$/.test(apiKey)) {
      return Response.json({
        error: 'Your Groq API key contains invalid characters. Please replace it in Vercel Environment Variables.',
      }, { status: 500 });
    }

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        messages: [{ role: 'system', content: SYSTEM }, ...safe],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      return Response.json({
        error: `AI provider error (${upstream.status}): ${details.slice(0, 600)}`,
      }, { status: upstream.status });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (e) {
    return Response.json({
      error: e?.message || 'Unexpected server error.',
    }, { status: 500 });
  }
}
