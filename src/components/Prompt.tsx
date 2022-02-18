import { Button, Container, Row } from 'react-bootstrap';
import FileBufferObj from '../types/FileBufferObj';
import GlobalState from '../types/GlobalState';
import './Prompt.css';

function Prompt(props: {
    className?: string;
    datei: FileBufferObj;
    setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
}) {
    return (
        <Container className={props.className + ' prompt'}>
            <Row>
                <p>Datei &quot;{props.datei.name}&quot; wurde eingelesen.</p>
            </Row>
            <Row className="buttonrow">
                <Button onClick={() => props.setGlobalState('GO_FOR_ANALYSIS')}>Diesen Monatsbericht auswerten</Button>
                <Button onClick={() => props.setGlobalState('GO_FOR_SECOND')}>
                    Diesen Monatsbericht mit älterem Monatsbericht vergleichen
                </Button>
            </Row>
        </Container>
    );
}

export default Prompt;
