import React, { forwardRef, MutableRefObject, useRef, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import './Comparison.css';
import Monatsbericht from '../Monatsbericht';
import FileBufferObj from '../types/FileBufferObj';

function formatCurrency(num: number): string {
    if (num === 0) return '';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Euro';
}

function VergleichsTabellen(props: { daten: any; monatsbericht: Monatsbericht; monatsbericht_alt: Monatsbericht }) {
    const infofelder = {
        Kommune: ['Trägername', 'Fördergebiet'],
        Land: ['Trägername', 'Bundesland'],
        Bund: ['Trägername', 'Projekttitel'],
        'Modellprojekte Demokratieförderung': ['Trägername', 'Projekttitel'],
        'Modellprojekte Vielfaltgestaltung': ['Trägername', 'Projekttitel'],
        'Modellprojekte Extremismusprävention': ['Trägername', 'Projekttitel'],
        'Modellprojekte Strafvollzug': ['Trägername', 'Projekttitel'],
        'Wissenschaftliche Belgeitung': ['Trägername', 'Projekttitel'],
        Innovationsfonds: ['Trägername', 'Projekttitel'],
        Begleitprojekte: ['Trägername', 'Projekttitel'],
        Forschungsvorhaben: ['Trägername', 'Projekttitel'],
    };

    // Handlungsbereiche ohne Veränderungen ausfiltern
    const ohne_leere = props.daten.filter((el) => el[1].size > 0);

    const tabellen = ohne_leere.map((handlungsbereich) => (
        <table key={handlungsbereich[0]}>
            <caption style={{ captionSide: 'top' }}>{handlungsbereich[0]}</caption>
            <thead>
                <tr>
                    <th>Projektnr</th>
                    {handlungsbereich[0] in infofelder &&
                        infofelder[handlungsbereich[0]].map((feld) => <th key={feld}>{feld}</th>)}
                    {Monatsbericht.vergleichsfelder.map((feld) => (
                        <th key={feld}>{feld}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(handlungsbereich[1]).map((e) => (
                    <tr key={e[0]}>
                        <td>{e[0]}</td>
                        {handlungsbereich[0] in infofelder &&
                            infofelder[handlungsbereich[0]].map((feld) => (
                                <td key={feld}>{props.monatsbericht.get_projekt(e[0], feld)}</td>
                            ))}
                        {Monatsbericht.vergleichsfelder.map((feld) => {
                            const changed = e[1].includes(feld) ? 'changed' : '';
                            return (
                                <td key={feld} className={changed + ' zuwendung'}>
                                    <span className="wert-alt">
                                        {formatCurrency(props.monatsbericht_alt.get_projekt(e[0], feld) as number)}
                                    </span>
                                    <br />
                                    <span className="wert-neu">
                                        {formatCurrency(props.monatsbericht.get_projekt(e[0], feld) as number)}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    ));
    return tabellen;
}

interface ComparisonProps extends React.ComponentPropsWithoutRef<'h2'> {
    className: string;
    monatsbericht: MutableRefObject<Monatsbericht>;
    datei_alt: MutableRefObject<FileBufferObj>;
}

const Comparison = forwardRef<HTMLHeadingElement, ComparisonProps>((props, ref) => {
    const monatsbericht_alt = useRef<Monatsbericht>(null);
    const [abweichung_foerder, setAbweichung_foerder] = useState<[string, Map<string, string[]>][]>(null);

    useEffect(() => {
        monatsbericht_alt.current = Monatsbericht.fromArrayBuffer(
            props.datei_alt.current.name,
            props.datei_alt.current.buffer
        );
    }, [props.datei_alt]);

    useEffect(() => {
        setAbweichung_foerder(
            Array.from(
                props.monatsbericht.current.abweichung_foerdersummen(monatsbericht_alt.current, {
                    ordered: true,
                }) as Map<string, Map<string, string[]>>
            )
        );

        /*
        const abweichung_projektzahl = Array.from(props.monatsbericht.current.abweichung_projektzahl(monatsbericht_alt));
        console.log(abweichung_projektzahl);
        */
    }, [monatsbericht_alt, props.monatsbericht]);

    return (
        <Container className={props.className} ref={ref}>
            <h2>Abweichende Fördersummen</h2>
            {abweichung_foerder && (
                <VergleichsTabellen
                    daten={abweichung_foerder}
                    monatsbericht={props.monatsbericht.current}
                    monatsbericht_alt={monatsbericht_alt.current}
                />
            )}

            {/*
            <h2>Hinzugekommene oder entfernte Projekte*</h2>
            <p>* Die Angaben zum Bewilligungszeitraum werden derzeit noch nicht ausgewertet</p>
            */}
        </Container>
    );
});

export default Comparison;
