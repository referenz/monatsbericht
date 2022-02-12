import XLSX from 'xlsx';

type Projektliste = Map<string, Record<string, string | number>>;

class Monatsbericht {
    projekte: Projektliste;
    handlungsbereiche: string[];
    zuordnungen: Map<string, string>;
    static vergleichsfelder = ['Zuwendung 2020', 'Zuwendung 2021', 'Zuwendung 2022', 'Zuwendung 2023'];

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

    private constructor(args: { datei: string } | { buffer: [string, ArrayBuffer] }) {
        // TODO: Hier muss ein Weg gefunden werden, nur Zuwendungsjahre auszuwerten, für die auch in beiden Dateien
        // Werte vorliegen. Alternative hierzu: Die Vergleichsfunktion schmeißt Werte mit Zuwendungssumme 0 raus.
        // Weitere Alternative: Wir machen es uns zunutze, dass viele Felder aus zukünftigen Jahren undefined
        // sein dürften.
        //this.vergleichsfelder = ['Zuwendung 2021', 'Zuwendung 2022'];

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
     * Diese Funktion weist den Handlungsbereichen jeweils ein passendes Tabellenblatt zu. Das Ergebnis geht in die
     * Klassenvariable `zuordnungen`. Die interne Variable `blattnamen` enthält für jeden Handlungsbereich eine Liste
     * möglicher passender Tabellenblattnamen.
     * @param workbook - Die von XLSX bereits eingelesene Excel-Datei
     * @returns zuordnungen - Eine Map, die als Keys die Blattnamen und als Werte den jeweiligen Handlungsbereich enthält.
     */
    private get_blattnamen_fuer_handlungsbereiche(workbook: XLSX.WorkBook): Map<string, string> {
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

    private get_projekte_aus_blatt(blattname: string, workbook: XLSX.WorkBook): Projektliste {
        const json_liste: Record<string, string | number>[] = XLSX.utils.sheet_to_json(workbook.Sheets[blattname]);
        const projekte: Projektliste = new Map();

        for (const zeile in json_liste)
            if ('Nr' in json_liste[zeile]) {
                delete json_liste[zeile]['Nr'];
                json_liste[zeile]['Handlungsbereich'] = this.zuordnungen.get(blattname);

                // Einfachere Spaltenbezeichnungen
                json_liste[zeile]['Fördergebiet'] = json_liste[zeile]['Fördergebiet '];
                delete json_liste[zeile]['Fördergebiet '];

                const spalte_projekttitel = Array.from(Object.keys(json_liste[zeile])).find((el) =>
                    el.startsWith('Projektbezeichnung')
                );
                json_liste[zeile]['Projekttitel'] = json_liste[zeile][spalte_projekttitel];
                delete json_liste[zeile][spalte_projekttitel];

                projekte.set((json_liste[zeile]['Projektnr.'] as string).replace(/ /, '').trim(), json_liste[zeile]);
            }

        if (projekte.size === 0) console.log(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
        return projekte;
    }

    private get_projekte_aus_datei(args: { dateiname: string; buffer: ArrayBuffer } | { datei: string }): Projektliste {
        const workbook = 'buffer' in args ? XLSX.read(args.buffer) : XLSX.readFile(args.datei);
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

    // STUB
    public get_projekte(handlungsbereich?: string) {
        return this.projekte;
    }

    public get_projekt(projektnr: string, feld?: string) {
        if (feld === undefined) return this.projekte.get(projektnr);
        else return this.projekte.get(projektnr)[feld];
    }

    /**
     * Ordnet eine übergebene Projektliste nach Handlungsbereichen
     * @param projektliste
     * @returns Ein Map mit den Handlungsbereichen als Keys und den Projekten als Values
     */
    private ordne_nach_handlungsbereichen(projektliste: Map<string, string[]>): Map<string, Map<string, unknown>> {
        const ordered: Map<string, Map<string, string[]>> = new Map();
        Monatsbericht.handlungsbereiche.forEach((handlungsbereich) => ordered.set(handlungsbereich, new Map()));

        ordered.forEach((liste, handlungsbereich) => {
            projektliste.forEach((projekt, projektnr) => {
                if (this.get_projekt(projektnr, 'Handlungsbereich') === handlungsbereich) liste.set(projektnr, projekt);
            });
        });

        return ordered;
    }

    public abweichung_foerdersummen(
        alt: Monatsbericht,
        options?: { ordered?: boolean }
    ): Map<string, string[]> | Map<string, Map<string, string[]>> {
        const projekte_alt = alt.get_projekte();
        const projekte_abweichende: Map<string, string[]> = new Map();

        this.projekte.forEach((projektdaten, projektnr) => {
            const abweichende_felder: string[] = [];
            Monatsbericht.vergleichsfelder.forEach((feld) => {
                if (projekte_alt?.has(projektnr) && projektdaten[feld] !== projekte_alt.get(projektnr)?.[feld])
                    abweichende_felder.push(feld);
            });

            if (abweichende_felder.length > 0) projekte_abweichende.set(projektnr, abweichende_felder);
        });

        return options?.ordered === true
            ? (this.ordne_nach_handlungsbereichen(projekte_abweichende) as Map<string, Map<string, string[]>>)
            : projekte_abweichende;
    }

    public abweichung_projektzahl(alt: Monatsbericht): [string[], string[]] {
        const projektliste_aktuell = Array.from(this.projekte.keys());
        const projektliste_alt = Array.from(alt.get_projekte().keys());

        const neue_projekte = projektliste_aktuell.filter((projekt) => !projektliste_alt.includes(projekt));
        const alte_projekte = projektliste_alt.filter((projekt) => !projektliste_aktuell.includes(projekt));

        return [neue_projekte, alte_projekte];
    }
}

export default Monatsbericht;
