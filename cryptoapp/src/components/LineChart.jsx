import React, { useEffect, useRef } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const LineChart = () => {
  const chartRef = useRef(null);
  const timeRef = useRef(null);

  // Tạo dữ liệu ngẫu nhiên
  const generateData = () => {
    const limit = 50000;
    let y = 100;
    const dataPoints = [];

    for (let i = 0; i < limit; i++) {
      y += Math.round(Math.random() * 10 - 5);
      dataPoints.push({ x: i, y });
    }

    return [{
      type: "line",
      dataPoints
    }];
  };

  const startTime = useRef(new Date());

  useEffect(() => {
    const endTime = new Date();
    if (timeRef.current) {
      timeRef.current.innerHTML = "Time to Render: " + (endTime - startTime.current) + "ms";
    }
  }, []);

  const options = {
    zoomEnabled: false,
    toolTip: { enabled: false },
    
    animationEnabled: false,
    width:60, //Chiều rộng tùy chỉnh
    height:35,
    // title: {
    //   text: "Try Zooming - Panning"
    // },
    backgroundColor: "transparent",
    
    axisX: {
      lineThickness: 0,   // Ẩn đường trục X
      tickLength: 0,      // Ẩn các vạch đánh dấu
      labelFontSize: 0 ,   // Ẩn nhãn trục
      gridColor:"transparent",
    },
    axisY: {
      lineThickness: 0,   // Ẩn đường trục Y
      tickLength: 0,      // Ẩn các vạch đánh dấu
      labelFontSize: 0 ,
      gridColor:"transparent",
    },
    data: generateData()
  };

//   const spanStyle = {
//     // position: 'absolute',
//     // top: '10px',
//     // fontSize: '20px',
//     // fontWeight: 'bold',
//     // backgroundColor: 'transparent',
//     // padding: '0px 0px',
//     // color: '#ffffff'
//   };

  return (
    <div className='w-full'>
      <CanvasJSChart options={options} onRef={ref => (chartRef.current = ref)} />
      {/* <span id="timeToRender" ref={timeRef} style={spanStyle}></span> */}
    </div>
  );
};

export default LineChart;
