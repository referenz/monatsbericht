import { Container } from 'react-bootstrap';
import './Analyse.css';
import Zaehlung from './Tabelle_Zaehlung';
import './Tabelle_Projektliste.css';
import Endende from './Tabelle_Endende';
import Projektliste from './Tabelle_Projektliste';
import Monatsbericht from '../Monatsbericht';

function Analyse(props: { monatsbericht: Monatsbericht }) {
    return (
        <Container className="analyse">
            <h2>Auswertung des aktuellen Monatsberichts*</h2>
            <p className="text-muted small">
                * Die Angaben zur Bewilligungszeit und Gesamtförderzeit und werden derzeit noch nicht ausgewertet. Der
                Monatsbericht wird einfach durchgezählt.
            </p>
            <h3>Statistische Auswertungen</h3>
            <Zaehlung monatsbericht={props.monatsbericht} />
            <Endende monatsbericht={props.monatsbericht} />
            <p>Mehr Auswertungen kommen vielleicht noch &#8230;</p>
            <Projektliste mode="Liste" monatsbericht={props.monatsbericht}>
                Projektliste
            </Projektliste>
        </Container>
    );
}

export default Analyse;
