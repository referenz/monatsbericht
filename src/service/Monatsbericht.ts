import { read, utils, WorkBook } from 'xlsx';
import Logger from './Logger';

export type Projektliste = Map<string, Record<string, string | number | string[]>>;

class Monatsbericht {
  static vergleichsfelderZuwendungen = ['Zuwendung 2020', 'Zuwendung 2021', 'Zuwendung 2022', 'Zuwendung 2023'];

  /**
   * Key = Name des Handlungsbereichs, Value = Array mit möglichen Namen der Tabellenblätter im Monatbericht
   */
  static handlungsbereiche: Map<string, string[]> = new Map([
    ['Kommune', ['Partnerschaften K', 'Partnerschaften K ', 'Partnerschaften K  ']],
    ['Land', ['Landesdemokratiezentren L']],
    ['Bund', ['Kompetenzzentren B']],
    ['Modellprojekte Demokratieförderung', ['Demokratieförderung D']],
    ['Modellprojekte Vielfaltgestaltung', ['Vielfaltgestaltung V']],
    ['Modellprojekte Extremismusprävention', ['Extremismusprävention E']],
    ['Modellprojekte Strafvollzug', ['Strafvollzug S']],
    ['Forschungsvorhaben', ['Forschungsvorhaben F']],
    ['Wissenschaftliche Begleitung', ['Wissenschaftliche Begleitung W']],
    ['Innovationsfonds', ['Innofonds']],
    ['Begleitprojekte', ['Begleitprojekte U']],
  ]);

  projekte: Projektliste = new Map();
  zuordnungen: Map<string, string> = new Map();

  private constructor(args: { buffer: [string, ArrayBuffer] }) {
    try {
      this.projekte = this.getProjekteAusDatei({ dateiname: args.buffer[0], buffer: args.buffer[1] });
    } catch (e) {
      // xlsx wirft Instanzen von Error deshalb kein Type Check notwendig
      Logger.fatal(args.buffer[0] + ': ' + (e as Error).message);
    }
  }

  /*
    static fromFilename(datei) {}
    */

  static fromArrayBuffer(name: string, buffer: ArrayBuffer) {
    return new Monatsbericht({ buffer: [name, buffer] });
  }

  /**
   * Weist den Handlungsbereichen jeweils ein passendes Tabellenblatt zu. Das Ergebnis geht in die
   * Klassenvariable `zuordnungen`.
   * @param workbook - Die von XLSX bereits eingelesene Excel-Datei
   * @returns zuordnungen - Eine Map, die als Keys die Blattnamen und als Value den jeweiligen Handlungsbereich enthält.
   */
  private getBlattnamenFuerHandlungsbereiche(workbook: WorkBook): Map<string, string> {
    const zuordnungen = new Map<string, string>();

    Monatsbericht.handlungsbereiche.forEach((blattnamen, handlungsbereich) => {
      const match = workbook.SheetNames.find(sheet => blattnamen.includes(sheet));
      if (match) {
        zuordnungen.set(match, handlungsbereich);
        Logger.debug(`Handlungsbereich "${handlungsbereich}" im Tabellenblatt "${match}" gefunden`);
      }
    });

    const keineTreffer = Array.from(Monatsbericht.handlungsbereiche.keys()).filter(
      handlungsbereich => !Array.from(zuordnungen.values()).includes(handlungsbereich)
    );
    keineTreffer.forEach(handlungsbereich => {
      Logger.error(`Kein passendes Tabellenblatt für Handlungsbereich "${handlungsbereich}" gefunden`);
    });

    return zuordnungen;
  }

