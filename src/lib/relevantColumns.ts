import Monatsbericht from '../Monatsbericht';

const infofelder = new Map([
    ['Kommune', ['Trägername', 'Fördergebiet', 'Projektlaufzeit', 'Bewilligungszeit']],
    ['Land', ['Trägername', 'Bundesland', 'Projektlaufzeit', 'Bewilligungszeit']],
    ['default', ['Trägername', 'Projekttitel', 'Projektlaufzeit', 'Bewilligungszeit']],
]);

function relevantColumns(handlungsbereich: string, mode: 'default' | 'zuwendung' = 'default') {
    let columns = [
        'Projektnr.',
        ...(infofelder.has(handlungsbereich)
            ? (infofelder.get(handlungsbereich) as string[])
            : (infofelder.get('default') as string[])),
    ];

    if (mode === 'zuwendung')
        columns = [...columns, ...Monatsbericht.vergleichsfelder_zuwendungen].filter(
            (feld) => feld !== 'Bewilligungszeit' && feld !== 'Projektlaufzeit'
        );

    return columns;
}

export default relevantColumns;
