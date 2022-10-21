<script lang="ts">
  import type Logger from "../utils/logger";
  import LogButton from "./FooterLogButton.svelte";

  export let logger: typeof Logger;
</script>

<footer class="container-fluid fixed-bottom">
  <div>
    <h1>Monatsberichtsauswertung</h1>
    {#key logger}
      {#if logger.hasVisibleMsg}<LogButton />{/if}
    {/key}
  </div>
  <a class="github" rel="noopener noreferrer" target="_blank" href="https://github.com/referenz/monatsbericht">
    Quellcode
  </a>
</footer>

<style>
  footer {
    border-top: 1px solid black;
    background-color: #eee;
    display: flex;
    justify-content: space-between;
    font-size: 80%;
    padding-bottom: 1px;
  }

  footer h1 {
    display: inline;
    font-size: inherit;
  }

  footer h1:not(:only-child)::after {
    content: " | ";
  }

  footer a {
    text-decoration: none;
    color: inherit;
    font: inherit;
  }

  footer a.github::before {
    content: " ";
    background: url("../assets/GitHub-Mark-32px.png") left center no-repeat;
    background-size: 85% auto;
    padding-left: 3ex;
  }
</style>
