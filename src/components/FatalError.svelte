<script lang="ts">
  import { globalState } from "../utils/state";
  import type Logger from "../utils/logger";
  export let logger: typeof Logger;

  const fatalMsgs = logger.log
    .slice()
    .filter(entry => entry.level === "fatal")
    .reverse();

  function handleReset() {
    logger.reset();
    globalState.gotoPage('INIT');
  }
</script>

<h2>Schwerwiegender Fehler aufgetreten</h2>
{#each fatalMsgs as entry}
  <p>{entry.message}</p>
{/each}
<div>
  <button type="button" on:click={handleReset}>Neustart</button>
</div>
