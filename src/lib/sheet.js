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
  


//import  {data} from "./testData.js";
/*
[["date","BNO","BTCUSD","ETHUSD","IAUM","TIP","SPY","MCHI","NDAQ"],
["2022-07-25","0.010","0.004","-0.002","0.001","0.000","0.012","0.004","-0.006"],
["2022-07-26","-0.033","-0.075","-0.118","-0.010","-0.006","-0.025","-0.010","-0.006"],
["2022-07-26","-0.033","-0.075","-0.118","-0.010","-0.006","-0.025","-0.010","-0.006"]
];
*/
let transform=function(data){
    let names = data[0].splice(1);
    //console.log('names',names);
    //remove first row
    data = data.splice(1);
    //console.log('data',data);
    let dataT=transpose(data);
    dataT=dataT.splice(1);
    //console.log('dataT',dataT);
    let obj={};
    for (let i=0; i<names.length;i++){
        obj[names[i]] = dataT[i];
        obj[names[i]] = obj[names[i]].map(x=>parseFloat(x));
    }
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

let m=[
    [1,1,1],
    [2,2,2],
    [3,3,3]
];
//console.log(transpose(m));

//let obj = transform(data);
//console.log('transform',obj);


//console.log(corr({X:[2,3,2],Y:[0.1,1,-1]},'X','Y'));
//console.log(corr(obj,'NDAQ','BTCUSD'));
//console.log(corMat(obj,['NDAQ','BTCUSD','IAUM']));

export let fetchData=async function(){
    let data = await get();
    let d = transform(data);
    return d;
}


fetchData().then(console.log);