"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAIController = void 0;
const genai_1 = require("@google/genai");
class GenAIController {
    ai = null;
    getClient() {
        if (!this.ai) {
            const key = process.env.GEMINI_API_KEY;
            if (!key) {
                throw new Error('GEMINI_API_KEY não está definida');
            }
            this.ai = new genai_1.GoogleGenAI({ apiKey: key });
        }
        return this.ai;
    }
    async generate(request, reply) {
        try {
            const body = request.body;
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
            const text = (response && response.text) || (response && response.candidates && response.candidates[0]?.content?.text) || null;
            return reply.send({ text, raw: response });
        }
        catch (err) {
            request.log.error('GenAI generate error', err);
            const message = err?.message || 'Erro ao chamar GenAI';
            return reply.status(500).send({ error: message });
        }
    }
}
exports.GenAIController = GenAIController;
