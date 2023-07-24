<script lang="ts">
  import type Monatsbericht from "../lib/Monatsbericht";
  import type { ITableCell } from "src/types/ITableCell";
  import type { IProjektDaten } from "../lib/Monatsbericht";
  import cellClassName from "../lib/cellClassName";
  import relevantColumns from "../lib/relevantColumns";
  import TabelleHandlungsbereich from "./TabelleHandlungsbereich.svelte";

  export let monatsbericht: Monatsbericht;
  export let projekte = Array.from(monatsbericht.getHandlungsbereicheMitProjekten());
  export let expandHeadline = "Projektliste";

  function listHandlungsbereich(handlungsbereich: [string, string[]]): [(keyof IProjektDaten)[], ITableCell[][]] {
    const columns = relevantColumns(handlungsbereich[0]);
    const rows: ITableCell[][] = [];
    handlungsbereich[1].forEach(projekt => {
      const projektdaten: ITableCell[] = [];
      columns.forEach(column => {
        const data = monatsbericht.getProjektData(projekt, column) as string | string[];
        let output = document.createElement("td");
        if ((column === "Bewilligungszeit" || column === "Projektlaufzeit") && data)
          output.textContent = `${data[0]} - ${data[1]}`;
        else output.textContent = data as string;

        const className = output.classList;
        className.add(cellClassName(column));

        const cell: ITableCell = {
          column: column,
          class: className,
          value: output,
        };
        projektdaten.push(cell);
      });
      rows.push(projektdaten);
    });

    return [columns, rows];
  }
</script>

{#each projekte as handlungsbereich}
  <TabelleHandlungsbereich
    columns={listHandlungsbereich(handlungsbereich)[0]}
    rows={listHandlungsbereich(handlungsbereich)[1]}
    {expandHeadline}
    >{handlungsbereich[0]}
  </TabelleHandlungsbereich>
{/each}
