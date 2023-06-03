<script lang="ts">
  import Monatsbericht from "../lib/Monatsbericht";
  import type { IFileBuffer } from "../types/IFileBuffer";
  import CompareNumbers from "./CompareNumbers.svelte";
  import CompareSums from "./CompareSums.svelte";
  import CompareTitle from "./CompareTitle.svelte";


    export let monatsbericht: Monatsbericht;
    export let dateiAlt: IFileBuffer;

    const monatsberichtAlt = Monatsbericht.fromArrayBuffer(dateiAlt.name, dateiAlt.buffer);
</script>

<h2>Monatsberichte-Vergleich</h2>
<CompareSums monatsbericht={monatsbericht} monatsberichtAlt={monatsberichtAlt} />
<CompareTitle monatsbericht={monatsbericht} monatsberichtAlt={monatsberichtAlt} />
<CompareNumbers monatsbericht={monatsbericht} monatsberichtAlt={monatsberichtAlt} />