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
  import calculateCorrelation from "calculate-correlation";
  import {createPriceDataframe, createReturnsDataframe} from './lib/portfolio';

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
    {ticker:"C:XAUUSD",name:'Gold', pretty: 'GOLD'},
    {ticker:"X:BTCUSD",name:'Bitcoin', pretty: 'BTC'},
    {ticker:"X:ETHUSD",name:'Ether', pretty: 'ETH'},
    {ticker:"TIP",name:'US Bonds ETF', pretty: 'TIPS'},
    {ticker:"FXI",name:'China Corp ETF', pretty: 'CHINA CORP'}
  ];
  
  let tickers=["SPY","NDAQ","BNO","C:XAUUSD","X:BTCUSD","X:ETHUSD","TIP","FXI"];
  let selectedTickers = tickers;
  let names = ["SP 500",
			"Nasdaq",
			"Brent Oil Fund",
			"Gold", 
			"Bitcoin",
      "Ether",
			"US Bonds ETF",
			"China Corp. ETF"];
  let prettyShortNames=['SP500','NDAQ','OIL','GOLD','BTC',"ETH",'TIPS','CN-CORP'];




  
  let heatmap=function(matrix){
    var shortNames;
    let selectedAssets= assets.filter((a)=>selectedTickers.includes(a.ticker));
    shortNames = selectedAssets.map((a)=>a.pretty);
    console.log(shortNames);
    var data = [
      {
        z: matrix.data,
        x: shortNames,
        y: shortNames,
        type: 'heatmap',
        hoverongaps: false
      }
    ];

    Plotly.newPlot('heatmap', data);
  }




const correlationMatrix=function(aDataframe){    
    //console.log(aDataframe);
    var df;
    //if time is a column must be dropped
    try {
        df = aDataframe.drop("time");
    } catch (error) {
        console.log("no time column found");
        df = aDataframe;
    }
   

    var d = df.toDict();
    var keys = Object.keys(d);
    var matrix=[];
    
    for(var i = 0; i<keys.length; i++){
        var row = [];
        matrix.push(row);
        for(var j = 0; j<keys.length; j++){
            row.push(calculateCorrelation(d[keys[i]],d[keys[j]]));
        }
    }
    return {'data':matrix, 'meta':keys};
}

  let prices; 
  let returns;
  var loading = true;

  const myAlert=function(){
    
  }
  
  async function updateView(){
    loading = true;
    console.log(selectedTickers);
    prices = await createPriceDataframe(selectedTickers, period);
    returns = await createReturnsDataframe(prices);
    heatmap(correlationMatrix(returns));
    loading=false;
  }
  updateView();

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
