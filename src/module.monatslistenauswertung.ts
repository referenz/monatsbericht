import XLSX from 'xlsx';

type Projektliste = Map<string, Record<string, string | number>>;

export default class Monatslistenauswertung {
    projekte_neu: Projektliste;
    projekte_alt: Projektliste;

    blaetter: string[];
    vergleichsfelder: string[];

    private constructor(args: { datei_neu: string; datei_alt: string } | { buffers: Map<string, ArrayBuffer> }) {
        this.blaetter = ['Kommune', 'Land'];
        this.vergleichsfelder = ['Zuwendung 2021', 'Zuwendung 2022'];

        if ('buffers' in args) {
            const iterator = args.buffers.entries();

            let projekte_curr: [string, ArrayBuffer] = iterator.next().value;
            this.projekte_neu = this.get_projekte_aus_datei({
                datei: projekte_curr[0],
                buffer: projekte_curr[1],
            });

            projekte_curr = iterator.next().value;
            this.projekte_alt = this.get_projekte_aus_datei({
                datei: projekte_curr[0],
                buffer: projekte_curr[1],
            });
        } else if ('datei_neu' in args && 'datei_alt' in args) {
            this.projekte_neu = this.get_projekte_aus_datei({ datei_lokal: args.datei_neu });
            this.projekte_alt = this.get_projekte_aus_datei({ datei_lokal: args.datei_alt });
        }
    }

    static fromFilename(datei_neu: string, datei_alt: string) {
        return new Monatslistenauswertung({ datei_neu: datei_neu, datei_alt: datei_alt });
    }

    static async fromArrayBuffer(input: Map<string, Promise<ArrayBuffer>>) {
        const buffers = new Map<string, ArrayBuffer>();
        for (const projekt of input) buffers.set(projekt[0], await projekt[1]);
        return new Monatslistenauswertung({ buffers: buffers });
    }

    private get_projekte_aus_blatt(blattname: string, workbook: XLSX.WorkBook): Projektliste {
        const json_liste: Record<string, string | number>[] = XLSX.utils.sheet_to_json(workbook.Sheets[blattname]);
        const projekte: Projektliste = new Map();

        for (const zeile in json_liste)
            if ('NR' in json_liste[zeile]) {
                delete json_liste[zeile]['NR'];
                // TODO: Vervollständigen
                switch (blattname) {
                    case 'Land':
                    case 'Kommune':
                    case 'Bund':
                        json_liste[zeile]['Handlungsbereich'] = blattname;
                        break;
                }
                projekte.set((json_liste[zeile]['Projektnr.'] as string).replace(/ /, ''), json_liste[zeile]);
            }

        if (projekte.size === 0) console.log(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
        return projekte;
    }

    private get_projekte_aus_datei(args): Projektliste {
        let workbook: XLSX.WorkBook;
        const datei: string = args.datei;

        if ('buffer' in args) workbook = XLSX.read(args.buffer);
        else if ('datei_lokal' in args) workbook = XLSX.readFile(args.datei);

        const projekte: Projektliste = new Map();
        this.blaetter.forEach((blatt) => {
            if (!workbook.SheetNames.includes(blatt))
                console.log(`Tabellenblatt "${blatt}" nicht in Datei ${datei} enthalten`);
            else this.get_projekte_aus_blatt(blatt, workbook)?.forEach((value, key) => projekte.set(key, value));
        });

        console.log(`${projekte.size} Projekte in Datei ${datei} gefunden`);

        return projekte;
    }

    public ermittle_abweichungen(): Map<string, string[]> {
        const projekte_abweichende: Map<string, string[]> = new Map();

        this.projekte_neu.forEach((projektdaten, projektnr) => {
            const abweichende_felder: string[] = [];
            this.vergleichsfelder.forEach((feld) => {
                if (
                    this.projekte_alt?.has(projektnr) &&
                    projektdaten[feld] !== this.projekte_alt.get(projektnr)?.[feld]
                )
                    abweichende_felder.push(feld);
            });

            if (abweichende_felder.length > 0) projekte_abweichende.set(projektnr, abweichende_felder);
        });

        return projekte_abweichende;
    }

    public ermittle_aenderungen_projektzahl(): [string[], string[]] {
        const projektliste_aktuell = Array.from(this.projekte_neu.keys());
        const projektliste_alt = Array.from(this.projekte_alt.keys());

        const neue_projekte = projektliste_aktuell.filter((projekt) => !projektliste_alt.includes(projekt));
        const alte_projekte = projektliste_alt.filter((projekt) => !projektliste_aktuell.includes(projekt));

        return [neue_projekte, alte_projekte];
    }
}
