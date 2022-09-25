import { MutableRefObject } from 'react';
import { Container } from 'react-bootstrap';
import Monatsbericht from '../service/Monatsbericht';
import FileBufferObj from '../types/FileBufferObj';
import VergleichBezeichnungen from './VergleichBezeichnungen';
import VergleichProjektzahl from './VergleichProjektzahl';
import VergleichSummen from './VergleichSummen';

function Vergleich(props: {
  dateiAlt: MutableRefObject<FileBufferObj>;
  monatsbericht: MutableRefObject<Monatsbericht>;
  className?: string;
}) {
  const monatsberichtAlt = Monatsbericht.fromArrayBuffer(props.dateiAlt.current.name, props.dateiAlt.current.buffer);

  return (
    <Container className={(props.className as string) + ' vergleich'}>
      <VergleichSummen monatsberichtNeu={props.monatsbericht.current} monatsberichtAlt={monatsberichtAlt} />

      <VergleichBezeichnungen monatsberichtNeu={props.monatsbericht.current} monatsberichtAlt={monatsberichtAlt} />

      <VergleichProjektzahl monatsberichtNeu={props.monatsbericht.current} monatsberichtAlt={monatsberichtAlt} />
    </Container>
  );
}

export default Vergleich;
