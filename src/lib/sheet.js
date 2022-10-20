import axios from 'axios';
import calculateCorrelation from "calculate-correlation";
const correlation = calculateCorrelation;


export let get=async function(){
    let response = 
    await axios.get('https://eo6ay38smfaaigz.m.pipedream.net/');
    return response.data;
}


function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}
  


const data =
[["date","BNO","BTCUSD","ETHUSD","IAUM","TIP","SPY","MCHI","NDAQ"],
["2022-07-25","0.010","0.004","-0.002","0.001","0.000","0.012","0.004","-0.006"],
["2022-07-26","-0.033","-0.075","-0.118","-0.010","-0.006","-0.025","-0.010","-0.006"]
];
let transform=function(data){
    let names = data[0].splice(1);
    console.log('names',names);
    //remove first row
    data = data.splice(1);
    console.log('data',data);
    let dataT=transpose(data);
    dataT=dataT.splice(1);
    console.log('dataT',dataT);
    let obj={};
    for (let i=0; i<names.length;i++){
        obj[names[i]] = dataT[i];
    }
    return obj;

}

let corr = function(data,ticker1, ticker2){
    return correlation(data[ticker1],data[ticker2]);
}

let m=[
    [1,1,1],
    [2,2,2],
    [3,3,3]
];
console.log(transpose(m));

let obj = transform(data);
console.log('transform',obj);

console.log(corr(obj,'BNO','BTCUSD'));