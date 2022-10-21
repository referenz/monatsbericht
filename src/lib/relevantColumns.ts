/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Monatsbericht, { type IProjektDaten } from './Monatsbericht';

const infofelder = new Map<string, (keyof IProjektDaten)[]>([
  ['Kommune', ['Trägername', 'Fördergebiet', 'Projektlaufzeit', 'Bewilligungszeit']],
  ['Land', ['Trägername', 'Bundesland', 'Projektlaufzeit', 'Bewilligungszeit']],
  ['default', ['Trägername', 'Projekttitel', 'Projektlaufzeit', 'Bewilligungszeit']],
]);

function relevantColumns(handlungsbereich: string, mode: 'default' | 'zuwendung' = 'default') {
  let columns: (keyof IProjektDaten)[] = [
    'Projektnr.', ...infofelder.has(handlungsbereich) ? (infofelder.get(handlungsbereich)!) : (infofelder.get('default')!)
  ]

  if (mode === 'zuwendung')
    columns = [...columns, ...Monatsbericht.vergleichsfelderZuwendungen].filter(
      feld => feld !== 'Bewilligungszeit' && feld !== 'Projektlaufzeit'
    );

  return columns;
}

export default relevantColumns;
