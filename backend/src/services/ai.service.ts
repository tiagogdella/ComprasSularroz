const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const GEMINI_MODEL = "gemini-2.0-flash";

export async function suggestCategory(description: string):  Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Você categoriza produtos de um engenho de arroz que compra ferramentas para manutenção. Dado o nome do produto abaixo, responda APENAS com o nome de uma categoria curta (1-3 palavras, em portugues PT-BR), sem explicação nenhuma.
produto: ${description}
categoria:`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    });
    
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text.trim();
}