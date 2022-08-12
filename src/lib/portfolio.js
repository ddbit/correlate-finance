import {baseurl} from "./config"; 
import DataFrame from 'dataframe-js';
import axios from 'axios';



let sub = function (a,b){

    return a.map((e,i) => e - b[i]);
}

let div = function (a,b){
    return a.map((e,i) => e / b[i]);
}

let mul = function (a,b){
    return a.map((e,i) => e * b[i]);
}

let dot = function(a,b){
    let x = mul(a,b);
    return x.reduce((s,x)=>s+x)
}



let shift = function (a){
    //padded with last val
    let r = a.slice(1);
    //console.log(r);
    r.push(a[a.length - 1]);
    return r;
};



let getReturns = function (prices){
    return div(sub(shift(prices),prices),prices);
}


let load = async function(ticker){
   let url = baseurl+ticker;
   //let r = await fetch(url);
   let r = await axios.get(url);
   //console.log(r);
   //r = r.json();
   return r.data;
}

export let createPriceDataframe = async function(tickers, days){
    let t = [];
    
        
    for(let i=0;i<days;i++){
        let d=new Date(); 
        d.setDate(d.getDate() - days + i);
        t.push(d.toISOString().substring(0,10));
    }
    let dataframe = new DataFrame({
        time: t // <------ Time column
    }, ['time']);
    for(var k=0;k<tickers.length;k++){
        let t = tickers[k];
        let data = await load(t);
        let df = new DataFrame({
        time: data.times, // <------ Time column
        ticker:(data.prices)
        }, ['time',t+'_'+k]);
        dataframe = dataframe.join(df,"time");
    }
    return dataframe;
}

export let createReturnsDataframe = function(priceDataframe){
    //console.log(priceDataframe.toCollection());
    let colNames = priceDataframe.listColumns();
    let returnsDataframe=new DataFrame(priceDataframe);
    //returnsDataframe.show();
    colNames.forEach(
        colName=>{
            let col = priceDataframe.toDict()[colName];
            if(colName!=="time"){
                var newCol = getReturns(col);
                returnsDataframe = returnsDataframe.withColumn(colName, (row,index)=>newCol[index]);
            }
        }
    );

    return returnsDataframe;

}


let calculateGlobalReturns = function(dataframe,weights){
    let data=
    dataframe.map(row => row.set('return', dot(row.toArray().slice(1),weights)));
    return data;
}




let calculateAUM = function(dataframe, initialBalance){
    
    var column = function(df, colName){
        let a = df.select(colName).toArray();
        let b = [];
        a.forEach(x=>b.push(x[0]));
        return b;
    }
    var _calculateAUM = function(returns, initialBalance){
        let aum = Array();
    
        aum.push(initialBalance);
        for(var i=1;i<returns.length;i++){
            aum.push((1 + returns[i-1]) * aum[i-1]);
        }
        return aum;
    }

    let aum=_calculateAUM(column(dataframe, "return"),initialBalance);

    let k=0;
    dataframe=dataframe.withColumn('aum',()=>aum[k++]);
    //dataframe.show();
    return dataframe;
}

