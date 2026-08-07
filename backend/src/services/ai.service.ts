const GROQ_API_KEY = process.env.GROQ_API_KEY as string;
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(prompt: string): Promise<string> {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
}

export async function suggestCategory(description: string): Promise<string> {
    const prompt = `Você categoriza produtos de um engenho de arroz que compra ferramentas para manutenção. Dado o nome do produto abaixo, responda APENAS com o nome de uma categoria curta (1-3 palavras, em portugues PT-BR), sem explicação nenhuma.
produto: ${description}
categoria:`;

    const text = await callGroq(prompt);
    return text.trim();
}

export interface PriceReport {
    verdict: "low" | "normal" | "high";
    text: string;
}

export async function generatePriceReport(
    description: string,
    paidPrice: number,
    historyPrices: number[],
    marketPrices: number[],
): Promise<PriceReport> {
    const historyText = historyPrices.length > 0
        ? `Preços já pagos por esse produto antes: ${historyPrices.map((p) => `R$ ${p.toFixed(2)}`).join(", ")}`
        : "Sem histórico de compra desse produto ainda.";

    const marketText = marketPrices.length > 0
        ? `Preços encontrados no Mercado Livre pra produtos parecidos: ${marketPrices.map((p) => `R$ ${p.toFixed(2)}`).join(", ")}`
        : "Sem referência encontrada no Mercado Livre.";

    const prompt = `Você avalia se um preço de compra está bom, na média, ou alto, comparando com dados reais.

Produto: ${description}
Preço pago agora: R$ ${paidPrice.toFixed(2)}
${historyText}
${marketText}

Responda APENAS com um JSON válido, sem markdown, sem crases, no formato exato:
{"verdict": "low" | "normal" | "high", "text": "1-2 frases curtas em português explicando o veredito, citando a referência usada"}`;

    const rawText = await callGroq(prompt);
    const cleaned = rawText.trim().replace(/^```json\s*|^```\s*|```$/g, "").trim();

    const parsed = JSON.parse(cleaned);
    const verdict = parsed.verdict === "low" || parsed.verdict === "high" ? parsed.verdict : "normal";

    return { verdict, text: String(parsed.text ?? "") };
}
