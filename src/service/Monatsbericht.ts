import { read, utils, WorkBook } from 'xlsx';
import Logger from './Logger';

export type Projektliste = Map<string, Record<string, string | number | string[]>>;

class Monatsbericht {
  static vergleichsfelder_zuwendungen = ['Zuwendung 2020', 'Zuwendung 2021', 'Zuwendung 2022', 'Zuwendung 2023'];

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
      this.projekte = this.get_projekte_aus_datei({ dateiname: args.buffer[0], buffer: args.buffer[1] });
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
  private get_blattnamen_fuer_handlungsbereiche(workbook: WorkBook): Map<string, string> {
    const zuordnungen = new Map<string, string>();

    Monatsbericht.handlungsbereiche.forEach((blattnamen, handlungsbereich) => {
      const match = workbook.SheetNames.find(sheet => blattnamen.includes(sheet));
      if (match) {
        zuordnungen.set(match, handlungsbereich);
        Logger.debug(`Handlungsbereich "${handlungsbereich}" im Tabellenblatt "${match}" gefunden`);
      }
    });

    const keine_treffer = Array.from(Monatsbericht.handlungsbereiche.keys()).filter(
      handlungsbereich => !Array.from(zuordnungen.values()).includes(handlungsbereich)
    );
    keine_treffer.forEach(handlungsbereich => {
      Logger.error(`Kein passendes Tabellenblatt für Handlungsbereich "${handlungsbereich}" gefunden`);
    });

    return zuordnungen;
  }

