<svelte:head>
	<script src='https://cdn.plot.ly/plotly-2.12.1.min.js'></script>
</svelte:head>

<script>
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



  
  let tickers=["SPY","NDAQ","BNO","C:XAUUSD","X:BTCUSD","TIP","FXI"];

  let names = ["SP 500",
			"Nasdaq",
			"Brent Oil Fund",
			"Gold", 
			"Bitcoin",
			"US Bonds ETF",
			"China Corp. ETF"];
  let prettyShortNames=['SP500','NDAQ','OIL','AU','BTC','TIPS','CN-CORP'];
  



  
  let heatmap=function(matrix){
    var data = [
      {
        z: matrix.data,
        x: prettyShortNames,
        y: prettyShortNames,
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
  
  (async ()=>{
    prices = await createPriceDataframe(tickers, period);
    returns = await createReturnsDataframe(prices);
    heatmap(correlationMatrix(returns));
  })();
  

</script>

<main>
  <div>
    
      <img src={logo} class="logo svelte" alt="Svelte Logo" />

  </div>
  <h1>Correlated Finance</h1>






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
