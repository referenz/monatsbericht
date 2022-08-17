import Monatsbericht, { Projektliste } from './Monatsbericht';
import * as XLSX from 'xlsx';

describe('Test der mit den Excel-Dateien arbeitenden Funktionen', () => {
    const workbook = XLSX.utils.book_new();
    const worksheet_k = XLSX.utils.aoa_to_sheet([
        [
            'Nr',
            'Projektnr.',
            'Handlungsberich',
            'Fördergebiet ',
            'Projektbezeichnung',
            'Projektlaufzeit gesamt',
            'Bewilligungszeitraum',
        ],
        [1, '01A 01B', 'Kommune', 'Stadt A', 'Stadt A für Vielfalt', '01.01.2020 - 31.12.2024', ''],
    ]);
    const worksheet_v = XLSX.utils.aoa_to_sheet([
        ['Nr', 'Projektnr.', 'Handlungsberich', 'Bundesland ', 'Projektbezeichnung', 'Zuwendung 2022'],
        [99, '01A 01V', 'Modellprojekte Vielfaltgestaltung', 'Bremen', 'Bremen für Vielfalt', 125000],
    ]);
    const worksheet_irr = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.book_append_sheet(workbook, worksheet_k, 'Partnerschaften K ');
    XLSX.utils.book_append_sheet(workbook, worksheet_v, 'Demokratieförderung D');
    XLSX.utils.book_append_sheet(workbook, worksheet_irr, 'Irrelevantes Tabellenblatt');
    const datei = XLSX.write(workbook, { type: 'array' });

    const monatsbericht = Monatsbericht.fromArrayBuffer('testdatei', datei);

    test('Tabellenblätter werden richtigen Handlungsberichen zugeordnet', () => {
        expect(monatsbericht.zuordnungen.size).toBe(2);

        expect(monatsbericht.zuordnungen.get('Partnerschaften K ')).toBe('Kommune');
        expect(monatsbericht.zuordnungen.get('Demokratieförderung D')).toBe('Modellprojekte Demokratieförderung');
    });

    test('Projekte werden korrekt aus den Tabellenblättern extrahiert', () => {
        expect(monatsbericht.projekte.size).toBe(2);
        expect(monatsbericht.projekte.get('01A01V')?.['Projekttitel']).toBe('Bremen für Vielfalt');
        expect((monatsbericht.projekte.get('01A01B')?.['Projektlaufzeit'] as string[])[1]).toBe('31.12.2024');
        expect(monatsbericht.projekte.get('01A01B')?.['Bewilligungszeit']).toBe('');
        expect(monatsbericht.projekte.get('01A01V')?.['Zuwendung 2022']).toBe(125000);
    });
});

