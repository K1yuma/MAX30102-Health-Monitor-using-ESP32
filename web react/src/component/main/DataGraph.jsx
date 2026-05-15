import React, { useState, useEffect } from 'react';
// NOTE: recharts needs to be installed: npm install recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DataGraph = ({ data, isDebug, onManualChange, isStreaming, heartRateRange, setHeartRateRange, spO2Range, setSpO2Range, dataLimit = 50, timeRange }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const formattedData = data.map(item => ({
        name: item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString() : 'N/A',
        heartRate: item.heartRate,
        spO2: item.spO2,
      }));
      setChartData(timeRange ? formattedData : formattedData.slice(-dataLimit)); // Display all data if timeRange is active, otherwise keep only the last 'dataLimit' data points
    } else if (!Array.isArray(data) && data.heartRate !== undefined && data.spO2 !== undefined) {
      // This block handles single data points, potentially for real-time display if needed elsewhere
      setChartData((currentData) => {
        const newData = [...currentData, {
          name: new Date().toLocaleTimeString(),
          heartRate: data.heartRate,
          spO2: data.spO2,
        }];
        return timeRange ? newData : newData.slice(-dataLimit); // Display all data if timeRange is active, otherwise keep only the last 'dataLimit' data points
      });
    } else {
      setChartData([]);
    }
  }, [data, dataLimit, timeRange]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3>Data Graph</h3>
      <ResponsiveContainer minWidth={0}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" domain={[60, 120]} label={{ value: 'Heart Rate', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" domain={[80, 100]} label={{ value: 'SpO2', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="spO2" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default DataGraph;
