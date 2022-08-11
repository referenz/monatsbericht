import cellClassName from './cellClassName';

test('Ersetzt Leerzeichen im ClassName durch Striche', () => {
    expect(cellClassName('a b c d e f g')).toBe('a-b-c-d-e-f-g');
    expect(cellClassName('  klassen name   ')).toBe('--klassen-name---');
});

test('Entfernt Punkte im ClassName', () => {
    expect(cellClassName('a.b.c.d.e.f.g')).toBe('abcdefg');
    expect(cellClassName('.   klassen.name...')).toBe('---klassenname');
});

test('Setzt ClassName im Kleinbuchstaben', () => {
    expect(cellClassName('Abc Def.GHIJKL mnoP')).toBe('abc-defghijkl-mnop');
});
