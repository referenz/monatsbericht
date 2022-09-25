import { useEffect, useRef, MutableRefObject } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Fade } from 'react-bootstrap';
import './App.css';
import Footer from './components/Footer';
import UploadForm from './components/UploadForm';
import Prompt from './components/Prompt';
import Analyse from './components/Analyse';
import Vergleich from './components/Vergleich';
import FileBufferObj from './types/FileBufferObj';
import Monatsbericht from './service/Monatsbericht';
import Logger from './service/Logger';
import FatalError from './components/FatalError';
import useGlobalStateStore from './service/globalStateStore';

function App() {
  const { page, pageDone, mode, setMode, gotoPage } = useGlobalStateStore();

  const dateiNeu = useRef<FileBufferObj | null>(null);
  const dateiAlt = useRef<FileBufferObj | null>(null);
  const monatsbericht = useRef<Monatsbericht>();

  useEffect(() => {
    if (page === 'INIT' && pageDone && dateiNeu.current) {
      monatsbericht.current = Monatsbericht.fromArrayBuffer(dateiNeu.current.name, dateiNeu.current.buffer);
    }
  }, [page, pageDone]);

  useEffect(() => {
    if (page !== 'FATAL' && Logger.hasFatalMsg) {
      gotoPage('FATAL');
      setMode(undefined);
    }
  });

  return (
    <>
      <Footer /> {/* Footer steht oben, weil er h1-Element enthält */}
      <Container as="main">
        {page !== 'FATAL' && (
          <>
            <Fade in={page === 'INIT' && !pageDone} unmountOnExit={true} onExited={() => gotoPage('PROMPT')}>
              <Container>
                <UploadForm className="mt-4" file="datei_neu" datei={dateiNeu} />
              </Container>
            </Fade>

            <Fade
              in={page === 'PROMPT' && !pageDone}
              unmountOnExit={true}
              mountOnEnter={true}
              onExited={() => gotoPage(mode === 'ANALYZE_ONE' ? 'ANALYZE_ONE' : 'INPUT_SECOND')}
            >
              <Container>
                <Prompt className="mt-4" datei={dateiNeu.current as FileBufferObj} />
              </Container>
            </Fade>

            <Fade in={page === 'ANALYZE_ONE' && !pageDone} unmountOnExit={true} mountOnEnter={true}>
              <Container>
                <Analyse monatsbericht={monatsbericht.current as Monatsbericht} />
              </Container>
            </Fade>

            <Fade
              in={page === 'INPUT_SECOND' && !pageDone}
              unmountOnExit={true}
              mountOnEnter={true}
              onExited={() => gotoPage('COMPARE_TWO')}
            >
              <Container>
                <UploadForm className="mt-4" file="datei_alt" datei={dateiAlt} />
              </Container>
            </Fade>

            <Fade in={page === 'COMPARE_TWO' && !pageDone} mountOnEnter={true} unmountOnExit={true}>
              <Container>
                <Vergleich
                  monatsbericht={monatsbericht as MutableRefObject<Monatsbericht>}
                  dateiAlt={dateiAlt as MutableRefObject<FileBufferObj>}
                />
              </Container>
            </Fade>
          </>
        )}
        <Fade
          in={page === 'FATAL' && !pageDone}
          mountOnEnter={true}
          unmountOnExit={true}
          onExited={() => gotoPage('INIT')}
        >
          <Container>
            <FatalError />
          </Container>
        </Fade>
      </Container>
    </>
  );
}

export default App;
