import { FastifyReply, FastifyRequest } from 'fastify';
import { GoogleGenAI } from '@google/genai';

export class GenAIController {
    private ai: GoogleGenAI | null = null;

    private getClient() {
        if (!this.ai) {
            const key = process.env.GEMINI_API_KEY;
            if (!key) {
                throw new Error('GEMINI_API_KEY não está definida');
            }
            this.ai = new GoogleGenAI({ apiKey: key as string });
        }
        return this.ai;
    }

    async generate(request: FastifyRequest, reply: FastifyReply) {
        try {
            const body = request.body as any;
            const prompt = body?.prompt || body?.text || '';
            const model = body?.model || 'gemini-flash-latest';

            if (!prompt || typeof prompt !== 'string') {
                return reply.status(400).send({ error: 'Campo "prompt" é obrigatório e deve ser string.' });
            }

            const client = this.getClient();

            const response = await client.models.generateContent({
                model,
                contents: [{ parts: [{ text: prompt }] }],
            });

            // Some versions return .text, others nested fields — normalize
            const text = (response && (response as any).text) || (response && (response as any).candidates && (response as any).candidates[0]?.content?.text) || null;

            return reply.send({ text, raw: response });
        }
        catch (err: any) {
            request.log.error('GenAI generate error', err);
            const message = err?.message || 'Erro ao chamar GenAI';
            return reply.status(500).send({ error: message });
        }
    }
}
