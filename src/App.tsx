import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Fade } from 'react-bootstrap';
import './App.css';
import Footer from './components/Footer';
import UploadForm from './components/UploadForm';
import Prompt from './components/Prompt';
import Comparison from './components/Comparison';
import GlobalState from './types/GlobalState';
import FileBufferObj from './types/FileBufferObj';
import Monatsbericht from './Monatsbericht';

function App() {
    const [globalState, setGlobalState] = useState<GlobalState>('INIT');

    const datei_neu = useRef<FileBufferObj>();
    const datei_alt = useRef<FileBufferObj>();
    const monatsbericht = useRef<Monatsbericht>(null);

    useEffect(() => {
        if (globalState === 'ONE_FILE') {
            monatsbericht.current = Monatsbericht.fromArrayBuffer(datei_neu.current.name, datei_neu.current.buffer);
        }
    }, [globalState]);

    return (
        <>
            <Footer globalState={globalState} /> {/* Footer steht oben, weil er h1-Element enthält */}
            <Fade in={globalState === 'INIT'} unmountOnExit={true} onExited={(_) => setGlobalState('PROMPT')}>
                <Container>
                    <UploadForm
                        className="mt-4"
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                        file="datei_neu"
                        datei_neu={datei_neu}
                    />
                </Container>
            </Fade>
            <Fade
                in={globalState === 'PROMPT'}
                unmountOnExit={true}
                mountOnEnter={true}
                onExited={(_) => setGlobalState('WAIT_FOR_SECOND')}
            >
                <Container>
                    <Prompt className="mt-4" setGlobalState={setGlobalState} datei={datei_neu.current} />
                </Container>
            </Fade>
            <Fade
                in={globalState === 'WAIT_FOR_SECOND'}
                unmountOnExit={true}
                mountOnEnter={true}
                onExited={(_) => setGlobalState('COMPARE')}
            >
                <Container>
                    <UploadForm
                        className="mt-4"
                        globalState={globalState}
                        setGlobalState={setGlobalState}
                        file="datei_alt"
                        datei_alt={datei_alt}
                    />
                </Container>
            </Fade>
            <Fade in={globalState === 'COMPARE'} mountOnEnter={true} unmountOnExit={true}>
                <Container>
                    <Comparison monatsbericht={monatsbericht} datei_alt={datei_alt} />
                </Container>
            </Fade>
        </>
    );
}

export default App;
