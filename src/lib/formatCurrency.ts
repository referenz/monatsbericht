export function formatCurrency(num: string): string {
    const number = parseFloat(num) || 0;
    if (number === 0) return '';
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Euro';
}
