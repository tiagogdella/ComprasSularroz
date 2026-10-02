export function extractAccessKey(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    const match = digits.match(/\d{44}/);
    return match ? match[0] : null;
}

export function isValidAccessKey(accessKey: string): boolean {
    if(!/^\d{44}$/.test(accessKey)) return false;

    const digits = accessKey.slice(0, 43).split("").map(Number);
    const checkDigit = Number(accessKey[43]);

    let weight = 2;
    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
        sum += digits[i] * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }

    const remainder = sum % 11;
    const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
    return checkDigit === expectedCheckDigit;
}

// NFS-e (padrão nacional) usa chave de 50 dígitos, formato diferente da NF-e/CT-e - ver
// API_Sefaz_CCD/docs/protocolo-nfse-sefaz.md. Algoritmo do dígito verificador ainda não
// identificado (não é módulo 11, já testamos), então aqui só valida tamanho/formato.
export function extractNfseAccessKey(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    const match = digits.match(/\d{50}/);
    return match ? match[0] : null;
}

export function isValidNfseAccessKey(accessKey: string): boolean {
    return /^\d{50}$/.test(accessKey);
}