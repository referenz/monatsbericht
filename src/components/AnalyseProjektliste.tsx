import { ReactNode } from 'react';
import './AnalyseProjektliste.css';
import Monatsbericht from '../Monatsbericht';
import TabelleGeruest from './Tabelle_Geruest';
import TableCell from '../types/TableCell';
import cellClassName from '../lib/cellClassName';
import tableColums from '../lib/tableColumns';

function AnalyseProjektliste(props: {
    monatsbericht: Monatsbericht;
    projekte?: [string, string[]][];
    expandedHeadline?: string;
    children?: ReactNode;
}) {
    const projekte =
        props.projekte ?? Array.from(props.monatsbericht.get_projekte({ ordered: true }) as Map<string, string[]>);

    const expandedHeadline = props.expandedHeadline ?? 'Projektliste';

    const Tabellen = projekte.map((handlungsbereich) => {
        const columns = tableColums(handlungsbereich[0]);

        const rows: TableCell[][] = [];
        handlungsbereich[1].forEach((projekt) => {
            const projektdaten = [];
            columns.forEach((column) => {
                const data = props.monatsbericht.get_projekt(projekt, column) as string | string[];
                let output = '';
                if ((column === 'Bewilligungszeit' || column === 'Projektlaufzeit') && data !== undefined)
                    output = `${data[0]} - ${data[1]}`;
                else output = data as string;

                const cell: TableCell = {
                    column: column,
                    class: cellClassName(column),
                    value: output,
                };
                projektdaten.push(cell);
            });
            rows.push(projektdaten);
        });

        return (
            <TabelleGeruest key={handlungsbereich[0]} columns={columns} rows={rows} expandHeadline={expandedHeadline}>
                {handlungsbereich[0]}
            </TabelleGeruest>
        );
    });

    return (
        <>
            {props.children && <h2>{props.children}</h2>}
            {Tabellen}
        </>
    );
}

export default AnalyseProjektliste;
