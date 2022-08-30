import Logger from '../Logger';
import GlobalState from '../types/GlobalState';

function FatalError(props: { setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>> }) {
    const handleReset = () => {
        Logger.reset();
        props.setGlobalState('GO_FOR_INIT');
    };

    return (
        <>
            <h2>Schwerwiegender Fehler aufgetreten</h2>
            {Logger.log
                .slice()
                .filter((entry) => entry.level === 'fatal')
                .reverse()
                .map((entry, i) => {
                    return <p key={i}>{entry.message}</p>;
                })}
            <div>
                <button type="button" onClick={handleReset}>
                    Neustart
                </button>
            </div>
        </>
    );
}

export default FatalError;
