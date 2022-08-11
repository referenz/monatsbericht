import { Container } from 'react-bootstrap';
import AnalyseZaehlung from './AnalyseZaehlung';
import AnalyseGeendete from './AnalyseGeendete';
import AnalyseProjektliste from './AnalyseProjektliste';
import Monatsbericht from '../Monatsbericht';

function Analyse(props: { monatsbericht: Monatsbericht }) {
    return (
        <Container className="analyse">
            <h2>Auswertung des aktuellen Monatsberichts</h2>
            <h3>Statistische Auswertungen</h3>
            <AnalyseZaehlung monatsbericht={props.monatsbericht} />
            <AnalyseGeendete monatsbericht={props.monatsbericht} />
            <p>Mehr Auswertungen kommen vielleicht noch &#8230;</p>
            <AnalyseProjektliste monatsbericht={props.monatsbericht}>Projektliste</AnalyseProjektliste>
        </Container>
    );
}

export default Analyse;
