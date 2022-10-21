<script lang="ts">
  import type Monatsbericht from "../lib/Monatsbericht";
  import TabelleProjekte from "./TabelleProjekte.svelte";

  export let monatsbericht: Monatsbericht;
  export let monatsberichtAlt: Monatsbericht;

  const abweichungProjektzahl = monatsbericht.abweichungProjektzahlNachHandlungsbereichen(monatsberichtAlt);
</script>

<h3>Hinzugekommene Projekte</h3>
{#if abweichungProjektzahl[0].size > 0}
  <TabelleProjekte
    projekte={Array.from(abweichungProjektzahl[0])}
    {monatsbericht}
    expandHeadline="Hinzugekommene Projekte"
  />
{:else}
  <p>Keine hinzugekommenen Projekte</p>
{/if}

<h3>Entfernte Projekte</h3>
{#if abweichungProjektzahl[1].size > 0}
  <TabelleProjekte
    projekte={Array.from(abweichungProjektzahl[1])}
    monatsbericht={monatsberichtAlt}
    expandHeadline="Entfernte Projekte"
  />
{:else}
  <p>Keine entfernten Projekte</p>
{/if}
