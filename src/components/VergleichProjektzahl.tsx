import Monatsbericht from '../Monatsbericht';
import AnalyseProjektliste from './AnalyseProjektliste';

function VergleichProjektzahl(props: { monatsbericht_neu: Monatsbericht; monatsbericht_alt: Monatsbericht }) {
    const abweichungProjektzahl = props.monatsbericht_neu.abweichung_projektzahl_nach_handlungsbereichen(
        props.monatsbericht_alt
    );

    const TabellenHinzugekommen = (
        <AnalyseProjektliste
            monatsbericht={props.monatsbericht_neu}
            projekte={Array.from(abweichungProjektzahl[0])}
            expandedHeadline="Hinzugekommene Projekte"
        />
    );

    const TabellenEntfernt = (
        <AnalyseProjektliste
            monatsbericht={props.monatsbericht_alt}
            projekte={Array.from(abweichungProjektzahl[1])}
            expandedHeadline="Entfernte Projekte"
        />
    );

    return (
        <>
            <h2 className="mt-5">Hinzugekommene oder entfernte Projekte*</h2>
            <p className="text-muted small">
                * Die Angaben zur Bewilligungszeit und Gesamtförderzeit und werden derzeit noch nicht ausgewertet
            </p>

            {abweichungProjektzahl[0].size !== 0 && (
                <>
                    <h3>Hinzugekommene Projekte</h3>
                    {TabellenHinzugekommen}
                </>
            )}

            {abweichungProjektzahl[1].size !== 0 && (
                <>
                    <h3>Entfernte Projekte</h3>
                    {TabellenEntfernt}
                </>
            )}

            {abweichungProjektzahl[0].size === 0 && abweichungProjektzahl[1].size === 0 && (
                <p>Keine hinzugekommenen oder entfernten Projekte</p>
            )}
        </>
    );
}

export default VergleichProjektzahl;
