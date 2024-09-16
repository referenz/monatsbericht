<script lang="ts">
  import type { ITableCell } from "../types/ITableCell";
  import type { IProjektDaten } from "../lib/Monatsbericht";
  import { onMount } from "svelte";

  export let rows: ITableCell[][];
  export let columns: (keyof IProjektDaten)[];
  export let expandHeadline: string;

  let caption: HTMLTableCaptionElement;
  onMount(() => {
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
      {
        rootMargin: "0px 0px 10000px 0px",
        threshold: [1],
      }
    );
    observer.observe(caption);
  });

  // TODO: Vielleicht mit den Svelte-eigenen Transition-Funktionen realisieren
  function collapseTable(e: Event) {
    const button = e.target as HTMLButtonElement;
    button.innerText = button.innerText === "Einklappen" ? "Ausklappen" : "Einklappen";

    const table = button.closest("table");
    if (table?.classList.contains("collapsed")) table.classList.remove("collapsed");
    table?.classList.toggle("collapsing");
    table?.addEventListener("transitionend", () => {
      if (table.classList.contains("collapsing")) table.classList.add("collapsed");
    });
    caption.scrollIntoView({behavior: "smooth"});
  }
</script>

<table class="projektliste">
  <caption bind:this={caption}>
    <span class="caption-flexbox">
      <span class="caption-text">
        {#if expandHeadline}<span class="expand">{expandHeadline}:&nbsp;</span>{/if}
        <slot />
        <span class="projektzahl"> ({rows.length})</span>
      </span>
      <span class="collapse-link">
        <button type="button" on:click={collapseTable}>Einklappen</button>
      </span>
    </span>
  </caption>
  <thead>
    <tr>
      {#each columns as column}<th scope="col">{column}</th>{/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as cells}
      <tr>
        // eslint-disable-next-line svelte/no-at-html-tags
        {#each cells as cell}<td class={cell.class.toString()}>{@html cell.value.innerHTML}</td>{/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
  }

  table:not(.collapsed) caption span.projektzahl {
    display: none;
  }

  .collapse-link button {
    background-color: inherit;
    border: 0;
    text-decoration: underline;
    color: inherit;
  }

  .collapse-link button::before {
    content: "[";
  }

  .collapse-link button::after {
    content: "]";
  }
</style>
