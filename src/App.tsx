import { useState, useEffect, useRef, MutableRefObject } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Fade } from 'react-bootstrap';
import './App.css';
import Footer from './components/Footer';
import UploadForm from './components/UploadForm';
import Prompt from './components/Prompt';
import Analyse from './components/Analyse';
import Vergleich from './components/Vergleich';
import GlobalState from './types/GlobalState';
import FileBufferObj from './types/FileBufferObj';
import Monatsbericht from './Monatsbericht';
import Logger from './Logger';
import FatalError from './components/FatalError';

function App() {
    const [globalState, setGlobalState] = useState<GlobalState>('INIT');

    const datei_neu = useRef<FileBufferObj | null>(null);
    const datei_alt = useRef<FileBufferObj | null>(null);
    const monatsbericht = useRef<Monatsbericht>();

    useEffect(() => {
        if (globalState === 'ONE_FILE' && datei_neu.current) {
            monatsbericht.current = Monatsbericht.fromArrayBuffer(datei_neu.current.name, datei_neu.current.buffer);
        }
    }, [globalState]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (Logger.hasFatalMsg) setGlobalState('FATAL_ERROR');
    });

    return (
        <>
            <Footer /> {/* Footer steht oben, weil er h1-Element enthält */}
            <Container as="main">
                {globalState !== 'FATAL_ERROR' && (
                    <>
                        <Fade
                            in={globalState === 'INIT'}
                            unmountOnExit={true}
                            onExited={() => setGlobalState('PROMPT')}
                        >
                            <Container>
                                <UploadForm
                                    className="mt-4"
                                    globalState={globalState}
                                    setGlobalState={setGlobalState}
                                    file="datei_neu"
                                    datei={datei_neu}
                                />
                            </Container>
                        </Fade>
                        <Fade
                            in={globalState === 'PROMPT'}
                            unmountOnExit={true}
                            mountOnEnter={true}
                            onExited={() => {
                                if (globalState === 'GO_FOR_SECOND') setGlobalState('WAIT_FOR_SECOND');
                                if (globalState === 'GO_FOR_ANALYSIS') setGlobalState('ANALYSIS');
                            }}
                        >
                            <Container>
                                <Prompt
                                    className="mt-4"
                                    setGlobalState={setGlobalState}
                                    datei={datei_neu.current as FileBufferObj}
                                />
                            </Container>
                        </Fade>
                        <Fade in={globalState === 'ANALYSIS'} unmountOnExit={true} mountOnEnter={true}>
                            <Container>
                                <Analyse monatsbericht={monatsbericht.current as Monatsbericht} />
                            </Container>
                        </Fade>
                        <Fade
                            in={globalState === 'WAIT_FOR_SECOND'}
                            unmountOnExit={true}
                            mountOnEnter={true}
                            onExited={() => setGlobalState('COMPARE')}
                        >
                            <Container>
                                <UploadForm
                                    className="mt-4"
                                    globalState={globalState}
                                    setGlobalState={setGlobalState}
                                    file="datei_alt"
                                    datei={datei_alt}
                                />
                            </Container>
                        </Fade>
                        <Fade in={globalState === 'COMPARE'} mountOnEnter={true} unmountOnExit={true}>
                            <Container>
                                <Vergleich
                                    monatsbericht={monatsbericht as MutableRefObject<Monatsbericht>}
                                    datei_alt={datei_alt as MutableRefObject<FileBufferObj>}
                                />
                            </Container>
                        </Fade>
                    </>
                )}
                <Fade
                    in={globalState === 'FATAL_ERROR'}
                    mountOnEnter={true}
                    unmountOnExit={true}
                    onExited={() => setGlobalState('INIT')}
                >
                    <Container>
                        <FatalError setGlobalState={setGlobalState} />
                    </Container>
                </Fade>
            </Container>
        </>
    );
}

export default App;
