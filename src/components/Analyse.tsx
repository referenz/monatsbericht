import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import './Analyse.css';
import './Projektliste.css';
import Projektliste from './Projektliste';
import Monatsbericht from '../Monatsbericht';
import Themenfelder from '../themenfelder.json';

function Analyse(props: { monatsbericht: Monatsbericht }) {
    const [handlungsbereiche, setHandlungsbereiche] = useState([]);
    useEffect(() => {
        const projekte = Array.from(
            (props.monatsbericht.get_projekte({ ordered: true }) as Map<string, string[]>).entries()
        );

        setHandlungsbereiche(projekte.map((handlungsbereich) => [handlungsbereich[0], handlungsbereich[1].length]));
    }, []);

    const [themenfelder, setThemenfelder] = useState(new Map());
    useEffect(() => {
        const themenfelder = new Map(Object.entries(Themenfelder));
        const projekte = props.monatsbericht.get_projekte({ ordered: true }) as Map<string, string[]>;

        const gezaehlteThemenfelder: Map<string, Map<string, number>> = new Map();
        themenfelder.forEach((themen, handlungsbereich) => {
            const gezaehlteThemen: Map<string, number> = new Map();
            themen.forEach((thema) => {
                let counter = 0;
                projekte.get(handlungsbereich).forEach((projektnr) => {
                    if (
                        (props.monatsbericht.get_projekt(projektnr, 'Themenfeld') as string).trim().toLowerCase() ===
                        thema.trim().toLowerCase()
                    )
                        counter++;
                });
                gezaehlteThemen.set(thema, counter);
            });
            gezaehlteThemenfelder.set(handlungsbereich, gezaehlteThemen);
        });
        setThemenfelder(gezaehlteThemenfelder);
    }, []);

    const TabelleZaehlung = (
        <table className="zaehlung">
            <caption>
                <span className="expand">Auswertung:&nbsp;</span>
                Zählung
            </caption>
            <thead>
                <tr>
                    <th>Handlungsbereich</th>
                    <th>Themenfeld</th>
                    <th>Anzahl Projekte</th>
                </tr>
            </thead>
            {handlungsbereiche.map((handlungsbereich) => (
                <tbody key={handlungsbereich[0]}>
                    <tr className="handlungsbereich">
                        <td>{handlungsbereich[0]}</td>
                        <td></td>
                        <td className="anzahl">{handlungsbereich[1]}</td>
                    </tr>
                    {themenfelder.has(handlungsbereich[0]) &&
                        Array.from(themenfelder.get(handlungsbereich[0])).map((daten) => {
                            return (
                                <tr key={daten[0]} className="themenfeld">
                                    <td className="thema-davon"></td>
                                    <td>{daten[0]}</td>
                                    <td className="anzahl">{daten[1]}</td>
                                </tr>
                            );
                        })}
                </tbody>
            ))}
            <tfoot>
                <tr>
                    <td>Insgesamt</td>
                    <td className="anzahl" colSpan={2}>
                        {props.monatsbericht.get_projekte().size}
                    </td>
                </tr>
            </tfoot>
        </table>
    );

    return (
        <Container className="analyse">
            <h2>Auswertung des aktuellen Monatsberichts*</h2>
            <p className="text-muted small">
                * Die Angaben zur Bewilligungszeit und Gesamtförderzeit und werden derzeit noch nicht ausgewertet. Der
                Monatsbericht wird einfach durchgezählt.
            </p>
            <h3>Statistische Auswertungen</h3>
            {themenfelder && TabelleZaehlung}
            <p>Mehr Auswertungen kommen vielleicht noch &#8230;</p>
            <Projektliste monatsbericht={props.monatsbericht}>Projektliste</Projektliste>
        </Container>
    );
}

export default Analyse;
