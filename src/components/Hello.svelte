<script>
  import { invoke } from '@tauri-apps/api/tauri'
  export let count;
  let times = 2;
  $: result = count * times;
</script>
<div>{ count } x { times } = { result }</div>
{#await invoke('test') then value}
<div>{ value }</div>
{/await}
<button on:click={()=>{times+=1}}>x1</button>