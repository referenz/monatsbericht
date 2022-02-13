import React, { forwardRef, MutableRefObject, useRef, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import './Comparison.css';
import VergleichsTabellen from './VergleichsTabellen';
import Monatsbericht from '../Monatsbericht';
import FileBufferObj from '../types/FileBufferObj';

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

        const abweichung_projektzahl = Array.from(
            props.monatsbericht.current.abweichung_projektzahl(monatsbericht_alt.current, { ordered: true }) as [
                Map<string, string[]>,
                Map<string, string[]>
            ]
        );
        console.log(abweichung_projektzahl);
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

            <h2>Hinzugekommene oder entfernte Projekte*</h2>
            <p>* Die Angaben zum Bewilligungszeitraum werden derzeit noch nicht ausgewertet</p>
        </Container>
    );
});

export default Comparison;
