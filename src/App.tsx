import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import './App.css';
import Footer from './components/Footer';
import UploadForm from './components/UploadForm';
import Comparison from './components/Comparison';
import GlobalState from './types/GlobalState';
import FileBufferObj from './types/FileBufferObj';
import Monatsbericht from './Monatsbericht';

function App() {
    const [globalState, setGlobalState] = useState<GlobalState>('INIT');

    const datei_neu = useRef<FileBufferObj>();
    const datei_alt = useRef<FileBufferObj>();

    const form_neu = useRef<HTMLFormElement>();
    const form_alt = useRef<HTMLFormElement>();
    const vergleich = useRef<HTMLHeadingElement>();

    const monatsbericht = useRef<Monatsbericht>(null);

    useEffect(() => {
        if (globalState === 'INIT') {
            form_neu.current.classList.remove('noshow-invisible');
        }
        if (globalState === 'ONE_FILE') {
            monatsbericht.current = Monatsbericht.fromArrayBuffer(datei_neu.current.name, datei_neu.current.buffer);

            form_neu.current.classList.add('noshow');
            form_alt.current.classList.add('noshow');
            form_neu.current.addEventListener('transitionend', () => {
                form_neu.current.classList.add('noshow-invisible');
                form_alt.current.classList.remove('noshow', 'noshow-invisible');

                // Toast-Element
            });
        }
        if (globalState === 'TWO_FILES') {
            // Diese Umbenennung ist notwendig, weil die Klasse Monatslistenauswertung intern
            // mit einer Map-Struktur arbeitet. Sollte das anders implementiert werden, kann
            // die Umbenennung entfallen. Kann vielleicht in die Klasse verlagert werden?
            if (datei_alt.current.name === datei_neu.current.name) datei_alt.current.name += '_1';

            form_alt.current.classList.add('noshow');
            form_alt.current.addEventListener('transitionend', () => {
                form_alt.current.classList.add('noshow-hidden');
                form_neu.current.classList.add('noshow-hidden');
                vergleich.current.classList.remove('noshow', 'noshow-invisible');
            });
        }
    }, [globalState]);

    return (
        <>
            <Footer globalState={globalState} /> {/* Footer steht oben, weil er h1-Element enthält */}
            <Container>
                <UploadForm
                    className="mt-4"
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                    file="datei_neu"
                    datei_neu={datei_neu}
                    ref={form_neu}
                />

                <UploadForm
                    className="mt-4"
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                    file="datei_alt"
                    datei_alt={datei_alt}
                    ref={form_alt}
                />

                {monatsbericht.current && datei_alt && (
                    <Comparison
                        ref={vergleich}
                        className="vergleich showtoggle noshow noshow-invisible"
                        monatsbericht={monatsbericht}
                        datei_alt={datei_alt}
                    />
                )}
            </Container>
        </>
    );
}

export default App;
