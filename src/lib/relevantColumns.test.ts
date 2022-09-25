import relevantColumns from './relevantColumns';
import Monatsbericht from '../service/Monatsbericht';

test('Handlungsbereich Kommune', () => {
  expect(relevantColumns('Kommune')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Fördergebiet',
    'Projektlaufzeit',
    'Bewilligungszeit',
  ]);
  expect(relevantColumns('Kommune')).not.toContain('Projekttitel');
});

test('Handlungsbereich Kommune, Modus Zuwendug', () => {
  expect(relevantColumns('Kommune', 'zuwendung')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Fördergebiet',
    ...Monatsbericht.vergleichsfelderZuwendungen,
  ]);
  expect(relevantColumns('Kommune')).not.toContain('Projekttitel');
});

test('Handlungsbereich Land', () => {
  expect(relevantColumns('Land')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Bundesland',
    'Projektlaufzeit',
    'Bewilligungszeit',
  ]);
  expect(relevantColumns('Land')).not.toContain('Projekttitel');
});

test('Handlungsbereich Land, Modus Zuwendung', () => {
  expect(relevantColumns('Land', 'zuwendung')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Bundesland',
    ...Monatsbericht.vergleichsfelderZuwendungen,
  ]);
  expect(relevantColumns('Land')).not.toContain('Projekttitel');
});

test('Andere Handlungsbereiche', () => {
  expect(relevantColumns('xyz')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Projekttitel',
    'Projektlaufzeit',
    'Bewilligungszeit',
  ]);
  expect(relevantColumns('xyz')).not.toContain('Fördergebiet');
});

test('Andere Handlungsbereiche, Modus Zuwendung', () => {
  expect(relevantColumns('xyz', 'zuwendung')).toStrictEqual([
    'Projektnr.',
    'Trägername',
    'Projekttitel',
    ...Monatsbericht.vergleichsfelderZuwendungen,
  ]);
  expect(relevantColumns('xyz', 'zuwendung')).not.toContain('Fördergebiet');
});
