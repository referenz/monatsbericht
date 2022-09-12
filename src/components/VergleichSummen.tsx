import Monatsbericht from '../service/Monatsbericht';
import TabelleGeruest from './Tabelle_Geruest';
import TableCell from '../types/TableCell';
import { formatCurrency } from '../lib/formatCurrency';
import { ReactNode } from 'react';
import cellClassName from '../lib/cellClassName';
import relevantColumns from '../lib/relevantColumns';

function VergleichSummen(props: { monatsbericht_neu: Monatsbericht; monatsbericht_alt: Monatsbericht }) {
  const abweichungFoerdersummen = props.monatsbericht_neu.abweichung_projektdaten_nach_handlungsbereichen(
    props.monatsbericht_alt,
    'Zuwendungen'
  );

  const Tabellen = Array.from(abweichungFoerdersummen).map(handlungsbereich => {
    const columns = relevantColumns(handlungsbereich[0], 'zuwendung');

    const rows: TableCell[][] = [];
    handlungsbereich[1].forEach((geaendert, projekt) => {
      const projektdaten: TableCell[] = [];
      columns.forEach(column => {
        const data = props.monatsbericht_neu.get_projekt_data(projekt, column) as string;
        const changed = geaendert.includes(column);

        let output: ReactNode;
        if (column.startsWith('Zuwendung')) {
          if (!changed) output = formatCurrency(data);
          else {
            const wert_alt = props.monatsbericht_alt.get_projekt_data(projekt, column) as string;
            if (wert_alt) {
              output = (
                <>
                  <span className="wert-alt">
                    {formatCurrency(wert_alt)}
                    <br />
                  </span>
                  <span className="wert-neu">{formatCurrency(data)}</span>
                </>
              );
            } else output = <span className="wert-neu">{formatCurrency(data)}</span>;
          }
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