describe('Test der mit den Projektlisten arbeitenden Funktionen', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const projektliste: Projektliste = new Map([
        [
            '01A01K',
            {
                Projektnr: '01A01K',
                Handlungsbereich: 'Kommune',
                Träger: 'Träger Stadt A',
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
                Projektnr: '01B01K',
                Handlungsbereich: 'Kommune',
                Träger: 'Träger Stadt B',
                Fördergebiet: 'Fördergebiet Stadt B',
                Projekttitel: 'Demokratie Leben! Stadt B',
                Projektlaufzeit: ['01.01.2020', '31.12.2021'],
            },
        ],
        [
            '01A01V',
            {
                Projektnr: '01A01V',
                Handlungsbereich: 'Modellprojekte Vielfaltgestaltung',
                Träger: 'Träger Verein C',
                Bundesland: 'Brandenburg',
                Projekttitel: 'Projekttitel Modellprojekt C - geändert',
                Projektlaufzeit: ['01.01.2020', '31.12.2024'],
                Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
            },
        ],
        [
            '02B01V',
            {
                Projektnr: '02B01V',
                Handlungsbereich: 'Modellprojekte Vielfaltgestaltung',
                Träger: 'Träger Verein D',
                Bundesland: 'Baden-Württemberg',
                Projekttitel: 'Projekttitel Modellprojekt D',
                Projektlaufzeit: ['01.01.2020', '31.12.2024'],
                Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
            },
        ],
    ]);

    const bericht = Monatsbericht.fromArrayBuffer('aktueller-monatsbericht', new ArrayBuffer(0));
    bericht.projekte = projektliste;

    test('Monatsbericht.get_projekte()', () => {
        expect(bericht.get_projekte()).toStrictEqual(projektliste);
    });

    test('Monatsbericht.get_projekt_data()', () => {
        expect(bericht.get_projekt_data('01A01K', 'Projekttitel')).toBe('Stadt A für mehr Vielfalt');
        expect(bericht.get_projekt_data('01A01K', 'Zuwendung 2021')).toBe(100000);
        expect((bericht.get_projekt_data('01A01K', 'Projektlaufzeit') as string[])[1]).toBe('31.12.2024');
        expect(bericht.get_projekt_data('99Y99X', 'Träger')).toBe(undefined);
        expect(bericht.get_projekt_data('01A01K', 'XYZ')).toBe(undefined);
    });

    test('Monatsbericht.get_geendete_projekte()', () => {
        expect(bericht.get_geendete_projekte()).toStrictEqual(['01B01K']);
    });

    test('Monatsbericht.get_handlungsbereiche_mit_projekten()', () => {
        let result = bericht.get_handlungsbereiche_mit_projekten();
        expect(result.has('Kommune')).toBe(true);
        expect(result.has('Modellprojekte Vielfaltgestaltung')).toBe(true);
        expect(result.has('XYZ')).toBe(false);

        expect(result.get('Kommune')).toContain('01B01K');
        expect(result.get('Kommune')).not.toContain('01A01V');
        expect(result.get('Modellprojekte Vielfaltgestaltung')).toContain('01A01V');

        result = bericht.get_handlungsbereiche_mit_projekten(true);
        expect(result.get('Kommune')).not.toContain('01B01K');
        expect(result.get('Kommune')).toContain('01A01K');
    });

    const bericht_alt = Monatsbericht.fromArrayBuffer('alter-monatsbericht', new ArrayBuffer(0));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const projektliste2: Projektliste = new Map([
        [
            '01A01K',
            {
                Projektnr: '01A01K',
                Handlungsbereich: 'Kommune',
                Träger: 'Träger Stadt A',
                Fördergebiet: 'Fördergebiet Stadt A',
                Projekttitel: 'Stadt A für mehr Vielfalt',
                Projektlaufzeit: ['01.01.2020', '31.12.2024'],
                Bewilligungszeitraum: ['01.01.2022', '31.07.2022'],
                'Zuwendung 2021': 100000,
                'Zuwendung 2022': 100000,
            },
        ],
        [
            '01B01K',
            {
                Projektnr: '01B01K',
                Handlungsbereich: 'Kommune',
                Träger: 'Träger Stadt B',
                Fördergebiet: 'Fördergebiet Stadt B',
                Projekttitel: 'Demokratie Leben! Stadt B',
                Projektlaufzeit: ['01.01.2020', '31.12.2021'],
            },
        ],
        [
            '01A01V',
            {
                Projektnr: '01A01V',
                Handlungsbereich: 'Modellprojekte Vielfaltgestaltung',
                Träger: 'Träger Verein C',
                Bundesland: 'Brandenburg',
                Projekttitel: 'Projekttitel Modellprojekt C',
                Projektlaufzeit: ['01.01.2020', '31.12.2024'],
                Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
            },
        ],
        [
            '01A01I',
            {
                Projektnr: '01A01I',
                Handlungsbereich: 'Innovationsfonds',
                Träger: 'Träger Verein E',
                Bundesland: 'Bayern',
                Projekttitel: 'Projekttitel Innofondsprojekt C',
                Projektlaufzeit: ['01.01.2020', '31.12.2024'],
                Bewilligungszeitraum: ['01.01.2022', '31.12.2024'],
            },
        ],
    ]);

    bericht_alt.projekte = projektliste2;

    test('Monatsbericht.abweichung_projektzahl_nach_handlungsbereichen()', () => {
        const [neue_projekte, alte_projekte] = bericht.abweichung_projektzahl_nach_handlungsbereichen(bericht_alt);

        expect(neue_projekte.has('Modellprojekte Vielfaltgestaltung')).toBe(true);
        expect(neue_projekte.has('Kommune')).toBe(false);

        expect(neue_projekte.get('Modellprojekte Vielfaltgestaltung')).toContain('02B01V');
        expect(neue_projekte.get('Modellprojekte Vielfaltgestaltung')).not.toContain('01A01V');

        expect(alte_projekte.has('Innovationsfonds')).toBe(true);
        expect(alte_projekte.has('Modellprojekte Vielfaltgestaltung')).toBe(false);

        expect(alte_projekte.get('Innovationsfonds')).toContain('01A01I');
        expect(alte_projekte.get('Innovationsfonds')).not.toContain('01A01V');
    });

    test('Monatsbericht.abweichung_projektdaten_nach_handlungsbereichen()', () => {
        // Bezeichnungsabweichungen
        let abweichungen = bericht.abweichung_projektdaten_nach_handlungsbereichen(bericht_alt, 'Bezeichnungen');
        expect(abweichungen.has('Modellprojekte Vielfaltgestaltung')).toBe(true);
        expect(abweichungen.has('Kommune')).toBe(false);

        // Zuwendungsabweichungen
        abweichungen = bericht.abweichung_projektdaten_nach_handlungsbereichen(bericht_alt, 'Zuwendungen');
        expect(abweichungen.has('Kommune')).toBe(true);
        expect(abweichungen.has('Modellprojekte Vielfaltgestaltung')).toBe(false);
        expect(abweichungen.get('Kommune')?.has('01A01K')).toBe(true);
        expect(abweichungen.get('Kommune')?.get('01A01K')).toContain('Zuwendung 2022');
        expect(abweichungen.get('Kommune')?.get('01A01K')).toContain('Zuwendung 2023');
        expect(abweichungen.get('Kommune')?.get('01A01K')).not.toContain('Zuwendung 2021');
    });
});
