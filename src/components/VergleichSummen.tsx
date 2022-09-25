import Monatsbericht from '../service/Monatsbericht';
import TabelleGeruest from './Tabelle_Geruest';
import TableCell from '../types/TableCell';
import { formatCurrency } from '../lib/formatCurrency';
import { ReactNode } from 'react';
import cellClassName from '../lib/cellClassName';
import relevantColumns from '../lib/relevantColumns';

function VergleichSummen(props: { monatsberichtNeu: Monatsbericht; monatsberichtAlt: Monatsbericht }) {
  const abweichungFoerdersummen = props.monatsberichtNeu.abweichungProjektdatenNachHandlungsbereichen(
    props.monatsberichtAlt,
    'Zuwendungen'
  );

  const Tabellen = Array.from(abweichungFoerdersummen).map(handlungsbereich => {
    const columns = relevantColumns(handlungsbereich[0], 'zuwendung');

    const rows: TableCell[][] = [];
    handlungsbereich[1].forEach((geaendert, projekt) => {
      const projektdaten: TableCell[] = [];
      columns.forEach(column => {
        const data = props.monatsberichtNeu.getProjektData(projekt, column) as string;
        const changed = geaendert.includes(column);

        let output: ReactNode;
        if (column.startsWith('Zuwendung')) {
          if (!changed) output = formatCurrency(data);
          else {
            const wertAlt = props.monatsberichtAlt.getProjektData(projekt, column) as string;
            if (wertAlt) {
              output = (
                <>
                  <span className="wert-alt">
                    {formatCurrency(wertAlt)}
                    <br />
                  </span>
                  <span className="wert-neu">{formatCurrency(data)}</span>
                </>
              );
            } else output = <span className="wert-neu">{formatCurrency(data)}</span>;
          }
        } else output = data;

        let cellClass = cellClassName(column);
        if (changed) cellClass += ' changed';

        const cell: TableCell = {
          column: column,
          class: cellClass,
          value: output,
        };
        projektdaten.push(cell);
      });

      rows.push(projektdaten);
    });

    return (
      <TabelleGeruest key={handlungsbereich[0]} columns={columns} rows={rows} expandHeadline="Abweichende Fördersummen">
        {handlungsbereich[0]}
      </TabelleGeruest>
    );
  });

  return (
    <>
      <h2>Abweichende Fördersummen</h2>
      {abweichungFoerdersummen.size !== 0 && Tabellen}
      {abweichungFoerdersummen.size === 0 && <p>Keine abweichenden Fördersummen</p>}
    </>
  );
}

export default VergleichSummen;
