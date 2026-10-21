<script lang="ts">
  // The wait before each retry, doubling from `base` seconds. Imported by interactive.svx.
  let { attempts, base }: { attempts: number; base: number } = $props();
  const delays = $derived(Array.from({ length: attempts }, (_, i) => base * 2 ** i));
  const total = $derived(delays.reduce((sum, d) => sum + d, 0));
</script>

<div class="table-wrap">
  <table>
    <thead>
      <tr><th>Retry</th><th align="right">Wait (s)</th><th align="right">Elapsed (s)</th></tr>
    </thead>
    <tbody>
      {#each delays as delay, i (i)}
        <tr><td>{i + 1}</td><td align="right">{delay}</td><td align="right">{delays.slice(0, i + 1).reduce((sum, d) => sum + d, 0)}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
<p class="total">The last retry starts <b>{total} s</b> after the first failure.</p>

<style>
  .total { margin: -12px 0 24px; font-size: 14px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .total b { color: var(--ink); font-weight: 600; }
</style>
