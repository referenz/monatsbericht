import './AnalyseZaehlung.css';
import Monatsbericht from '../Monatsbericht';
import Themenfelder from '../themenfelder.json';

type hb_obj = {
    __hat_Themenfelder: boolean;
    Anzahl: number;
    Themenfelder?: object;
};

function AnalyseZaehlung(props: { monatsbericht: Monatsbericht }) {
    const handlungsbereiche_mit_themen = new Map<string, hb_obj>();
    props.monatsbericht.get_handlungsbereiche_mit_projekten(true).forEach((projekte, handlungsbereich) => {
        const curr_themenfelder = Themenfelder[handlungsbereich as keyof typeof Themenfelder];

        let obj: hb_obj;
        if (!curr_themenfelder) {
            obj = {
                __hat_Themenfelder: false,
                Anzahl: projekte.length,
            };
        } else {
            const themenfelder = new Map<string, number>();
            curr_themenfelder.forEach((themenfeld) => themenfelder.set(themenfeld, 0));

            projekte.forEach((projekt) => {
                // Der Umweg über Kopieren und Kleinschreibung muss wegen uneinheitlicher Schrweibweise im
                // Monatsbericht gegangen werden. Ansonsten würde die unten auskommentierte Funktion reichen.
                const themenfelder_array = Array.from(themenfelder.keys());
                const index = themenfelder_array.findIndex(
                    (thema) =>
                        (props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string).toLowerCase().trim() ===
                        thema.toLowerCase().trim()
                );
                const curr_thema = themenfelder_array[index] ?? '__Rest';

                /*
                const curr_thema =
                    themenfelder.has(props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
                        ? (props.monatsbericht.get_projekt_data(projekt, 'Themenfeld') as string)
                        : ' __Rest';
                */

                const curr_anzahl = themenfelder?.get(curr_thema) ?? 0;
                themenfelder.set(curr_thema, curr_anzahl + 1);
            });

            obj = {
                __hat_Themenfelder: true,
                Anzahl: projekte.length,
                Themenfelder: themenfelder,
            };
        }
        handlungsbereiche_mit_themen.set(handlungsbereich, obj);
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
            {Array.from(handlungsbereiche_mit_themen).map((handlungsbereich) => {
                return (
                    <tbody key={handlungsbereich[0]}>
                        <tr className="handlungsbereich">
                            <td>{handlungsbereich[0]}</td>
                            <td></td>
                            <td className="anzahl">{handlungsbereich[1]['Anzahl'] as number}</td>
                        </tr>
                        {handlungsbereich[1]['__hat_Themenfelder'] === true &&
                            Array.from(handlungsbereich[1]['Themenfelder'] as Map<string, number>).map((themenfeld) => (
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
                        {props.monatsbericht.get_projekte(true).size}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}

export default AnalyseZaehlung;
