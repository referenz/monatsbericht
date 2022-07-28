import Monatsbericht from '../Monatsbericht';

function Geendete(props: { monatsbericht: Monatsbericht }) {
    const geendete_projekte = props.monatsbericht.get_geendete_projekte() as string[];
    if (geendete_projekte.length === 0) return <p>Keine in diesem Jahr bisher geendeten Projekte gefunden</p>;

    const columns = ['Projektnr.', 'Trägername', 'Projekttitel', 'Handlungsbereich', 'Projektlaufzeit'];

    const rows = geendete_projekte.map((projektnr) =>
        columns.map((spalte) => props.monatsbericht.get_projekt(projektnr, spalte))
    );

    return (
        <table className="endende">
            <caption>
                <span className="expand">Auswertung:&nbsp;</span>
                In diesem Jahr geendete Projekte (Stand:{' '}
                {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} )
            </caption>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column}>{column}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((projekt) => (
                    <tr key={projekt[0] as string}>
                        <td>{projekt[0] as string}</td>
                        <td>{projekt[1] as string}</td>
                        <td>{projekt[2] as string}</td>
                        <td>{projekt[3] as string}</td>
                        <td>
                            {projekt[4][0]} - {projekt[4][1]}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Geendete;
