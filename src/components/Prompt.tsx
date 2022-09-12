import { Button, Container, Row } from 'react-bootstrap';
import useGlobalStateStore from '../service/globalStateStore';
import FileBufferObj from '../types/FileBufferObj';
import './Prompt.css';

function Prompt(props: { className?: string; datei: FileBufferObj }) {
  const { setPageDone, setMode } = useGlobalStateStore();
  return (
    <Container className={props.className + ' prompt'}>
      <Row>
        <p>Datei &quot;{props.datei.name}&quot; wurde eingelesen.</p>
      </Row>
      <Row className="buttonrow">
        <Button
          onClick={() => {
            setPageDone();
            setMode('ANALYZE_ONE');
          }}
        >
          Diesen Monatsbericht auswerten
        </Button>
        <Button
          onClick={() => {
            setPageDone();
            setMode('COMPARE_TWO');
          }}
        >
          Diesen Monatsbericht mit älterem Monatsbericht vergleichen
        </Button>
      </Row>
    </Container>
  );
}

export default Prompt;
