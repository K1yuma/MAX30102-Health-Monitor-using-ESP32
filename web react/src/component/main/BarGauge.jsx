import React from 'react';
import './BarGauge.css';

const BarGauge = ({ value, maxValue, label }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="bar-gauge-container">
      <div className="bar-gauge">
        <div
          className="bar-gauge-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="bar-gauge-label">{label}</div>
      <div className="bar-gauge-value">{value}</div>
    </div>
  );
};

export default BarGauge;