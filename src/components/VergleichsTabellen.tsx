import './Comparison.css';
import Monatsbericht from '../Monatsbericht';

function formatCurrency(num: number): string {
    if (num === 0) return '';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Euro';
}

function VergleichsTabellen(props: {
    daten: [string, Map<string, string[]>][];
    monatsbericht: Monatsbericht;
    monatsbericht_alt: Monatsbericht;
}) {
    const infofelder = {
        Kommune: ['Trägername', 'Fördergebiet'],
        Land: ['Trägername', 'Bundesland'],
        Bund: ['Trägername', 'Projekttitel'],
        'Modellprojekte Demokratieförderung': ['Trägername', 'Projekttitel'],
        'Modellprojekte Vielfaltgestaltung': ['Trägername', 'Projekttitel'],
        'Modellprojekte Extremismusprävention': ['Trägername', 'Projekttitel'],
        'Modellprojekte Strafvollzug': ['Trägername', 'Projekttitel'],
        'Wissenschaftliche Belgeitung': ['Trägername', 'Projekttitel'],
        Innovationsfonds: ['Trägername', 'Projekttitel'],
        Begleitprojekte: ['Trägername', 'Projekttitel'],
        Forschungsvorhaben: ['Trägername', 'Projekttitel'],
    };

    // Handlungsbereiche ohne Veränderungen ausfiltern
    const ohne_leere = props.daten.filter((el) => el[1].size > 0);

    const tabellen = ohne_leere.map((handlungsbereich) => (
        <table key={handlungsbereich[0]}>
            <caption style={{ captionSide: 'top' }}>{handlungsbereich[0]}</caption>
            <thead>
                <tr>
                    <th>Projektnr</th>
                    {handlungsbereich[0] in infofelder &&
                        infofelder[handlungsbereich[0]].map((feld) => <th key={feld}>{feld}</th>)}
                    {Monatsbericht.vergleichsfelder.map((feld) => (
                        <th key={feld}>{feld}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(handlungsbereich[1]).map((e) => (
                    <tr key={e[0]}>
                        <td>{e[0]}</td>
                        {handlungsbereich[0] in infofelder &&
                            infofelder[handlungsbereich[0]].map((feld) => (
                                <td key={feld}>{props.monatsbericht.get_projekt(e[0], feld)}</td>
                            ))}
                        {Monatsbericht.vergleichsfelder.map((feld) => {
                            const changed = e[1].includes(feld) ? 'changed' : '';
                            return (
                                <td key={feld} className={changed + ' zuwendung'}>
                                    <span className="wert-alt">
                                        {formatCurrency(props.monatsbericht_alt.get_projekt(e[0], feld) as number)}
                                    </span>
                                    <br />
                                    <span className="wert-neu">
                                        {formatCurrency(props.monatsbericht.get_projekt(e[0], feld) as number)}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    ));

    // Curcly Braces im Return-Statement wegen https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20356
    return <>{tabellen}</>;
}

export default VergleichsTabellen;
