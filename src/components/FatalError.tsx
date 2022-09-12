import useGlobalStateStore from '../service/globalStateStore';
import Logger from '../service/Logger';

function FatalError() {
  const { setPageDone } = useGlobalStateStore();

  const handleReset = () => {
    Logger.reset();
    setPageDone();
  };

  return (
    <>
      <h2>Schwerwiegender Fehler aufgetreten</h2>
      {Logger.log
        .slice()
        .filter(entry => entry.level === 'fatal')
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
