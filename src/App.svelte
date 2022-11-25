<svelte:head>
	<script src='https://cdn.plot.ly/plotly-2.12.1.min.js'></script>
</svelte:head>

<script>
  import { writable } from 'svelte/store';
	import Modal from 'svelte-simple-modal';
  const modal = writable(null);
  const showModal = () => modal.set(Popup);

  import Spinner from './lib/Spinner.svelte';
  import Popup from './lib/Popup.svelte';
  import logo from './assets/logo.png';
  import {fetchData, corMat} from './lib/sheet';

  const period = 90;
  let to = new Date();
  let from = ((date) => {
          date.setDate(to.getDate() - (period===undefined?30:period));
          return date;
        }
  )(new Date())


  let assets=[
    {ticker:"SPY", name:'SP 500', pretty: 'SP500'},
    {ticker:"NDAQ",name:'NASDAQ', pretty: 'NASDAQ'},
    {ticker:"BNO",name:'Brent Oil Fund', pretty: 'OIL'},
    {ticker:"IAUM",name:'Gold ETF', pretty: 'GOLD'},
    {ticker:"BTCUSD",name:'Bitcoin', pretty: 'BTC'},
    {ticker:"TIP",name:'US Bonds ETF', pretty: 'TIPS'},
    {ticker:"MCHI",name:'China Corp ETF', pretty: 'CHINA CORP'}
  ];
  
  let tickers=assets.map(a => a.ticker);
  let selectedTickers = tickers;
  let names = assets.map(a => a.name);;
  let prettyShortNames=assets.map(a => a.pretty);
  var data;
  fetchData().then(d => {
    data = d;
    console.log('data',data);
    updateView();
  });
  


  
  let heatmap=function(matrix){
    var shortNames;
    let selectedAssets= assets.filter((a)=>selectedTickers.includes(a.ticker));
    shortNames = selectedAssets.map((a)=>a.pretty);
    console.log("heatmap");
    console.log(matrix.data);
    var data = [
      {
        z: matrix,
        x: shortNames,
        y: shortNames,
        type: 'heatmap',
        hoverongaps: false
      }
    ];


    Plotly.newPlot('heatmap', data);
  }

  const chart=function(ticker, Y){

    let aum = [1];
    for(let k=0;k<Y.length;k++){
      aum.push(aum[k]*(Y[k]+1));
    }

    var trace = {
      //x: [1, 60],
      y: aum,
      type: 'scatter'
    };

    var data = [trace];

    Plotly.newPlot(
      'chart:'+ticker, 
      data,
      {
        title: {
          text: ticker,font: {
          family: 'Courier New, monospace',
          size: 24
          }
        },
        xaxis: {showticklabels: false}
      },
  
      {showLegend:false},
      {staticPlot: true},
      {showticklabels: false}
      );
  }


  let returns;
  var loading = true;
  
  async function updateView(){
    loading = true;
    console.log('selected tickers',selectedTickers);
    let corrMatrix = await corMat(data,selectedTickers);
    console.log('corr',corrMatrix);
    heatmap(corrMatrix);

    tickers.forEach(t => {
      chart(t,data[t]);
    });
    
    loading=false;
  }

</script>

<main>
  <div>  
      <img src={logo} class="logo svelte" alt="Svelte Logo" />
      <h3>Efficient Frontier Capital</h3>
  </div>
  <h1>Correlation of Financial Assets</h1>
  

  
  {#each tickers as t,index}
    <label>
      <input type=checkbox bind:group={selectedTickers} value={t}>
      {names[index]}
    </label> |
  {/each}
  <br/>
  <Modal show={$modal}>
    <button on:click={showModal}>Want more assets? ℹ️</button>
  </Modal>


  <button on:click={updateView}>Update heatmap 🔥</button>
  <br/>
  {#if loading}<Spinner/>
  {/if}

  <div id="heatmap"></div>
  {#each tickers as t,index}
    <div id={"chart:"+t}></div>
    <hr/>
  {/each}
  
  

<div style="text-align: center;">date range {[from.toISOString().substring(0,10),
to.toISOString().substring(0,10)]}
</div>

<br>




<div >
<p style="text-align: center;">
   by Davide Carboni 2022. <a href="https://digitaldavide.me">digitaldavide.me</a> 
</p>
<p style="text-align: center;">
  Our privacy and cookie policy is simple: we don't collect your personal data and we use a session cookie.
</p>

</div>

</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
