<script lang="ts">
  import type Monatsbericht from "src/lib/Monatsbericht";
  import AnalyzeCount from "./AnalyzeCount.svelte";
  import AnalyzedEnded from "./AnalyzedEnded.svelte";
  import TabelleProjekte from "./TabelleProjekte.svelte";

  export let monatsbericht: Monatsbericht;
</script>

<h2>Auswertung des aktuellen Monatsberichts</h2>
<h3>Statistische Auswertungen</h3>
<AnalyzeCount monatsbericht={monatsbericht} />
<AnalyzedEnded monatsbericht={monatsbericht} />

<p>Mehr Auswertungen kommen vielleicht noch &#8230;</p>

<h3>Projektliste</h3>
<TabelleProjekte monatsbericht={monatsbericht} />
