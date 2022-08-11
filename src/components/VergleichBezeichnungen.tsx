import Monatsbericht from '../Monatsbericht';
import TabelleGeruest from './Tabelle_Geruest';
import TableCell from '../types/TableCell';
import { ReactNode } from 'react';
import cellClassName from '../lib/cellClassName';

function VergleichBezeichnungen(props: { monatsbericht_neu: Monatsbericht; monatsbericht_alt: Monatsbericht }) {
    const abweichungBezeichnungen = props.monatsbericht_neu.abweichung_projektdaten_nach_handlungsbereichen(
        props.monatsbericht_alt,
        'Bezeichnungen'
    );

    const Tabellen = Array.from(abweichungBezeichnungen).map((handlungsbereich) => {
        const columns = ['Projektnr.', 'Trägername', 'Projekttitel'];

        const rows: TableCell[][] = [];
        handlungsbereich[1].forEach((geaendert, projekt) => {
            const projektdaten: TableCell[] = [];
            columns.forEach((column) => {
                const data = props.monatsbericht_neu.get_projekt_data(projekt, column) as string;
                const changed = geaendert.includes(column);

                let output: ReactNode;
                if ((column === 'Trägername' || column === 'Projekttitel') && changed) {
                    output = (
                        <>
                            <span className="wert-alt">
                                {props.monatsbericht_alt.get_projekt_data(projekt, column) as string}
                                <br />
                            </span>
                            <span className="wert-neu">{data}</span>
                        </>
                    );
                } else output = data;

                let cell_class = cellClassName(column);
                if (changed) cell_class += ' changed';

                const cell: TableCell = {
                    column: column,
                    class: cell_class,
                    value: output,
                };
                projektdaten.push(cell);
            });

            rows.push(projektdaten);
        });

        return (
            <TabelleGeruest
                key={handlungsbereich[0]}
                columns={columns}
                rows={rows}
                expandHeadline="Abweichende Bezeichung von Trägername oder Projekttitel"
            >
                {handlungsbereich[0]}
            </TabelleGeruest>
        );
    });

    return (
        <>
            <h2>Abweichende Bezeichung von Trägername oder Projekttitel</h2>
            {abweichungBezeichnungen.size !== 0 && Tabellen}
            {abweichungBezeichnungen.size === 0 && <p>Keine Veränderungen bei Trägernamen oder Projekttiteln</p>}
        </>
    );
}

export default VergleichBezeichnungen;