  private getProjekteAusBlatt(blattname: string, workbook: WorkBook): Projektliste {
    const jsonListe: Record<string, string | number | string[]>[] = utils.sheet_to_json(workbook.Sheets[blattname]);
    const projekte: Projektliste = new Map();

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const zeile in jsonListe)
      if ('Nr' in jsonListe[zeile]) {
        delete jsonListe[zeile]['Nr'];
        projekte.set((jsonListe[zeile]['Projektnr.'] as string).replace(/\s/, '').trim(), jsonListe[zeile]);
        jsonListe[zeile]['Handlungsbereich'] = this.zuordnungen?.get(blattname) ?? '';

        // Eingelesene Daten aufräumen
        jsonListe[zeile]['Projektnr.'] = (jsonListe[zeile]['Projektnr.'] as string).replace(/\s/, '').trim();
        jsonListe[zeile]['Fördergebiet'] = jsonListe[zeile]['Fördergebiet '];
        delete jsonListe[zeile]['Fördergebiet '];

        let gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el => el.startsWith('Projektbezeichnung'));
        if (gesuchteSpalte) {
          jsonListe[zeile]['Projekttitel'] = jsonListe[zeile][gesuchteSpalte];
          delete jsonListe[zeile][gesuchteSpalte];
        }

        gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el => el.startsWith('Projektlauf'));
        if (gesuchteSpalte) {
          const zeit = (jsonListe[zeile][gesuchteSpalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
          if (!zeit)
            Logger.info(`Keine Projektlaufzeit bei Projekt ${jsonListe[zeile]['Projektnr.'] as string} angegeben`);
          jsonListe[zeile]['Projektlaufzeit'] = zeit ?? '';
          delete jsonListe[zeile][gesuchteSpalte];
        }

        gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el => el.startsWith('Bewilligungs'));
        if (gesuchteSpalte) {
          const zeit = (jsonListe[zeile][gesuchteSpalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
          if (!zeit)
            Logger.info(`Kein Bewilligungszeitraum bei Projekt ${jsonListe[zeile]['Projektnr.'] as string} angegeben`);
          jsonListe[zeile]['Bewilligungszeit'] = zeit ?? '';
          delete jsonListe[zeile][gesuchteSpalte];
        }
      }

    if (projekte.size === 0) Logger.error(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
    return projekte;
  }

  private getProjekteAusDatei(args: { dateiname: string; buffer: ArrayBuffer }): Projektliste {
    const workbook = read(args.buffer);
    this.zuordnungen = this.getBlattnamenFuerHandlungsbereiche(workbook);
    const projekte: Projektliste = new Map();
    for (const blatt of this.zuordnungen.keys()) {
      if (!workbook.SheetNames.includes(blatt))
        Logger.error(`Tabellenblatt "${blatt}" nicht in Datei ${args.dateiname} enthalten`);
      else this.getProjekteAusBlatt(blatt, workbook).forEach((value, key) => projekte.set(key, value));
    }

    if (projekte.size === 0) Logger.fatal(`Keine Projekte in Datei "${args.dateiname}" gefunden`);
    else Logger.info(`${projekte.size} Projekte in Datei "${args.dateiname}" gefunden`);

    return projekte;
  }

  public getProjekte(ohneGeendete = false) {
    const projektliste: Projektliste = new Map(this.projekte);
    if (ohneGeendete === true) this.getGeendeteProjekte().forEach(projektnr => projektliste.delete(projektnr));
    return projektliste;
  }

  public getHandlungsbereicheMitProjekten(ohneGeendete = false) {
    const projektliste = this.getProjekte(ohneGeendete);
    const ordered: Map<string, string[]> = new Map();

    for (const projektnummer of projektliste.keys()) {
      const liste = ordered?.get(this.getProjektData(projektnummer, 'Handlungsbereich') as string) ?? [];
      liste.push(projektnummer);
      ordered.set(this.getProjektData(projektnummer, 'Handlungsbereich') as string, liste);
    }
    return ordered;
  }

  /*
    public get_projekt(projektnr: string, feld?: string) {
        return this.projekte.get(projektnr);
    }
    */

  public getProjektData(projektnr: string, feld: string) {
    return this.projekte.get(projektnr)?.[feld];
  }

  private abweichungProjektdaten(alt: Monatsbericht, vergleich: 'Zuwendungen' | 'Bezeichnungen') {
    const projekteAlt = alt.getProjekte();
    const projekteAbweichende: Map<string, string[]> = new Map();

    const vergleichsfelder =
      vergleich === 'Zuwendungen' ? Monatsbericht.vergleichsfelderZuwendungen : ['Trägername', 'Projekttitel'];

    this.projekte.forEach((projektdaten, projektnr) => {
      const abweichendeFelder: string[] = [];
      vergleichsfelder.forEach(feld => {
        if (projekteAlt.has(projektnr) && projektdaten[feld] !== projekteAlt.get(projektnr)?.[feld])
          abweichendeFelder.push(feld);
      });

      if (abweichendeFelder.length > 0) projekteAbweichende.set(projektnr, abweichendeFelder);
    });

    return projekteAbweichende;
  }

  public abweichungProjektdatenNachHandlungsbereichen(alt: Monatsbericht, vergleich: 'Zuwendungen' | 'Bezeichnungen') {
    const ordered: Map<string, Map<string, string[]>> = new Map();
    const projektliste = this.abweichungProjektdaten(alt, vergleich);
    projektliste.forEach((projekt, projektnr) => {
      const projekte: Map<string, string[]> =
        ordered?.get(this.getProjektData(projektnr, 'Handlungsbereich') as string) ?? new Map<string, string[]>();
      projekte.set(projektnr, projekt);
      ordered.set(this.getProjektData(projektnr, 'Handlungsbereich') as string, projekte);
    });
    return ordered;
  }

  /**
   * Hilfsfunktion für die öffentlichen Funktionn `abweichung_projektzahl_*()` und `get_geendete_projekte_*()`,
   * die die gefundenen Projekt nach Handlungsbereichen sortiert.
   * TODO: Umbenennen in ordne_nach_handlungsbereichen
   * @param projekte Array mit den Projektnummern
   * @param alt Optional: Object der Klasse `Monatsbericht` mit dem alten Monatsbericht
   * @returns Map mit den Handlungsberichen als Schlüssel
   */
  private orderListe(projekte: string[], alt?: Monatsbericht) {
    const ordered: Map<string, string[]> = new Map();
    projekte.forEach(projekt => {
      const handlungsbereichAktuell =
        alt === undefined
          ? (this.getProjektData(projekt, 'Handlungsbereich') as string)
          : (alt.getProjektData(projekt, 'Handlungsbereich') as string);

      const liste = ordered.get(handlungsbereichAktuell) ?? [];
      liste.push(projekt);
      ordered.set(handlungsbereichAktuell, liste);
    });

    return ordered;
  }

  private abweichungProjektzahl(alt: Monatsbericht) {
    const projektlisteAktuell = Array.from(this.projekte.keys());
    const projektlisteAlt = Array.from(alt.getProjekte().keys());

    const neueProjekte = projektlisteAktuell.filter(projekt => !projektlisteAlt.includes(projekt));
    const alteProjekte = projektlisteAlt.filter(projekt => !projektlisteAktuell.includes(projekt));

    return [neueProjekte, alteProjekte];
  }

  public abweichungProjektzahlNachHandlungsbereichen(alt: Monatsbericht) {
    const abweichung = this.abweichungProjektzahl(alt);
    return [this.orderListe(abweichung[0]), this.orderListe(abweichung[1], alt)];
  }

  public getGeendeteProjekte(zeitpunkt?: Date) {
    const enddatumAuswertung = zeitpunkt ?? new Date();
    const endendeProjekte: string[] = [];

    this.projekte.forEach((projektdaten, projektnummer) => {
      if ((projektdaten?.['Projektlaufzeit'] as string[])?.[1] !== undefined) {
        const [day, month, year] = (projektdaten['Projektlaufzeit'] as string)[1].split('.');
        const enddatumProjekt = new Date(`${year}-${month}-${day}`);
        if (enddatumProjekt.valueOf() < enddatumAuswertung.valueOf()) endendeProjekte.push(projektnummer);
      }
    });

    return endendeProjekte;
  }

  /*
    public get_geendete_projekte_nach_handlungsbereichen(zeitpunkt?: Date) {
        return this.orderListe(this.get_geendete_projekte(zeitpunkt));
    }
    */
}

export default Monatsbericht;
