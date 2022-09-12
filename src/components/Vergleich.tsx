import { MutableRefObject } from 'react';
import { Container } from 'react-bootstrap';
import Monatsbericht from '../service/Monatsbericht';
import FileBufferObj from '../types/FileBufferObj';
import VergleichBezeichnungen from './VergleichBezeichnungen';
import VergleichProjektzahl from './VergleichProjektzahl';
import VergleichSummen from './VergleichSummen';

function Vergleich(props: {
  datei_alt: MutableRefObject<FileBufferObj>;
  monatsbericht: MutableRefObject<Monatsbericht>;
  className?: string;
}) {
  const monatsbericht_alt = Monatsbericht.fromArrayBuffer(props.datei_alt.current.name, props.datei_alt.current.buffer);

  return (
    <Container className={props.className + ' vergleich'}>
      <VergleichSummen monatsbericht_neu={props.monatsbericht.current} monatsbericht_alt={monatsbericht_alt} />

      <VergleichBezeichnungen monatsbericht_neu={props.monatsbericht.current} monatsbericht_alt={monatsbericht_alt} />

      <VergleichProjektzahl monatsbericht_neu={props.monatsbericht.current} monatsbericht_alt={monatsbericht_alt} />
    </Container>
  );
}

export default Vergleich;
