  import type Monatsbericht from "./Monatsbericht";
  import Themenfelder from "../types/themenfelder.json"

interface HbObj {
  hatThemenfelder: boolean;
  anzahl: number;
  themenfelder: Map<string, number>;
}

export function countProjects(monatsbericht: Monatsbericht) {
  const handlungsbereicheMitThemen = new Map<string, HbObj>();
  monatsbericht.getHandlungsbereicheMitProjekten(true).forEach((projekte, handlungsbereich) => {
    const currThemenfelder = Themenfelder[handlungsbereich as keyof typeof Themenfelder];

    let obj: HbObj;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!currThemenfelder) {
      obj = {
        hatThemenfelder: false,
        anzahl: projekte.length,
        themenfelder: new Map(),
      };
    } else {
      const themenfelder = new Map<string, number>();
      currThemenfelder.forEach(themenfeld => themenfelder.set(themenfeld, 0));

      projekte.forEach(projekt => {
        // Der Umweg über Kopieren und Kleinschreibung muss wegen uneinheitlicher Schreibweise im
        // Monatsbericht gegangen werden. Ansonsten würde die unten auskommentierte Funktion reichen.
        const themenfelderArray = Array.from(themenfelder.keys());
        const index = themenfelderArray.findIndex(
          thema =>
            (monatsbericht.getProjektData(projekt, 'Themenfeld') as string).toLowerCase().trim() ===
            thema.toLowerCase().trim()
        );
        const currThema = themenfelderArray[index] ?? '__Rest';

        /*
        const curr_thema =
          themenfelder.has(props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
            ? (props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
            : ' __Rest';
        */

        const currAnzahl = themenfelder.get(currThema) ?? 0;
        themenfelder.set(currThema, currAnzahl + 1);
      });

      obj = {
        hatThemenfelder: true,
        anzahl: projekte.length,
        themenfelder: themenfelder,
      };
    }
    handlungsbereicheMitThemen.set(handlungsbereich, obj);
  });

  return handlungsbereicheMitThemen;
}