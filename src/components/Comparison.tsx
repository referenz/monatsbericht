import React, { forwardRef, MutableRefObject, useRef, useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import './Comparison.css';
import VergleichsTabellen from './VergleichsTabellen';
import Listing from './Listing';
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
    const [abweichung_projektzahl, setAbweichung_projektzahl] = useState(null);

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

        setAbweichung_projektzahl(
            props.monatsbericht.current.abweichung_projektzahl(monatsbericht_alt.current, { ordered: true })
        );
    }, [monatsbericht_alt, props.monatsbericht]);
    return (
        <Container className={props.className} ref={ref}>
            <h2>Abweichende Fördersummen</h2>
            {abweichung_foerder && abweichung_foerder.length > 0 && (
                <VergleichsTabellen
                    daten={abweichung_foerder}
                    monatsbericht={props.monatsbericht.current}
                    monatsbericht_alt={monatsbericht_alt.current}
                />
            )}
            {abweichung_foerder && abweichung_foerder.length === 0 && <p>Keine abweichenden Fördersummen</p>}

            <h2 className="mt-5">Hinzugekommene oder entfernte Projekte*</h2>
            <p className="text-muted small">
                * Die Angaben zum Bewilligungszeitraum werden derzeit noch nicht ausgewertet
            </p>
            {abweichung_projektzahl && (
                <>
                    {abweichung_projektzahl[0].size > 0 && (
                        <Listing
                            projekte={Array.from(abweichung_projektzahl[0])}
                            monatsbericht={props.monatsbericht.current}
                        >
                            Hinzugekommene Projekte
                        </Listing>
                    )}

                    {abweichung_projektzahl[1].size > 0 && (
                        <Listing
                            projekte={Array.from(abweichung_projektzahl[1])}
                            monatsbericht={monatsbericht_alt.current}
                        >
                            Weggefallene Projekte
                        </Listing>
                    )}
                    {abweichung_projektzahl[0].size === 0 && abweichung_projektzahl[1].size === 0 && (
                        <p>Keine hinzugekommenen oder entfernten Projekte</p>
                    )}
                </>
            )}
        </Container>
    );
});

export default Comparison;
