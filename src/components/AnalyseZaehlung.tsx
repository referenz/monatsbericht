import { useEffect, useState } from 'react';
import './AnalyseZaehlung.css';
import Monatsbericht, { Projektliste } from '../Monatsbericht';
import Themenfelder from '../themenfelder.json';

function AnalyseZaehlung(props: { monatsbericht: Monatsbericht }) {
    const [auszaehlung, setAuszaehlung] = useState({});

    useEffect(() => {
        let projektliste = Array.from(props.monatsbericht.get_projekte({ ohne_geendete: true }) as Projektliste);

        const projektauszaehlung = {};
        for (const handlungsbereich of Monatsbericht.handlungsbereiche.keys()) {
            projektauszaehlung[handlungsbereich] = { Projekte: [] };
            const themenfelder = (Themenfelder[handlungsbereich] as string[]) ?? null;
            if (themenfelder) {
                const themenobj = {};
                themenfelder.forEach((thema) => (themenobj[thema] = []));
                projektauszaehlung[handlungsbereich]['Themenfelder'] = themenobj;
            }
        }

        projektliste.forEach((projekt) => {
            const projekt_handlungsbereich = (projekt[1]['Handlungsbereich'] as string) ?? null;
            projektauszaehlung[projekt_handlungsbereich]['Projekte']?.push(projekt[0]);

            if ('Themenfelder' in projektauszaehlung[projekt_handlungsbereich]) {
                const projekt_themenfeld = projekt[1]['Themenfeld'] as string;

                // Den Umweg über `zuzuweisendes_themenfeld` muss wegen inkonsistenter Groß- und Kleinschreibung
                // im Monatsbericht gemacht werden
                const themenfelder: string[] = Object.keys(
                    projektauszaehlung[projekt_handlungsbereich]['Themenfelder']
                );
                const index = themenfelder.findIndex(
                    (thema) => projekt_themenfeld.toLowerCase().trim() === thema.toLowerCase().trim()
                );
                const zuzuweisendes_themenfeld = themenfelder[index];

                projektauszaehlung[projekt_handlungsbereich]['Themenfelder'][zuzuweisendes_themenfeld]?.push(
                    projekt[0]
                );
                projektauszaehlung[projekt_handlungsbereich]['Projekte'].pop();
            }

            if (projekt_handlungsbereich in projektauszaehlung) projektliste = projektliste.slice(1);
        });
        projektauszaehlung['Rest'] = {
            Projekte: projektliste,
        };

        let counter = 0;
        for (const [name_hb, handlungsbereich] of Object.entries(projektauszaehlung)) {
            counter += handlungsbereich?.['Projekte']?.length ?? 0;
            if (handlungsbereich?.['Projekte']?.length === 0) {
                let counter_thema = 0;
                for (const themen of Object.values(handlungsbereich)) {
                    for (const thema of Object.values(themen)) {
                        counter += (thema as string[])?.length ?? 0;
                        counter_thema += (thema as string[])?.length ?? 0;
                    }
                }
                projektauszaehlung[name_hb]['themen_addiert'] = counter_thema;
            }
        }
        projektauszaehlung['gesamt'] = counter;
        setAuszaehlung(projektauszaehlung);
    }, [props.monatsbericht]);

    return (
        <table className="zaehlung">
            <caption>
                <span className="expand">Auswertung:&nbsp;</span>
                Zählung
            </caption>
            <thead>
                <tr>
                    <th scope="col">Handlungsbereich</th>
                    <th scope="col">Themenfeld</th>
                    <th scope="col">Anzahl Projekte</th>
                </tr>
            </thead>
            {Array.from(Monatsbericht.handlungsbereiche.keys()).map((handlungsbereich) => (
                <tbody key={handlungsbereich}>
                    <tr className="handlungsbereich">
                        <td>{handlungsbereich}</td>
                        <td></td>
                        <td className="anzahl">
                            {auszaehlung[handlungsbereich]?.['Themenfelder'] === undefined &&
                                auszaehlung[handlungsbereich]?.['Projekte'].length}
                            {auszaehlung[handlungsbereich]?.['Themenfelder'] !== undefined &&
                                auszaehlung[handlungsbereich]?.['themen_addiert']}
                        </td>
                    </tr>
                    {auszaehlung[handlungsbereich]?.['Themenfelder'] !== undefined &&
                        Array.from(Object.entries(auszaehlung[handlungsbereich]['Themenfelder'])).map((thema) => (
                            <tr key={thema[0]}>
                                <td className="thema-davon"></td>
                                <td>{thema[0]}</td>
                                <td className="anzahl">{(thema[1] as string[]).length}</td>
                            </tr>
                        ))}
                    {auszaehlung[handlungsbereich]?.['Themenfelder'] !== undefined &&
                        auszaehlung[handlungsbereich]?.['Projekte'].length > 0 && (
                            <tr>
                                <td className="thema-davon"></td>
                                <td className="nicht-zuzuordnen">nicht zuzuordnen</td>
                                <td>auszaehlung[handlungsbereich]?.['Projekte'].length</td>
                            </tr>
                        )}
                </tbody>
            ))}
            <tfoot>
                <tr>
                    <td>Insgesamt</td>
                    <td className="anzahl" colSpan={2}>
                        {auszaehlung['gesamt']}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}

export default AnalyseZaehlung;
