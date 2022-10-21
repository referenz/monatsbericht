<script lang="ts">
  import type Monatsbericht from "../lib/Monatsbericht";
  import type { IProjektDaten } from "../lib/Monatsbericht";
  export let monatsbericht: Monatsbericht;

  const geendeteProjekte = monatsbericht.getGeendeteProjekte();
  const hatGeendeteProjekte = geendeteProjekte.length > 0 ? true : false;

  const columns: (keyof IProjektDaten)[] = ['Projektnr.', 'Trägername', 'Projekttitel', 'Handlungsbereich', 'Projektlaufzeit'];
  const rows = geendeteProjekte.map(projektnr => columns.map(spalte => monatsbericht.getProjektData(projektnr, spalte)));
</script>

{#if !hatGeendeteProjekte}
  <p>Keine in diesem Jahr bisher geendeten Projekte gefunden</p>
{:else}
  <table>
    <caption>
      <span class="expand">Auswertung:&nbsp;</span>
      In diesem Jahr geendete Projekte (Stichtag:{" "}
      {new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} )
    </caption>
    <thead>
      <tr>
        {#each columns as column}
          <th scope="col">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as projekt}
        <tr>
          <td>{projekt[0]}</td>
          <td>{projekt[1]}</td>
          <td>{projekt[2]}</td>
          <td>{projekt[3]}</td>
          <td>
            {projekt[4]?.[0]} - {projekt[4]?.[1]}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
