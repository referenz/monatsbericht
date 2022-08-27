import { render } from '@testing-library/react';
import Monatsbericht, { Projektliste } from '../Monatsbericht';
import AnalyseGeendete from './AnalyseGeendete';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const projektliste: Projektliste = new Map([
    [
        '01A01K',
        {
            'Projektnr.': '01A01K',
            Handlungsbereich: 'Kommune',
            Trägername: 'Träger Stadt A',
            Fördergebiet: 'Fördergebiet Stadt A',
            Projekttitel: 'Stadt A für mehr Vielfalt',
            Projektlaufzeit: ['01.01.2020', '31.12.2024'],
            Bewilligungszeitraum: ['01.01.2022', '31.07.2022'],
            'Zuwendung 2021': 100000,
            'Zuwendung 2022': 125000,
            'Zuwendung 2023': 100000,
        },
    ],
    [
        '01B01K',
        {
            'Projektnr.': '01B01K',
            Handlungsbereich: 'Kommune',
            Trägername: 'Träger Stadt B',
            Fördergebiet: 'Fördergebiet Stadt B',
            Projekttitel: 'Demokratie Leben! Stadt B',
            Projektlaufzeit: ['01.01.2020', '31.12.2021'],
        },
    ],
    [
        '01A01V',
        {
            'Projektnr.': '01A01V',
            Handlungsbereich: 'Modellprojekte Vielfaltgestaltung',
            Trägername: 'Träger Verein C',
            Bundesland: 'Brandenburg',
            Projekttitel: 'Projekttitel Modellprojekt C - geändert',
            Projektlaufzeit: ['01.01.2020', '31.12.2024'],
            Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
        },
    ],
    [
        '02B01V',
        {
            'Projektnr.': '02B01V',
            Handlungsbereich: 'Modellprojekte Vielfaltgestaltung',
            Trägername: 'Träger Verein D',
            Bundesland: 'Baden-Württemberg',
            Projekttitel: 'Projekttitel Modellprojekt D',
            Projektlaufzeit: ['01.01.2020', '31.12.2024'],
            Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
        },
    ],
]);

const bericht = Monatsbericht.fromArrayBuffer('aktueller-monatsbericht', new ArrayBuffer(0));
bericht.projekte = projektliste;

test('zeigt beendete Projekte an, laufende nicht', () => {
    const { queryByText } = render(<AnalyseGeendete monatsbericht={bericht} />);
    expect(queryByText(/Demokratie Leben! Stadt B/i)).toBeInTheDocument();
    expect(queryByText(/Projekttitel Modellprojekt C/i)).not.toBeInTheDocument();
});

test('zeigt keine nicht gebrauchte Spalte an', () => {
    const { queryByText } = render(<AnalyseGeendete monatsbericht={bericht} />);
    expect(queryByText(/Zuwendung/i)).not.toBeInTheDocument();
    expect(queryByText(/Bewilligung/i)).not.toBeInTheDocument();
});

test('zeigt benötigte Spalten an', () => {
    const { queryByText } = render(<AnalyseGeendete monatsbericht={bericht} />);
    expect(queryByText(/Handlungsbereich/i)).toBeInTheDocument();
    expect(queryByText(/Projektnr/i)).toBeInTheDocument();
});

test('zeigt Ersatztext an, wen keine beendeten Projekte vorhanden sind', () => {
    const { container } = render(
        <AnalyseGeendete monatsbericht={Monatsbericht.fromArrayBuffer('', new ArrayBuffer(0))} />
    );
    expect(container.querySelector('table.endende')).toBe(null);
    expect(container.querySelector('p')).not.toBe(null);
});
