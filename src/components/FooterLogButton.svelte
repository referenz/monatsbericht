<script lang="ts">
  import "bootstrap";
  import Logger from "../utils/logger";
  import infoIcon from "../assets/info-circle-fill.svg";
  import xIcon from "../assets/x-circle-fill.svg";
  import Log from "./Log.svelte";

  const buttonLabel =
    (Logger.countVisibleMsgs() === 1 ? "Eine Ereignismeldung " : `${Logger.countVisibleMsgs()} Ereignismeldungen `) +
    "vorhanden";
  const buttonImage = Logger.counter.error > 0 || Logger.counter.fatal > 0 ? xIcon : infoIcon;
</script>

<button type="button" title={buttonLabel} id="logButton" data-bs-toggle="offcanvas" data-bs-target="#logtable">
  <img src={buttonImage} alt={buttonLabel} />
</button>

<div class="offcanvas offcanvas-bottom" tabindex="-1" id="logtable">
  <div class="offcanvas-header">
    <h2 class="offcanvas-title" id="logtableHeadline">Ereignismeldungen</h2>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
  </div>
  <div class="offcanvas-body">
    <Log />
  </div>
</div>

<style>
  button#logButton {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
