export interface MercadoLivrePrice {
    title: string;
    price: number;
}

export async function searchCheapestPrices(query: string, limit = 5): Promise<MercadoLivrePrice[]> {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&sort=price_asc`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Mercado Livre API error: ${response.status}`); 
    }

    const data = await response.json();
    const results = data.results ?? [];

    return results.slice(0, limit).map((item: any) => ({
        title: item.title,
        price: item.price,
    }));
}