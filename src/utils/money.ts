// Money is kept to the kopiyka; VAT is charged on the amount without VAT, as on the paper documents.
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const vatOf = (amount: number, vatRate: number) => round2((amount * vatRate) / 100);
export const withVat = (amount: number, vatRate: number) => round2(amount + vatOf(amount, vatRate));
