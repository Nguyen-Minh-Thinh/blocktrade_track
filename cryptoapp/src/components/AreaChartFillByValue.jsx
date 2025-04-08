import React, { useState, useEffect } from "react";
import CanvasJSReact from '@canvasjs/react-stockcharts';

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const AreaChartFillByValue = () => {
  const [dataPoints1, setDataPoints1] = useState([]);
  const [dataPoints2, setDataPoints2] = useState([]);
  const [dataPoints3, setDataPoints3] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("https://canvasjs.com/data/docs/btcusd2018.json")
      .then(res => res.json())
      .then(data => {
        const dps1 = data.map(item => ({
          x: new Date(item.date),
          y: [Number(item.open), Number(item.high), Number(item.low), Number(item.close)],
          color: item.open < item.close ? "#0e9f6e" : "#F05252",
        }));
        const dps2 = data.map(item => ({
          x: new Date(item.date),
          y: Number(item.volume_usd),
          color: item.open < item.close ? "#0e9f6e" : "#F05252",
        }));
        const dps3 = data.map(item => ({
          x: new Date(item.date),
          y: Number(item.close)
        }));

        setDataPoints1(dps1);
        setDataPoints2(dps2);
        setDataPoints3(dps3);
        setIsLoaded(true);
      });
  }, []);

  const addSymbols = (e) => {
    const suffixes = ["", "K", "M", "B"];
    let order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
    order = order > suffixes.length - 1 ? suffixes.length - 1 : order;
    return CanvasJSReact.CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffixes[order];
  };

  const options = {
    theme: "dark2",
    animationEnabled: true,
    backgroundColor: "transparent",
    exportEnabled: true,
    // title: { text: "Bitcoin Price & Volume" },
    charts: [
      {
        toolTip: {enabled: false},
        axisX: {
            gridColor:"transparent",
          lineThickness: 1,
          tickLength: 0,
          labelFormatter: () => ""
        },
        axisY: { prefix: "$",labelFormatter: addSymbols,labelFontSize:14, gridColor:"transparent", tickLength: 0 },
        legend: { verticalAlign: "top" },
        data: [
          {
            // showInLegend: true,
            // name: "Stock Price (in USD)",
            yValueFormatString: "$#,###.##",
            type: "candlestick",
            dataPoints: dataPoints1,
            risingColor: "#0e9f6e",
            fallingColor: "#F05252",
            
          }
        ],
      },
      {
        height: 150,
        toolTip: { enabled: false },
        axisY: { prefix: "$", labelFormatter: addSymbols,labelFontSize:14, gridColor:"transparent", tickLength:0 },
        legend: { verticalAlign: "top" },
        data: [
          {
            showInLegend: true,
            name: "Volume ",
            yValueFormatString: "$#,###.##",
            type: "column",
            dataPoints: dataPoints2
          }
        ]
      }
    ],
    rangeSelector: {
        label: "",
        selectedRangeButtonIndex: 1,
        // buttons: [{
        //     range: 1, 
        //     rangeType: "month",
        //     label: "1Month"
        //   },{            
        //     range: 2,
        //     rangeType: "month",
        //     label: "2Months"
        //   },{            
        //     rangeType: "all",
        //     label: "Show All" //Change it to "All"
            
        //   }],
        buttonStyle: {
            backgroundColor: "#030712",
            backgroundColorOnHover	: "#6B7280",
            backgroundColorOnSelect: "#6B7280",
            borderColor: "#4B5563",
            labelFontSize:14,
            padding: {left:10, right:10, top:5, bottom:5},
            spacing:10,
            width:50,
            maxWidth: 100,
        },
        inputFields: {
            enabled: false,
             startValue: new Date(2017, 6, 1),
            endValue: new Date(2017, 9, 1),
            style: {
                backgroundColor: "#030712",
                borderColor: "#4B5563",
                borderColorOnFocus: "#4B5563",
                fontSize: 14,
                padding: {left:10, right:10, top:10, bottom:10},
            },
          },
          
    },
    navigator: {
        enabled: false,
      data: [{ dataPoints: dataPoints3 }],
      slider: {
        minimum: new Date(2018, 6, 1),
        maximum: new Date(2018, 8, 1)
      }
    }
  };

  return (
    <div className="w-full p-3 py-10">
      {isLoaded && <CanvasJSStockChart options={options} />}
    </div>
  );
};

export default AreaChartFillByValue;
