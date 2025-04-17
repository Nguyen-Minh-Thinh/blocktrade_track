import React, { useState, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import io from "socket.io-client";

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

const AreaChartFillByValue = () => {
  const [dataPoints1, setDataPoints1] = useState([]); // Candlestick data
  const [dataPoints2, setDataPoints2] = useState([]); // Volume data
  const [dataPoints3, setDataPoints3] = useState([]); // Close price for navigator
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [symbol] = useState("BTCUSDT"); // Coin symbol
  const [interval] = useState("5m"); // Time interval

  // Kết nối tới Flask SocketIO server
  const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    cors: { origin: "*" },
  });

  // Hàm lấy dữ liệu ban đầu từ API
  const fetchInitialData = async () => {
    if (!symbol || !interval) {
      setError("Symbol or interval is missing");
      return;
    }

    try {
      console.log(`Fetching initial data for ${symbol}_${interval}`);
      const response = await fetch(
        `http://localhost:5000/candlestick_data?symbol=${symbol}&interval=${interval}&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        console.error("API error:", data.error);
        setError(data.error);
        setIsLoaded(false);
        return;
      }

      const dps1 = data.map((item) => ({
        x: new Date(item.timestamp),
        y: [
          Number(item.open),
          Number(item.high),
          Number(item.low),
          Number(item.close),
        ],
        color: item.open < item.close ? "#0e9f6e" : "#F05252",
      }));

      const dps2 = data.map((item) => ({
        x: new Date(item.timestamp),
        y: Number(item.volume),
        color: item.open < item.close ? "#0e9f6e" : "#F05252",
      }));

      const dps3 = data.map((item) => ({
        x: new Date(item.timestamp),
        y: Number(item.close),
      }));

      setDataPoints1(dps1);
      setDataPoints2(dps2);
      setDataPoints3(dps3);
      setIsLoaded(true);
      setError(null);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to fetch initial data");
      setIsLoaded(false);
    }
  };

  // Lắng nghe dữ liệu thời gian thực từ WebSocket
  useEffect(() => {
    console.log("useEffect running with symbol:", symbol, "interval:", interval);

    // Lấy dữ liệu ban đầu
    fetchInitialData();

    // Kết nối WebSocket
    socket.on("connect", () => {
      console.log("Connected to SocketIO server");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to WebSocket");
    });

    // Lắng nghe sự kiện candle_update cho symbol và interval
    socket.on(`candle_update_${symbol}_${interval}`, (candle) => {
      console.log(`Received candle for ${symbol}_${interval}:`, candle);
      const newCandle = {
        x: new Date(candle.timestamp),
        y: [
          Number(candle.open),
          Number(candle.high),
          Number(candle.low),
          Number(candle.close),
        ],
        color: candle.open < candle.close ? "#0e9f6e" : "#F05252",
      };

      const newVolume = {
        x: new Date(candle.timestamp),
        y: Number(candle.volume),
        color: candle.open < candle.close ? "#0e9f6e" : "#F05252",
      };

      const newClose = {
        x: new Date(candle.timestamp),
        y: Number(candle.close),
      };

      // Cập nhật state với dữ liệu mới
      setDataPoints1((prev) => {
        const updated = [...prev, newCandle];
        if (updated.length > 100) updated.shift(); // Giữ tối đa 100 nến
        return updated;
      });

      setDataPoints2((prev) => {
        const updated = [...prev, newVolume];
        if (updated.length > 100) updated.shift();
        return updated;
      });

      setDataPoints3((prev) => {
        const updated = [...prev, newClose];
        if (updated.length > 100) updated.shift();
        return updated;
      });
    });

    // Cleanup khi component unmount
    return () => {
      console.log("Disconnecting SocketIO");
      socket.disconnect();
    };
  }, [symbol, interval]);

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
    charts: [
      {
        toolTip: { enabled: false },
        axisX: {
          gridColor: "transparent",
          lineThickness: 1,
          tickLength: 0,
          labelFormatter: () => "",
        },
        axisY: {
          prefix: "$",
          labelFormatter: addSymbols,
          labelFontSize: 14,
          gridColor: "transparent",
          tickLength: 0,
        },
        legend: { verticalAlign: "top" },
        data: [
          {
            yValueFormatString: "$#,###.##",
            type: "candlestick",
            dataPoints: dataPoints1,
            risingColor: "#0e9f6e",
            fallingColor: "#F05252",
          },
        ],
      },
      {
        height: 150,
        toolTip: { enabled: false },
        axisY: {
          prefix: "$",
          labelFormatter: addSymbols,
          labelFontSize: 14,
          gridColor: "transparent",
          tickLength: 0,
        },
        legend: { verticalAlign: "top" },
        data: [
          {
            showInLegend: true,
            name: "Volume ",
            yValueFormatString: "$#,###.##",
            type: "column",
            dataPoints: dataPoints2,
          },
        ],
      },
    ],
    rangeSelector: {
      label: "",
      selectedRangeButtonIndex: 1,
      buttonStyle: {
        backgroundColor: "#030712",
        backgroundColorOnHover: "#6B7280",
        backgroundColorOnSelect: "#6B7280",
        borderColor: "#4B5563",
        labelFontSize: 14,
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
        spacing: 10,
        width: 50,
        maxWidth: 100,
      },
      inputFields: {
        enabled: false,
      },
    },
    navigator: {
      enabled: false,
      data: [{ dataPoints: dataPoints3 }],
    },
  };

  return (
    <div className="w-full p-3 py-10">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {isLoaded ? (
        <CanvasJSStockChart options={options} />
      ) : (
        <div>Loading chart...</div>
      )}
    </div>
  );
};

export default AreaChartFillByValue;