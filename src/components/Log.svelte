<script lang="ts">
  import { visible } from "../utils/logger";
  import Logger from "../utils/logger";
  //export let logger: typeof Logger;

  const entries = Logger.log
    .slice()
    .filter(entry => visible.includes(entry.level))
    .reverse();
</script>

<table class="table logTable">
  <thead>
    <tr>
      <th>Zeitpunkt</th>
      <th>Level</th>
      <th>Nachricht</th>
    </tr>
  </thead>
  <tbody>
    {#each entries as entry}
      <tr class={entry.level}>
        <td>
          {entry.time.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          })}{" "}
          Uhr
        </td>
        <td>{entry.level}</td>
        <td>{entry.message}</td>
      </tr>
    {/each}
  </tbody>
</table>
