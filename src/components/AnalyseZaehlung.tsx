import './AnalyseZaehlung.css';
import Monatsbericht from '../service/Monatsbericht';
import Themenfelder from '../themenfelder.json';

type HbObj = {
  hatThemenfelder: boolean;
  anzahl: number;
  themenfelder?: object;
};

function AnalyseZaehlung(props: { monatsbericht: Monatsbericht }) {
  const handlungsbereicheMitThemen = new Map<string, HbObj>();
  props.monatsbericht.getHandlungsbereicheMitProjekten(true).forEach((projekte, handlungsbereich) => {
    const currThemenfelder = Themenfelder[handlungsbereich as keyof typeof Themenfelder];

    let obj: HbObj;
    if (!currThemenfelder) {
      obj = {
        hatThemenfelder: false,
        anzahl: projekte.length,
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
            (props.monatsbericht.getProjektData(projekt, 'Themenfeld') as string).toLowerCase().trim() ===
            thema.toLowerCase().trim()
        );
        const currThema = themenfelderArray[index] ?? '__Rest';

        /*
        const curr_thema =
          themenfelder.has(props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
            ? (props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
            : ' __Rest';
        */

        const currAnzahl = themenfelder?.get(currThema) ?? 0;
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

  return (
    <table className="zaehlung">
      <caption>
        <span className="expand">Auswertung:&nbsp;</span>
        Zählung (ohne geendete)
      </caption>
      <thead>
        <tr>
          <th scope="col">Handlungsbereich</th>
          <th scope="col">Themenfeld</th>
          <th scope="col">Anzahl Projekte</th>
        </tr>
      </thead>
      {Array.from(handlungsbereicheMitThemen).map(handlungsbereich => {
        return (
          <tbody key={handlungsbereich[0]}>
            <tr className="handlungsbereich">
              <td>{handlungsbereich[0]}</td>
              <td></td>
              <td className="anzahl">{handlungsbereich[1]['anzahl']}</td>
            </tr>
            {handlungsbereich[1]['hatThemenfelder'] === true &&
              Array.from(handlungsbereich[1]['themenfelder'] as Map<string, number>).map(themenfeld => (
                <tr key={themenfeld[0]}>
                  <td className="thema-davon"></td>
                  <td>{themenfeld[0]}</td>
                  <td className="anzahl">{themenfeld[1]}</td>
                </tr>
              ))}
          </tbody>
        );
      })}
      <tfoot>
        <tr>
          <td>Insgesamt</td>
          <td className="anzahl" colSpan={2}>
            {props.monatsbericht.getProjekte(true).size}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export default AnalyseZaehlung;
