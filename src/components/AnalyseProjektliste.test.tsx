import { render } from '@testing-library/react';
import Monatsbericht from '../Monatsbericht';
import AnalyseProjektliste from './AnalyseProjektliste';

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

beforeEach(() => {
    const intersectionObserverMock = () => ({
        observe: () => null,
    });
    window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);
});

test('zeigt korrekte Daten in Tabellen an', () => {
    const { queryByText, queryAllByText } = render(
        <AnalyseProjektliste monatsbericht={bericht}>Testtext</AnalyseProjektliste>
    );

    expect(queryByText(/Fördergebiet Stadt A/i)).toBeInTheDocument();
    expect(queryByText(/Stadt A für mehr Viefalt/i)).not.toBeInTheDocument();
    expect(queryByText(/Projekttitel Modellprojekt C - geändert/i)).toBeInTheDocument();

    expect(queryByText(/Kommune/i)).toBeInTheDocument();
    expect(queryByText(/Modellprojekte Vielfaltgestaltung/i)).toBeInTheDocument();

    expect(queryByText(/Zuwendung/i)).not.toBeInTheDocument();
    expect(queryAllByText(/Projektlaufzeit/i)[1]).toBeInTheDocument();

    expect(queryByText(/Testtext/i)?.outerHTML).toBe('<h2>Testtext</h2>');
});
