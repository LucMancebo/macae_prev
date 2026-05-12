// Exemplo de uso local do SDK @google/genai para desenvolvimento
// Não integra a API ao sistema — script independente para testes e prototipagem

const { GoogleGenAI } = require('@google/genai');

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('GEMINI_API_KEY não encontrada. Defina-a em .env ou no ambiente.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const prompt = process.argv.slice(2).join(' ') || 'Explain how AI works in a few words';

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
    });

    // Tenta normalizar texto
    const text = response?.text || response?.candidates?.[0]?.content?.text || JSON.stringify(response);
    console.log('=== Response ===');
    console.log(text);
  } catch (err) {
    console.error('Erro calling GenAI:', err);
    process.exit(2);
  }
}

main();
