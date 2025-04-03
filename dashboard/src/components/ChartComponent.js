import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({ symbol = 'RELIANCE', interval = '1D' }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(interval);
  const [indicators, setIndicators] = useState([]);
  const [dates, setDates] = useState([]);
  
  // Generate sample data
  useEffect(() => {
    const generateCandlestickData = () => {
      const data = [];
      const datesArray = [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      // Generate 100 days of data
      for (let i = 99; i >= 0; i--) {
        const time = new Date(now);
        time.setDate(time.getDate() - i);
        datesArray.push(time.toLocaleDateString());
        
        const basePrice = symbol === 'RELIANCE' ? 2100 : 
                          symbol === 'INFY' ? 1500 : 
                          symbol === 'TCS' ? 3200 : 1000;
        
        const volatility = 0.02; // 2% daily volatility
        const changePercent = (Math.random() - 0.5) * volatility;
        
        const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);
        const close = open * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        
        data.push({
          time: time.getTime(),
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)), 
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
        });
      }
      
      setDates(datesArray);
      return data;
    };
    
    setChartData(generateCandlestickData());
  }, [symbol, selectedTimeframe]);

  const lineData = {
    labels: dates,
    datasets: [
      {
        label: symbol,
        data: chartData.map(item => item.close),
        fill: false,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        tension: 0.1
      }
    ]
  };
  
  // Add indicators if selected
  if (indicators.includes('sma20') && chartData.length > 0) {
    const smaData = [];
    
    for (let i = 0; i < chartData.length; i++) {
      if (i < 19) {
        smaData.push(null);
      } else {
        const sum = chartData.slice(i - 19, i + 1).reduce((acc, val) => acc + val.close, 0);
        smaData.push(sum / 20);
      }
    }
    
    lineData.datasets.push({
      label: 'SMA 20',
      data: smaData,
      fill: false,
      backgroundColor: '#2196F3',
      borderColor: '#2196F3',
      borderDash: [5, 5],
      tension: 0.1
    });
  }
  
  if (indicators.includes('ema50') && chartData.length > 0) {
    const k = 2 / (50 + 1);
    const emaData = [];
    
    for (let i = 0; i < chartData.length; i++) {
      if (i === 0) {
        emaData.push(chartData[i].close);
      } else {
        emaData.push(chartData[i].close * k + emaData[i - 1] * (1 - k));
      }
    }
    
    lineData.datasets.push({
      label: 'EMA 50',
      data: emaData,
      fill: false,
      backgroundColor: '#FF9800',
      borderColor: '#FF9800',
      borderDash: [2, 2],
      tension: 0.1
    });
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#d1d4dc',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: {
          color: '#1e222d'
        }
      },
      y: {
        ticks: {
          color: '#d1d4dc'
        },
        grid: {
          color: '#1e222d'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d4dc'
        }
      },
      tooltip: {
        backgroundColor: '#252a3a',
        titleColor: '#d1d4dc',
        bodyColor: '#d1d4dc',
        borderWidth: 1,
        borderColor: '#2a3042'
      }
    }
  };

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '1D', '1W', '1M'];
  const availableIndicators = [
    { id: 'sma20', name: 'SMA 20' },
    { id: 'ema50', name: 'EMA 50' },
    { id: 'volume', name: 'Volume' },
    { id: 'rsi', name: 'RSI' }
  ];

  const toggleIndicator = (indicatorId) => {
    if (indicators.includes(indicatorId)) {
      setIndicators(indicators.filter(id => id !== indicatorId));
    } else {
      setIndicators([...indicators, indicatorId]);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>{symbol}</h2>
        <div className="timeframe-selector">
          {timeframes.map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="indicator-selector">
          {availableIndicators.map((indicator) => (
            <button
              key={indicator.id}
              className={`indicator-btn ${indicators.includes(indicator.id) ? 'active' : ''}`}
              onClick={() => toggleIndicator(indicator.id)}
            >
              {indicator.name}
            </button>
          ))}
        </div>
      </div>
      <div className="chart" style={{ height: '500px' }}>
        <Line data={lineData} options={options} />
      </div>
    </div>
  );
};

export default ChartComponent; 