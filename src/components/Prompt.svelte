<script lang="ts">
  import Monatsbericht from "../lib/Monatsbericht";
  import type IFileBuffer from "../types/IFileBuffer";
  import { globalState } from "../utils/state";

  export let dateiAktuell: IFileBuffer;
  export let monatsbericht: Monatsbericht

  function analyzeOne() {
    monatsbericht = Monatsbericht.fromArrayBuffer(dateiAktuell.name, dateiAktuell.buffer);
    globalState.gotoPage('ANALYZE_ONE');
  }

  function compareTwo() {
    monatsbericht = Monatsbericht.fromArrayBuffer(dateiAktuell.name, dateiAktuell.buffer);
    globalState.gotoPage('INPUT_SECOND');
  }

</script>

  <div>Datei &quot;{dateiAktuell.name}&quot; wurde eingelesen.</div>
  <div id="buttonrow">
    <button type="button" class="btn btn-primary" on:click={analyzeOne}
      >Diesen Monatsbericht auswerten</button
    >
    <button type="button" class="btn btn-primary" on:click={compareTwo}
      >Diesen Monatsbericht mit älterem Monatsbericht vergleichen</button
    >
  </div>

<style>
  div:first-of-type {
    text-align: center;
    font-size: 133%;
  }

  #buttonrow {
    margin-top: 1em;
    display: flex;
    justify-content: center;
  }

  button {
    margin-left: 3vw;
    margin-right: 3vw;
    margin-bottom: 2rem;

    /* flex: 1 1 0px; */
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.45);

    font-weight: bold;
    font-size: clamp(13px, 1.2vw, 40px);
    width: clamp(250px, 25vw, 500px);
    height: clamp(75px, 9vw, 150px);
  }

  button:hover {
    box-shadow: none;
  }
</style>