  private get_projekte_aus_blatt(blattname: string, workbook: WorkBook): Projektliste {
    const json_liste: Record<string, string | number | string[]>[] = utils.sheet_to_json(workbook.Sheets[blattname]);
    const projekte: Projektliste = new Map();

    for (const zeile in json_liste)
      if ('Nr' in json_liste[zeile]) {
        delete json_liste[zeile]['Nr'];
        projekte.set((json_liste[zeile]['Projektnr.'] as string).replace(/\s/, '').trim(), json_liste[zeile]);
        json_liste[zeile]['Handlungsbereich'] = this.zuordnungen?.get(blattname) ?? '';

        // Eingelesene Daten aufräumen
        json_liste[zeile]['Projektnr.'] = (json_liste[zeile]['Projektnr.'] as string).replace(/\s/, '').trim();
        json_liste[zeile]['Fördergebiet'] = json_liste[zeile]['Fördergebiet '];
        delete json_liste[zeile]['Fördergebiet '];

        let gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find(el =>
          el.startsWith('Projektbezeichnung')
        );
        if (gesuchte_spalte) {
          json_liste[zeile]['Projekttitel'] = json_liste[zeile][gesuchte_spalte];
          delete json_liste[zeile][gesuchte_spalte];
        }

        gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find(el => el.startsWith('Projektlauf'));
        if (gesuchte_spalte) {
          const zeit = (json_liste[zeile][gesuchte_spalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
          if (!zeit) Logger.info(`Keine Projektlaufzeit bei Projekt ${json_liste[zeile]['Projektnr.']} angegeben`);
          json_liste[zeile]['Projektlaufzeit'] = zeit ?? '';
          delete json_liste[zeile][gesuchte_spalte];
        }

        gesuchte_spalte = Array.from(Object.keys(json_liste[zeile])).find(el => el.startsWith('Bewilligungs'));
        if (gesuchte_spalte) {
          const zeit = (json_liste[zeile][gesuchte_spalte] as string)?.match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
          if (!zeit) Logger.info(`Kein Bewilligungszeitraum bei Projekt ${json_liste[zeile]['Projektnr.']} angegeben`);
          json_liste[zeile]['Bewilligungszeit'] = zeit ?? '';
          delete json_liste[zeile][gesuchte_spalte];
        }
      }

    if (projekte.size === 0) Logger.error(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
    return projekte;
  }

  private get_projekte_aus_datei(args: { dateiname: string; buffer: ArrayBuffer }): Projektliste {
    const workbook = read(args.buffer);
    this.zuordnungen = this.get_blattnamen_fuer_handlungsbereiche(workbook);
    const projekte: Projektliste = new Map();
    for (const blatt of this.zuordnungen.keys()) {
      if (!workbook.SheetNames.includes(blatt))
        Logger.error(`Tabellenblatt "${blatt}" nicht in Datei ${args.dateiname} enthalten`);
      else this.get_projekte_aus_blatt(blatt, workbook).forEach((value, key) => projekte.set(key, value));
    }

    if (projekte.size === 0) Logger.fatal(`Keine Projekte in Datei "${args.dateiname}" gefunden`);
    else Logger.info(`${projekte.size} Projekte in Datei "${args.dateiname}" gefunden`);

    return projekte;
  }

  public get_projekte(ohne_geendete = false) {
    const projektliste: Projektliste = new Map(this.projekte);
    if (ohne_geendete === true) this.get_geendete_projekte().forEach(projektnr => projektliste.delete(projektnr));
    return projektliste;
  }

  public get_handlungsbereiche_mit_projekten(ohne_geendete = false) {
    const projektliste = this.get_projekte(ohne_geendete);
    const ordered: Map<string, string[]> = new Map();

    for (const projektnummer of projektliste.keys()) {
      const liste = ordered?.get(this.get_projekt_data(projektnummer, 'Handlungsbereich') as string) ?? [];
      liste.push(projektnummer);
      ordered.set(this.get_projekt_data(projektnummer, 'Handlungsbereich') as string, liste);
    }
    return ordered;
  }

  /*
    public get_projekt(projektnr: string, feld?: string) {
        return this.projekte.get(projektnr);
    }
    */

  public get_projekt_data(projektnr: string, feld: string) {
    return this.projekte.get(projektnr)?.[feld];
  }

  private abweichung_projektdaten(alt: Monatsbericht, vergleich: 'Zuwendungen' | 'Bezeichnungen') {
    const projekte_alt = alt.get_projekte();
    const projekte_abweichende: Map<string, string[]> = new Map();

    const vergleichsfelder =
      vergleich === 'Zuwendungen' ? Monatsbericht.vergleichsfelder_zuwendungen : ['Trägername', 'Projekttitel'];

    this.projekte.forEach((projektdaten, projektnr) => {
      const abweichende_felder: string[] = [];
      vergleichsfelder.forEach(feld => {
        if (projekte_alt.has(projektnr) && projektdaten[feld] !== projekte_alt.get(projektnr)?.[feld])
          abweichende_felder.push(feld);
      });

      if (abweichende_felder.length > 0) projekte_abweichende.set(projektnr, abweichende_felder);
    });

    return projekte_abweichende;
  }

  public abweichung_projektdaten_nach_handlungsbereichen(
    alt: Monatsbericht,
    vergleich: 'Zuwendungen' | 'Bezeichnungen'
  ) {
    const ordered: Map<string, Map<string, string[]>> = new Map();
    const projektliste = this.abweichung_projektdaten(alt, vergleich);
    projektliste.forEach((projekt, projektnr) => {
      const projekte: Map<string, string[]> =
        ordered?.get(this.get_projekt_data(projektnr, 'Handlungsbereich') as string) ?? new Map();
      projekte.set(projektnr, projekt);
      ordered.set(this.get_projekt_data(projektnr, 'Handlungsbereich') as string, projekte);
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
      const handlungsbereich_aktuell =
        alt === undefined
          ? (this.get_projekt_data(projekt, 'Handlungsbereich') as string)
          : (alt.get_projekt_data(projekt, 'Handlungsbereich') as string);

      const liste = ordered.get(handlungsbereich_aktuell) ?? [];
      liste.push(projekt);
      ordered.set(handlungsbereich_aktuell, liste);
    });

    return ordered;
  }

  private abweichung_projektzahl(alt: Monatsbericht) {
    const projektliste_aktuell = Array.from(this.projekte.keys());
    const projektliste_alt = Array.from(alt.get_projekte().keys());

    const neue_projekte = projektliste_aktuell.filter(projekt => !projektliste_alt.includes(projekt));
    const alte_projekte = projektliste_alt.filter(projekt => !projektliste_aktuell.includes(projekt));

    return [neue_projekte, alte_projekte];
  }

  public abweichung_projektzahl_nach_handlungsbereichen(alt: Monatsbericht) {
    const abweichung = this.abweichung_projektzahl(alt);
    return [this.orderListe(abweichung[0]), this.orderListe(abweichung[1], alt)];
  }

  public get_geendete_projekte(zeitpunkt?: Date) {
    const enddatum_auswertung = zeitpunkt ?? new Date();
    const endende_projekte: string[] = [];

    this.projekte.forEach((projektdaten, projektnummer) => {
      if ((projektdaten?.['Projektlaufzeit'] as string[])?.[1] !== undefined) {
        const [day, month, year] = (projektdaten['Projektlaufzeit'] as string)[1].split('.');
        const enddatum_projekt = new Date(`${year}-${month}-${day}`);
        if (enddatum_projekt.valueOf() < enddatum_auswertung.valueOf()) endende_projekte.push(projektnummer);
      }
    });

    return endende_projekte;
  }

  /*
    public get_geendete_projekte_nach_handlungsbereichen(zeitpunkt?: Date) {
        return this.orderListe(this.get_geendete_projekte(zeitpunkt));
    }
    */
}

export default Monatsbericht;
