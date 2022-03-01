import { read, readFile, utils, WorkBook } from 'xlsx';

type Projektliste = Map<string, Record<string, string | number | string[]>>;

class Monatsbericht {
    static vergleichsfelder_zuwendungen = ['Zuwendung 2020', 'Zuwendung 2021', 'Zuwendung 2022', 'Zuwendung 2023'];

    static handlungsbereiche = [
        'Kommune',
        'Land',
        'Bund',
        'Modellprojekte Demokratieförderung',
        'Modellprojekte Vielfaltgestaltung',
        'Modellprojekte Extremismusprävention',
        'Modellprojekte Strafvollzug',
        'Forschungsvorhaben',
        'Wissenschaftliche Begleitung',
        'Innovationsfonds',
        'Begleitprojekte',
    ];

    projekte: Projektliste;
    zuordnungen: Map<string, string>;

    private constructor(args: { datei: string } | { buffer: [string, ArrayBuffer] }) {
        this.projekte =
            'buffer' in args
                ? this.get_projekte_aus_datei({ dateiname: args.buffer[0], buffer: args.buffer[1] })
                : this.get_projekte_aus_datei({ datei: args.datei });
    }

    static fromFilename(datei: string) {
        return new Monatsbericht({ datei: datei });
    }

    static fromArrayBuffer(name: string, buffer: ArrayBuffer) {
        return new Monatsbericht({ buffer: [name, buffer] });
    }

    /**
     * Weist den Handlungsbereichen jeweils ein passendes Tabellenblatt zu. Das Ergebnis geht in die
     * Klassenvariable `zuordnungen`. Die interne Variable `blattnamen` enthält für jeden Handlungsbereich eine Liste
     * möglicher passender Tabellenblattnamen.
     * @param workbook - Die von XLSX bereits eingelesene Excel-Datei
     * @returns zuordnungen - Eine Map, die als Keys die Blattnamen und als Werte den jeweiligen Handlungsbereich enthält.
     */
    private get_blattnamen_fuer_handlungsbereiche(workbook: WorkBook): Map<string, string> {
        const zuordnungen = new Map<string, string>();

        const blattnamen: Record<string, string[]> = {
            Kommune: ['Partnerschaften K', 'Partnerschaften K ', 'Partnerschaften K  '],
            Land: ['Landesdemokratiezentren L'],
            Bund: ['Kompetenzzentren B'],
            'Modellprojekte Demokratieförderung': ['Demokratieförderung D'],
            'Modellprojekte Vielfaltgestaltung': ['Vielfaltgestaltung V'],
            'Modellprojekte Extremismusprävention': ['Extremismusprävention E'],
            'Modellprojekte Strafvollzug': ['Strafvollzug S'],
            Forschungsvorhaben: ['Forschungsvorhaben F'],
            'Wissenschaftliche Begleitung': ['Wissenschaftliche Begleitung W'],
            Innovationsfonds: ['Innofonds'],
            Begleitprojekte: ['Begleitprojekte U'],
        };

        Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => {
            blattnamen[handlungsbereich].forEach((blattname) => {
                if (workbook.SheetNames.includes(blattname)) zuordnungen.set(blattname, handlungsbereich);
            });
        });

        const keine_treffer = Monatsbericht.handlungsbereiche.filter(
            (handlungsbereich) => !Array.from(zuordnungen.values()).includes(handlungsbereich)
        );
        keine_treffer.forEach((handlungsbereich) =>
            console.log(`Kein passendes Tabellenblatt für den Handlungsbereich "${handlungsbereich}" gefunden)`)
        );

