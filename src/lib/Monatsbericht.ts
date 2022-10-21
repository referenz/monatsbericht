/* eslint-disable @typescript-eslint/naming-convention */
import { read, utils } from "xlsx";
import type { WorkBook } from "xlsx";
import Logger from "../utils/logger";

export interface IProjektDaten {
  "Projektnr.": string;
  Trägername: string;
  Fördergebiet?: string;
  Bundesland: string;
  Projekttitel: string;
  Projektlaufzeit?: [string, string];
  Bewilligungszeit?: [string, string];
  Handlungsbereich: string;
  Themenfeld?: string;
  "Zuwendung 2020": string,
  "Zuwendung 2021": string,
  "Zuwendung 2022": string,
  "Zuwendung 2023": string,
  "Zuwendung 2024": string,
}

export type Projektliste = Map<string, IProjektDaten>;

class Monatsbericht {
  static vergleichsfelderZuwendungen: (keyof IProjektDaten)[] = [
    "Zuwendung 2020",
    "Zuwendung 2021",
    "Zuwendung 2022",
    "Zuwendung 2023",
    "Zuwendung 2024",
  ];

  /**
   * Key = Name des Handlungsbereichs, Value = Array mit möglichen Namen der Tabellenblätter im Monatbericht
   */
  static handlungsbereiche = new Map<string, string[]>([
    ["Kommune", ["Partnerschaften K", "Partnerschaften K ", "Partnerschaften K  "]],
    ["Land", ["Landesdemokratiezentren L"]],
    ["Bund", ["Kompetenzzentren B"]],
    ["Modellprojekte Demokratieförderung", ["Demokratieförderung D"]],
    ["Modellprojekte Vielfaltgestaltung", ["Vielfaltgestaltung V"]],
    ["Modellprojekte Extremismusprävention", ["Extremismusprävention E"]],
    ["Modellprojekte Strafvollzug", ["Strafvollzug S"]],
    ["Forschungsvorhaben", ["Forschungsvorhaben F"]],
    ["Wissenschaftliche Begleitung", ["Wissenschaftliche Begleitung W"]],
    ["Innovationsfonds", ["Innofonds"]],
    ["Begleitprojekte", ["Begleitprojekte U"]],
  ]);

  projekte: Projektliste = new Map();
  zuordnungen = new Map<string, string>();

