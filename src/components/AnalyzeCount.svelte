<script lang="ts">
  import type Monatsbericht from "../lib/Monatsbericht";
  import { countProjects } from "../lib/countProjects";
  export let monatsbericht: Monatsbericht;
  const handlungsbereicheMitThemen = countProjects(monatsbericht);
</script>

<table>
  <caption>
    <span class="expand">Auswertung:&nbsp;</span>
    Zählung (ohne geendete)
  </caption>
  <thead>
    <tr>
      <th scope="col">Handlungsbereich</th>
      <th scope="col">Themenfeld</th>
      <th scope="col">Anzahl Projekte</th>
    </tr>
  </thead>
  {#each Array.from(handlungsbereicheMitThemen) as handlungsbereich}
    <tbody>
      <tr class="handlungsbereich">
        <td>{handlungsbereich[0]}</td>
        <td />
        <td class="anzahl">{handlungsbereich[1].anzahl}</td>
      </tr>
      {#if handlungsbereich[1].hatThemenfelder}
        {#each Array.from(handlungsbereich[1].themenfelder) as themenfeld}
          <tr>
            <td class="thema-davon" />
            <td>{themenfeld[0]}</td>
            <td class="anzahl">{themenfeld[1]}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  {/each}
  <tfoot>
    <tr>
      <td>Insgesamt</td>
      <td class="anzahl" colSpan={2}>
        {monatsbericht.getProjekte(true).size}
      </td>
    </tr>
  </tfoot>
</table>

<style>
  td.anzahl,
  td.thema-davon {
    text-align: right;
  }

  tr.handlungsbereich {
    font-weight: bold;
  }

  td.thema-davon::after {
    content: "davon";
  }

  tbody:nth-of-type(even) tr {
    background-color: #f3f3f3;
  }
</style>
