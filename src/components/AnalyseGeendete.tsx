import Monatsbericht from '../service/Monatsbericht';

function AnalyseGeendete(props: { monatsbericht: Monatsbericht }) {
  const geendeteProjekte = props.monatsbericht.getGeendeteProjekte();
  if (geendeteProjekte.length === 0) return <p>Keine in diesem Jahr bisher geendeten Projekte gefunden</p>;

  const columns = ['Projektnr.', 'Trägername', 'Projekttitel', 'Handlungsbereich', 'Projektlaufzeit'];

  const rows = geendeteProjekte.map(projektnr =>
    columns.map(spalte => props.monatsbericht.getProjektData(projektnr, spalte))
  );

  return (
    <table className="endende">
      <caption>
        <span className="expand">Auswertung:&nbsp;</span>
        In diesem Jahr geendete Projekte (Stichtag:{' '}
        {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} )
      </caption>
      <thead>
        <tr>
          {columns.map(column => (
            <th scope="col" key={column}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(projekt => (
          <tr key={projekt[0] as string}>
            <td>{projekt[0] as string}</td>
            <td>{projekt[1] as string}</td>
            <td>{projekt[2] as string}</td>
            <td>{projekt[3] as string}</td>
            <td>
              {(projekt[4] as string[])[0]} - {(projekt[4] as string[])[1]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AnalyseGeendete;
