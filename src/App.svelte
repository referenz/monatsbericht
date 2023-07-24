<script lang="ts">
  import { globalState } from "./utils/state";
  import type { IFileBuffer } from "./types/IFileBuffer";
  import UploadForm from "./components/UploadForm.svelte";
  import Prompt from "./components/Prompt.svelte";
  import Footer from "./components/Footer.svelte";
  import Analyze from "./components/Analyze.svelte";
  import type Monatsbericht from "./lib/Monatsbericht";
  import Compare from "./components/Compare.svelte";
  import { APP_VERSION } from './vite-env';

  import Logger from "./utils/logger";
  import { beforeUpdate } from "svelte";
  import FatalError from "./components/FatalError.svelte";

  let dateiAktuell: IFileBuffer;
  let monatsbericht: Monatsbericht;

  let dateiAlt: IFileBuffer;

  let logger = Logger;
  beforeUpdate(() => {
    logger = logger;
  });

</script>

<svelte:head>
  <meta name="version" content={APP_VERSION} />
</svelte:head>

<Footer {logger} />

<main class="container">
  {#if logger.hasFatalMsg}
    <FatalError bind:logger />
  {:else if $globalState.page === "INIT"}
    <UploadForm bind:dateiAktuell bind:dateiAlt />
  {:else if $globalState.page === "PROMPT"}
    <Prompt {dateiAktuell} bind:monatsbericht />
  {:else if $globalState.page === "ANALYZE_ONE"}
    <Analyze {monatsbericht} />
  {:else if $globalState.page === "INPUT_SECOND"}
    <UploadForm bind:dateiAktuell bind:dateiAlt />
  {:else if $globalState.page === "COMPARE_TWO"}
    <Compare {monatsbericht} {dateiAlt} />
  {/if}
</main>
