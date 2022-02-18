import Projektliste from './Projektliste';
import './Projektliste.css';
import Monatsbericht from '../Monatsbericht';

function Analyse(props: { monatsbericht: Monatsbericht }) {
    return (
        <>
            <h2>Auswertung des aktuellen Monatsberichts</h2>
            <Projektliste monatsbericht={props.monatsbericht}>Aktueller Monatsbericht</Projektliste>
        </>
    );
}

export default Analyse;
