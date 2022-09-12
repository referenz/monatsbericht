import { formatCurrency } from './formatCurrency';
test('gibt leeren Output zurück, wenn Input 0, ein Textstring oder ein Leerstring ist', () => {
  expect(formatCurrency('0')).toBe('');
  expect(formatCurrency('blabla')).toBe('');
  // expect(formatCurrency('77asdasf')).toBe('');
  //expect(formatCurrency(null)).toBe('');
  //expect(formatCurrency(undefined)).toBe('');
  expect(formatCurrency('')).toBe('');
});

test('hängt Dezimalstellen an Werte ohne Dezialmalstellen an', () => {
  expect(formatCurrency('32')).toBe('32,00 Euro');
  expect(formatCurrency('1')).toBe('1,00 Euro');
  expect(formatCurrency('-51')).toBe('-51,00 Euro');
  expect(formatCurrency('12678293')).toBe('12.678.293,00 Euro');
  expect(formatCurrency('999999999')).toBe('999.999.999,00 Euro');
  expect(formatCurrency('-999999999')).toBe('-999.999.999,00 Euro');
});

test('funktioniert mit Zahlen innerhalb der realistischen Spannbreite', () => {
  for (let i = 1; i < 100000000; i += 100000) {
    expect(formatCurrency(i.toString())).toBe(
      `${i.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euro`
    );
  }
});

test('schneidet periodische Brüche ab und rundet sie korrekt', () => {
  expect(formatCurrency('16666.666666666666666')).toBe('16.666,67 Euro');
  expect(formatCurrency('99999.99999999999999999999')).toBe('100.000,00 Euro');
  expect(formatCurrency('99999.99')).toBe('99.999,99 Euro');
});
