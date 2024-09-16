<script lang="ts">
  import type Monatsbericht from "../lib/Monatsbericht";
  import type { IProjektDaten } from "../lib/Monatsbericht";
  import type { ITableCell } from "../types/ITableCell";
  import cellClassName from "../lib/cellClassName";
  import TabelleHandlungsbereich from "./TabelleHandlungsbereich.svelte";

  export let monatsbericht: Monatsbericht;
  export let monatsberichtAlt: Monatsbericht;

  const abweichungBezeichnungen = monatsbericht.abweichungProjektdatenNachHandlungsbereichen(
    monatsberichtAlt,
    "Bezeichnungen"
  );

  const handlungsbereiche = Array.from(abweichungBezeichnungen);

  function listHandlungsbereich(
    handlungsbereich: [string, Map<string, string[]>]
  ): [(keyof IProjektDaten)[], ITableCell[][]] {
    const columns: (keyof IProjektDaten)[] = ["Projektnr.", "Trägername", "Projekttitel"];
    const rows: ITableCell[][] = [];

    handlungsbereich[1].forEach((geaendert, projekt) => {
      const projektdaten: ITableCell[] = [];
      columns.forEach(column => {
        const data = monatsbericht.getProjektData(projekt, column) as string;
        const changed = geaendert.includes(column);

        let output = document.createElement("td");
        if ((column === "Trägername" || column === "Projekttitel") && changed) {
          output.innerHTML =
            "<span class='wert-alt'>" + (monatsberichtAlt.getProjektData(projekt, column) as string) +
            "<br /></span><span class='wert-neu'>" + data + "</span>";
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

<h3>Abweichende Bezeichnungen</h3>
{#each handlungsbereiche as handlungsbereich}
  <TabelleHandlungsbereich
    columns={listHandlungsbereich(handlungsbereich)[0]}
    rows={listHandlungsbereich(handlungsbereich)[1]}
    expandHeadline="Abweichende Bezeichnungen">{handlungsbereich[0]}</TabelleHandlungsbereich
  >
{/each}
