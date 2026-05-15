import React from 'react';
import styles from './dashboard.module.css'; // Reusing existing styles

const isDanger = (type, value) => {
  if (type === 'heartRate') {
    return value < 60 || value > 110;
  } else if (type === 'spO2') {
    return value < 95;
  }
  return false;
};

const DataList = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <div className={styles.dataListContainer}>
      <h3>Sensor Readings</h3>
      <ul className={styles.dataList}>
        {data.map(item => (
          <li key={item.id} className={styles.dataListItem}>
            <p><strong>Timestamp:</strong> {new Date(item.timestamp.seconds * 1000).toLocaleString()}</p>
            <p><strong>Heart Rate:</strong> <span className={isDanger('heartRate', item.heartRate) ? styles.dangerText : ''}>{item.heartRate}</span></p>
            <p><strong>SPO2:</strong> <span className={isDanger('spO2', item.spO2) ? styles.dangerText : ''}>{item.spO2}</span></p>
            {/* Add other fields as necessary */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataList;