        return zuordnungen;
    }

    private get_projekte_aus_blatt(blattname: string, workbook: WorkBook): Projektliste {
        const json_liste: Record<string, string | number | string[]>[] = utils.sheet_to_json(
            workbook.Sheets[blattname]
        );
        const projekte: Projektliste = new Map();

        for (const zeile in json_liste)
            if ('Nr' in json_liste[zeile]) {
                delete json_liste[zeile]['Nr'];
                projekte.set((json_liste[zeile]['Projektnr.'] as string).replace(/\s/, '').trim(), json_liste[zeile]);
                json_liste[zeile]['Handlungsbereich'] = this.zuordnungen.get(blattname);

                // Eingelesene Daten aufräumen
                json_liste[zeile]['Projektnr.'] = (json_liste[zeile]['Projektnr.'] as string).replace(/\s/, '').trim();
                json_liste[zeile]['Fördergebiet'] = json_liste[zeile]['Fördergebiet '];
                delete json_liste[zeile]['Fördergebiet '];

                let gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find((el) =>
                    el.startsWith('Projektbezeichnung')
                );
                json_liste[zeile]['Projekttitel'] = json_liste[zeile][gesuchte_spalte];
                delete json_liste[zeile][gesuchte_spalte];

                gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find((el) => el.startsWith('Projektlauf'));
                let zeit = (json_liste[zeile][gesuchte_spalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
                json_liste[zeile]['Projektlaufzeit'] = zeit;
                delete json_liste[zeile][gesuchte_spalte];

                gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find((el) =>
                    el.startsWith('Bewilligungs')
                );
                zeit = (json_liste[zeile][gesuchte_spalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
                json_liste[zeile]['Bewilligungszeit'] = zeit;
                delete json_liste[zeile][gesuchte_spalte];
            }

        if (projekte.size === 0) console.log(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
        return projekte;
    }

    private get_projekte_aus_datei(args: { dateiname: string; buffer: ArrayBuffer } | { datei: string }): Projektliste {
        const workbook = 'buffer' in args ? read(args.buffer) : readFile(args.datei);
        const dateiname = 'buffer' in args ? args.dateiname : args.datei;

        this.zuordnungen = this.get_blattnamen_fuer_handlungsbereiche(workbook);
        const blaetter = Array.from(this.zuordnungen.keys());

        const projekte: Projektliste = new Map();
        blaetter.forEach((blatt) => {
            if (!workbook.SheetNames.includes(blatt))
                console.log(`Tabellenblatt "${blatt}" nicht in Datei ${dateiname} enthalten`);
            else this.get_projekte_aus_blatt(blatt, workbook).forEach((value, key) => projekte.set(key, value));
        });

        console.log(`${projekte.size} Projekte in Datei ${dateiname} gefunden`);

        return projekte;
    }

    // TODO: Nur Projekte eines bestimmten handlungsbereichs ausgeben
    public get_projekte(options?: { ordered?: boolean }) {
        if (options?.ordered === true) {
            const ordered: Map<string, string[]> = new Map();
            Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => ordered.set(handlungsbereich, []));

            this.projekte.forEach((_, projektnummer) => {
                const handlungsbereich_aktuell = this.get_projekt(projektnummer, 'Handlungsbereich') as string;

                const liste = ordered.get(handlungsbereich_aktuell);
                liste.push(projektnummer);
                ordered.delete(handlungsbereich_aktuell);
                ordered.set(handlungsbereich_aktuell, liste);
            });

            const values = Array.from(ordered.entries());
            values.forEach((value) => {
                if (value[1].length === 0) ordered.delete(value[0]);
            });

            return ordered;
        }
        return this.projekte;
    }

    public get_projekt(projektnr: string, feld?: string) {
        if (feld === undefined) return this.projekte.get(projektnr);
        else return this.projekte.get(projektnr)[feld];
    }

    /**
     * Ordnet eine übergebene Projektliste nach Handlungsbereichen
     * @param projektliste
     * @returns Map mit den Handlungsbereichen als Schlüssel und einem Array mit Projekten als jeweiligem Value
     */
    private ordne_nach_handlungsbereichen(projektliste: Map<string, string[]>): Map<string, Map<string, string[]>> {
        const ordered: Map<string, Map<string, string[]>> = new Map();
        Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => ordered.set(handlungsbereich, new Map()));

        ordered.forEach((liste, handlungsbereich) => {
            projektliste.forEach((projekt, projektnr) => {
                if (this.get_projekt(projektnr, 'Handlungsbereich') === handlungsbereich) liste.set(projektnr, projekt);
            });
        });

        const values = Array.from(ordered.entries());
        values.forEach((value) => {
            if (value[1].size === 0) ordered.delete(value[0]);
        });

        return ordered;
    }

    public abweichung_projektdaten(
        alt: Monatsbericht,
        vergleich: 'Zuwendungen' | 'Bezeichnungen',
        options?: { ordered?: boolean }
    ): Map<string, string[]> | Map<string, Map<string, string[]>> {
        const projekte_alt = alt.get_projekte();
        const projekte_abweichende: Map<string, string[]> = new Map();

        const vergleichsfelder =
            vergleich === 'Zuwendungen' ? Monatsbericht.vergleichsfelder_zuwendungen : ['Trägername', 'Projekttitel'];

        this.projekte.forEach((projektdaten, projektnr) => {
            const abweichende_felder: string[] = [];
            vergleichsfelder.forEach((feld) => {
                if (projekte_alt?.has(projektnr) && projektdaten[feld] !== projekte_alt.get(projektnr)?.[feld])
                    abweichende_felder.push(feld);
            });

            if (abweichende_felder.length > 0) projekte_abweichende.set(projektnr, abweichende_felder);
        });

        return options?.ordered === true
            ? this.ordne_nach_handlungsbereichen(projekte_abweichende)
            : projekte_abweichende;
    }

    /**
     * Hilfsfunktion für die öffentliche Funktion `abweichung_projektzahl()`, die die gefundenen Projekt nach
     * Handlungsbereichen sortiert.
     * TODO: Umbenennen in ordne_nach_handlungsbereichen
     * @param projekte Array mit den Projektnummern
     * @param alt Optional: Object der Klasse `Monatsbericht` mit dem alten Monatsbericht
     * @returns Map mit den Handlungsberichen als Schlüssel
     */
    private orderListe(projekte: string[], alt?: Monatsbericht) {
        const ordered: Map<string, string[]> = new Map();
        Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => ordered.set(handlungsbereich, []));

        projekte.forEach((projekt) => {
            const handlungsbereich_aktuell =
                alt === undefined
                    ? (this.get_projekt(projekt, 'Handlungsbereich') as string)
                    : (alt.get_projekt(projekt, 'Handlungsbereich') as string);

            const liste = ordered.get(handlungsbereich_aktuell);
            liste.push(projekt);
            ordered.delete(handlungsbereich_aktuell);
            ordered.set(handlungsbereich_aktuell, liste);
        });

        const values = Array.from(ordered.entries());
        values.forEach((value) => {
            if (value[1].length === 0) ordered.delete(value[0]);
        });

        return ordered;
    }

    public abweichung_projektzahl(
        alt: Monatsbericht,
        options?: { ordered?: boolean }
    ): [string[], string[]] | [Map<string, string[]>, Map<string, string[]>] {
        const projektliste_aktuell = Array.from(this.projekte.keys());
        const projektliste_alt = Array.from(alt.get_projekte().keys());

        const neue_projekte = projektliste_aktuell.filter((projekt) => !projektliste_alt.includes(projekt));
        const alte_projekte = projektliste_alt.filter((projekt) => !projektliste_aktuell.includes(projekt));

        return options?.ordered === true
            ? [this.orderListe(neue_projekte), this.orderListe(alte_projekte, alt)]
            : [neue_projekte, alte_projekte];
    }

    public get_geendete_projekte(options?: { ordered?: boolean; zeitpunkt?: Date }) {
        const enddatum_auswertung = options?.zeitpunkt ?? new Date();
        const endende_projekte: string[] = [];

        this.projekte.forEach((projektdaten, projektnummer) => {
            if (projektdaten?.['Projektlaufzeit']?.[1] !== undefined) {
                const [day, month, year] = projektdaten['Projektlaufzeit'][1].split('.');
                const enddatum_projekt = new Date(`${year}-${month}-${day}`);
                if (enddatum_projekt.valueOf() < enddatum_auswertung.valueOf()) endende_projekte.push(projektnummer);
            }
        });

        return options?.ordered === true ? this.orderListe(endende_projekte) : endende_projekte;
    }
}

export default Monatsbericht;
