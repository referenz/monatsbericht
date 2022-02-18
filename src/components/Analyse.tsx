import Projektliste from './Projektliste';
import './Projektliste.css';
import Monatsbericht from '../Monatsbericht';

function Analyse(props: { monatsbericht: Monatsbericht }) {
    return (
        <>
            <h2>Auswertung des aktuellen Monatsberichts</h2>
            <h3>Statistische Auswertungen oder so</h3>
            <p>Kommen noch ...</p>
            <Projektliste monatsbericht={props.monatsbericht}>Projektliste</Projektliste>
        </>
    );
}

export default Analyse;