  private constructor(args: { buffer: [string, ArrayBuffer] }) {
    try {
      this.projekte = this.getProjekteAusDatei({
        dateiname: args.buffer[0],
        buffer: args.buffer[1],
      });
    } catch (e) {
      Logger.fatal(args.buffer[0] + ": " + (e as Error).message);
    }
  }

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
      const match = workbook.SheetNames.find((sheet) => blattnamen.includes(sheet));
      if (match) {
        zuordnungen.set(match, handlungsbereich);
        Logger.debug(`Handlungsbereich "${handlungsbereich}" im Tabellenblatt "${match}" gefunden`);
      }
    });

    const keineTreffer = Array.from(Monatsbericht.handlungsbereiche.keys()).filter(
      (handlungsbereich) => !Array.from(zuordnungen.values()).includes(handlungsbereich)
    );
    keineTreffer.forEach((handlungsbereich) => {
      Logger.error(`Kein passendes Tabellenblatt für Handlungsbereich "${handlungsbereich}" gefunden`);
    });

    return zuordnungen;
  }

  private getProjekteAusBlatt(blattname: string, workbook: WorkBook): Projektliste {
    const jsonListe: Record<string, unknown>[] = utils.sheet_to_json(workbook.Sheets[blattname]);
    const blattProjekte: Projektliste = new Map();

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const zeile in jsonListe) {
      if ("Nr" in jsonListe[zeile]) {
        // Die ganzen get-Funktionen lassen sich sicherlich zusammenfassen:
        // getExcelRowValue(spalte: keyof IFileInfo) - oder -
        // getExcelRowValue(row, spalte: keyof IFileInfo)
        const getProjektNr = () => (jsonListe[zeile]["Projektnr."] as string).replace(/\s/, "").trim();

        const getTraegername = () => jsonListe[zeile]["Trägername"] as string;

        const getFoerdergebiet = () => jsonListe[zeile]["Fördergebiet "] as string;

        const getBundesland = () => jsonListe[zeile].Bundesland as string;

        const getProjektbezeichnung = () => {
          const gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el =>
            el.startsWith("Projektbezeichnung")
          );
          if (gesuchteSpalte) return jsonListe[zeile][gesuchteSpalte] as string;
          else return "";
        };

        const getProjektlaufzeit = () => {
          const gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el => el.startsWith("Projektlauf"));
          if (gesuchteSpalte) {
            const zeit = (jsonListe[zeile][gesuchteSpalte] as string).match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
            if (!zeit)
              Logger.info(`Keine Projektlaufzeit bei Projekt ${jsonListe[zeile]["Projektnr."] as string} angegeben`);
            return zeit as [string, string];
          }
        };

        const getBewilligungszeit = () => {
          const gesuchteSpalte = Array.from(Object.keys(jsonListe[zeile])).find(el => el.startsWith("Bewilligungs"));
          if (gesuchteSpalte) {
            const zeit = (jsonListe[zeile][gesuchteSpalte] as string).match(/(\d\d\.\d\d\.\d\d\d\d)/gm);
            if (!zeit)
              Logger.info(`Kein Bewilligungszeitraum bei Projekt ${jsonListe[zeile]["Projektnr."] as string} angegeben`);
            return zeit as [string, string];
          }
        };

        const getZuwendung = (year: number) => jsonListe[zeile][`Zuwendung ${year}`] as string;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const getHandlungsbereich = () => this.zuordnungen.get(blattname)!;

        const getThemenfeld = () => jsonListe[zeile].Themenfeld as string;

        const projektdaten: IProjektDaten = {
          "Projektnr.": getProjektNr(),
          Trägername: getTraegername(),
          Fördergebiet: getFoerdergebiet(),
          Bundesland: getBundesland(),
          Projekttitel: getProjektbezeichnung(),
          Projektlaufzeit: getProjektlaufzeit(),
          Bewilligungszeit: getBewilligungszeit(),
          Handlungsbereich: getHandlungsbereich(),
          Themenfeld: getThemenfeld(),
          "Zuwendung 2020": getZuwendung(2020),
          "Zuwendung 2021": getZuwendung(2021),
          "Zuwendung 2022": getZuwendung(2022),
          "Zuwendung 2023": getZuwendung(2023),
          "Zuwendung 2024": getZuwendung(2024),
        };
        blattProjekte.set(projektdaten["Projektnr."], projektdaten);
      }
    }

    if (blattProjekte.size === 0) Logger.error(`Keine Projekte in Tabellenblatt ${blattname} gefunden.`);
    return blattProjekte;
  }

  private getProjekteAusDatei(args: { dateiname: string; buffer: ArrayBuffer }): Projektliste {
    const workbook = read(args.buffer);
    this.zuordnungen = this.getBlattnamenFuerHandlungsbereiche(workbook);
    const projekte: Projektliste = new Map();
    for (const blatt of this.zuordnungen.keys()) {
      if (!workbook.SheetNames.includes(blatt))
        Logger.error(`Tabellenblatt "${blatt}" nicht in Datei ${args.dateiname} enthalten`);
      else
        this.getProjekteAusBlatt(blatt, workbook).forEach((value, key) => projekte.set(key, value));
    }

    if (projekte.size === 0) Logger.fatal(`Keine Projekte in Datei "${args.dateiname}" gefunden`);
    else Logger.info(`${projekte.size} Projekte in Datei "${args.dateiname}" gefunden`);

    return projekte;
  }

  public getProjekte(ohneGeendete = false) {
    const projektliste: Projektliste = new Map(this.projekte);
    if (ohneGeendete) this.getGeendeteProjekte().forEach((projektnr) => projektliste.delete(projektnr));
    return projektliste;
  }

  public getHandlungsbereicheMitProjekten(ohneGeendete = false) {
    const projektliste = this.getProjekte(ohneGeendete);
    const ordered = new Map<string, string[]>();

    for (const projektnummer of projektliste.keys()) {
      const liste = ordered.get(this.getProjektData(projektnummer, "Handlungsbereich") as string) ?? [];
      liste.push(projektnummer);
      ordered.set(this.getProjektData(projektnummer, "Handlungsbereich") as string, liste);
    }
    return ordered;
  }

  /*
    public get_projekt(projektnr: string, feld?: string) {
        return this.projekte.get(projektnr);
    }
    */

  public getProjektData(projektnr: string, feld: keyof IProjektDaten) {
    return this.projekte.get(projektnr)?.[feld];
  }

  private abweichungProjektdaten(alt: Monatsbericht, vergleich: "Zuwendungen" | "Bezeichnungen") {
    const projekteAlt = alt.getProjekte();
    const projekteAbweichende = new Map<string, string[]>();

    const vergleichsfelder =
      vergleich === "Zuwendungen"
        ? Monatsbericht.vergleichsfelderZuwendungen
        : ["Trägername", "Projekttitel"];

    this.projekte.forEach((projektdaten, projektnr) => {
      const abweichendeFelder: string[] = [];
      vergleichsfelder.forEach((feld) => {
        if (
          projekteAlt.has(projektnr) &&
          projektdaten[feld as keyof IProjektDaten] !==
            projekteAlt.get(projektnr)?.[feld as keyof IProjektDaten]
        )
          abweichendeFelder.push(feld);
      });

      if (abweichendeFelder.length > 0) projekteAbweichende.set(projektnr, abweichendeFelder);
    });

    return projekteAbweichende;
  }

  public abweichungProjektdatenNachHandlungsbereichen(alt: Monatsbericht, vergleich: "Zuwendungen" | "Bezeichnungen") {
    const ordered = new Map<string, Map<string, string[]>>();
    const projektliste = this.abweichungProjektdaten(alt, vergleich);
    projektliste.forEach((projekt, projektnr) => {
      const projekte: Map<string, string[]> =
        ordered.get(this.getProjektData(projektnr, "Handlungsbereich") as string) ?? new Map<string, string[]>();
      projekte.set(projektnr, projekt);
      ordered.set(this.getProjektData(projektnr, "Handlungsbereich") as string, projekte);
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
    const ordered = new Map<string, string[]>();
    projekte.forEach((projekt) => {
      const handlungsbereichAktuell =
        alt === undefined
          ? (this.getProjektData(projekt, "Handlungsbereich") as string)
          : (alt.getProjektData(projekt, "Handlungsbereich") as string);

      const liste = ordered.get(handlungsbereichAktuell) ?? [];
      liste.push(projekt);
      ordered.set(handlungsbereichAktuell, liste);
    });

    return ordered;
  }

  private abweichungProjektzahl(alt: Monatsbericht) {
    const projektlisteAktuell = Array.from(this.projekte.keys());
    const projektlisteAlt = Array.from(alt.getProjekte().keys());

    const neueProjekte = projektlisteAktuell.filter((projekt) => !projektlisteAlt.includes(projekt));
    const alteProjekte = projektlisteAlt.filter((projekt) => !projektlisteAktuell.includes(projekt));

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
      if (projektdaten.Projektlaufzeit?.[1]) {
        const [day, month, year] = projektdaten.Projektlaufzeit[1].split(".");
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
