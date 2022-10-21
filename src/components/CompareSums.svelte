<script lang="ts">
  import relevantColumns from "../lib/relevantColumns";
  import type { ITableCell } from "../types/ITableCell";
  import type Monatsbericht from "../lib/Monatsbericht";
  import { formatCurrency } from "../lib/formatCurrency";
  import cellClassName from "../lib/cellClassName";
  import TabelleHandlungsbereich from "./TabelleHandlungsbereich.svelte";
  import type { IProjektDaten } from "../lib/Monatsbericht";

  export let monatsbericht: Monatsbericht;
  export let monatsberichtAlt: Monatsbericht;

  const abweichungFoerdersummen = monatsbericht.abweichungProjektdatenNachHandlungsbereichen(
    monatsberichtAlt,
    "Zuwendungen"
  );

  const handlungsbereiche = Array.from(abweichungFoerdersummen);

  function listHandlungsbereich(
    handlungsbereich: [string, Map<string, string[]>]
  ): [(keyof IProjektDaten)[], ITableCell[][]] {
    const columns = relevantColumns(handlungsbereich[0], "zuwendung");

    const rows: ITableCell[][] = [];
    handlungsbereich[1].forEach((geaendert, projekt) => {
      const projektdaten: ITableCell[] = [];
      columns.forEach(column => {
        const data = monatsbericht.getProjektData(projekt, column) as string;
        const changed = geaendert.includes(column);

        let output = document.createElement("td");
        if (column.startsWith("Zuwendung")) {
          if (!changed) output.textContent = formatCurrency(data);
          else {
            const wertAlt = monatsberichtAlt.getProjektData(projekt, column) as string;
            if (wertAlt) {
              output.innerHTML =
                "<span class='wert-alt'>" +
                formatCurrency(wertAlt) +
                "<br /></span>" +
                "<span class='wert-neu'>" +
                formatCurrency(data) +
                "</span>";
            } else output.innerHTML = "<span class='wert-neu'>" + formatCurrency(data) + "</span>";
          }
        } else output.textContent = data;

        let cellClass = output.classList
        cellClass.add(cellClassName(column));
        if (changed) cellClass.add('changed');

        const cell: ITableCell = {
          column: column,
          class: cellClass,
          value: output,
        };
        projektdaten.push(cell);
      });

      rows.push(projektdaten);
    });

    return [columns, rows];
  }
</script>

<h3>Abweichende Fördersummen</h3>
{#each handlungsbereiche as handlungsbereich}
  <TabelleHandlungsbereich
    columns={listHandlungsbereich(handlungsbereich)[0]}
    rows={listHandlungsbereich(handlungsbereich)[1]}
    expandHeadline="Abweichende Fördersummen">{handlungsbereich[0]}</TabelleHandlungsbereich
  >
{/each}
