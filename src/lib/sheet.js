import axios from 'axios';
import calculateCorrelation from "calculate-correlation";
const correlation = calculateCorrelation;


let get=async function(){
    let response = 
    await axios.get('https://eo6ay38smfaaigz.m.pipedream.net/');
    return response.data;
}


function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}
  
/*
input data is
[["date","BNO","BTCUSD","ETHUSD","IAUM","TIP","SPY","MCHI","NDAQ"],
["2022-07-25","0.010","0.004","-0.002","0.001","0.000","0.012","0.004","-0.006"],
["2022-07-26","-0.033","-0.075","-0.118","-0.010","-0.006","-0.025","-0.010","-0.006"],
["2022-07-26","-0.033","-0.075","-0.118","-0.010","-0.006","-0.025","-0.010","-0.006"]
];

output obj is:

{
    "BNO":[val, val, ...],
    "BTCUSD":[val,val,...],
    ...
}
all values are daily returns
*/
let transform=function(data){
    let names = data[0].splice(1);

    //remove first row
    data = data.splice(1);

    let dataT=transpose(data);
    dataT=dataT.splice(1);

    let obj={};
    for (let i=0; i<names.length;i++){
        obj[names[i]] = dataT[i];
        obj[names[i]] = obj[names[i]].map(x=>parseFloat(x));
    }
    console.log('obj',obj);
    return obj;

}

let corr = function(data,ticker1, ticker2){
    return correlation(data[ticker1],data[ticker2]);
}

export let corMat=function(data,tickers /* [t1,t2,...] */){
    let mat = [];

    for (const t in tickers) {
        let row = [];
        for(const y in tickers){
            //row.push(tickers[t]+":"+tickers[y]);
            row.push(corr(data,tickers[t],tickers[y]))
        }
        mat.push(row);
    }
    return mat;
}



export let fetchData=async function(){
    let data = await get();
    let d = transform(data);
    return d;
}


fetchData().then(console.log);