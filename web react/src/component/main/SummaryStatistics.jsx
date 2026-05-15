import React, { useState, useEffect } from 'react';
import styles from './LeftPanel.module.css';
import { getSensorData } from '../../firebase'; // Import getSensorData

const SummaryStatistics = ({ isOpen, onClose }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStatistics(null); // Clear statistics when panel closes
      setLoading(false);
      setError(null);
      return;
    }

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const history = await getSensorData();

        if (history.length === 0) {
          setStatistics({ message: "No data available to generate statistics." });
          setLoading(false);
          return;
        }

        let totalHeartRate = 0;
        let minHeartRate = Infinity;
        let maxHeartRate = -Infinity;
        let heartRateDangerCount = 0;

        let totalSpO2 = 0;
        let minSpO2 = Infinity;
        let maxSpO2 = -Infinity;
        let spO2DangerCount = 0;

        history.forEach(data => {
          // Heart Rate
          if (data.heartRate) {
            totalHeartRate += data.heartRate;
            minHeartRate = Math.min(minHeartRate, data.heartRate);
            maxHeartRate = Math.max(maxHeartRate, data.heartRate);
            if (data.heartRate < 60 || data.heartRate > 110) {
              heartRateDangerCount++;
            }
          }

          // SpO2
          if (data.spO2) {
            totalSpO2 += data.spO2;
            minSpO2 = Math.min(minSpO2, data.spO2);
            maxSpO2 = Math.max(maxSpO2, data.spO2);
            if (data.spO2 < 95) {
              spO2DangerCount++;
            }
          }
        });

        setStatistics({
          averageHeartRate: (totalHeartRate / history.length).toFixed(2),
          minHeartRate: minHeartRate === Infinity ? 'N/A' : minHeartRate.toFixed(2),
          maxHeartRate: maxHeartRate === -Infinity ? 'N/A' : maxHeartRate.toFixed(2),
          heartRateDangerCount,
          averageSpO2: (totalSpO2 / history.length).toFixed(2),
          minSpO2: minSpO2 === Infinity ? 'N/A' : minSpO2.toFixed(2),
          maxSpO2: maxSpO2 === -Infinity ? 'N/A' : maxSpO2.toFixed(2),
          spO2DangerCount,
          totalEntries: history.length,
        });
      } catch (err) {
        console.error("Error fetching summary statistics:", err);
        setError("Failed to load summary statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [isOpen]);

  return (
    <div className={`${styles.leftPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.content}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h2>Summary Statistics</h2>
        {loading && <p>Loading statistics...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {statistics && statistics.message && <p>{statistics.message}</p>}
        {statistics && !statistics.message && (
          <div className={styles.statisticsContent}>
            <h3>Overall Data</h3>
            <p>Total Entries: {statistics.totalEntries}</p>

            <h3>Heart Rate</h3>
            <p>Average: {statistics.averageHeartRate} BPM</p>
            <p>Min: {statistics.minHeartRate} BPM</p>
            <p>Max: {statistics.maxHeartRate} BPM</p>
            <p>Danger Events (HR &lt; 60 or HR &gt; 110): {statistics.heartRateDangerCount}</p>

            <h3>SpO2</h3>
            <p>Average: {statistics.averageSpO2}%</p>
            <p>Min: {statistics.minSpO2}%</p>
            <p>Max: {statistics.maxSpO2}%</p>
            <p>Danger Events (SpO2 &lt; 95): {statistics.spO2DangerCount}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryStatistics;
