import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import DataList from './DataList';
import DataGraph from './DataGraph'; // Assuming DataGraph exists or will be created
import styles from './dashboard.module.css'; // Reusing existing styles for now

const buildQuery = (timeRange, dataLimit, startDate, endDate) => {
  const now = new Date();
  let startTime;
  let baseQuery = collection(db, 'sensorReadings');

  if (startDate && endDate) {
    // Custom date range
    return query(
      baseQuery,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
  } else if (timeRange) {
    switch (timeRange) {
      case '1_hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '5_hours':
        startTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        break;
      case 'this_month':
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_year':
        startTime = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startTime = null;
    }
    if (startTime) {
      return query(baseQuery, where('timestamp', '>=', Timestamp.fromDate(startTime)), orderBy('timestamp', 'desc'));
    } else {
      return query(baseQuery, orderBy('timestamp', 'desc'));
    }
  } else if (dataLimit) {
    return query(baseQuery, orderBy('timestamp', 'desc'), limit(dataLimit));
  } else {
    return query(baseQuery, orderBy('timestamp', 'desc'));
  }
};

const DataHistory = ({ onClose }) => {
  const [data, setData] = useState([]);
  const [view, setView] = useState('all'); // 'all' or 'danger'
  const [displayType, setDisplayType] = useState('list'); // 'list' or 'graph'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('last_50');
  const [dataLimit, setDataLimit] = useState(50);
  const [timeRange, setTimeRange] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleRangeChange = (event) => {
    const value = event.target.value;
    setSelectedRange(value);
    if (value.startsWith('last_')) {
      setDataLimit(parseInt(value.split('_')[1]));
      setTimeRange(null);
      setCustomStartDate('');
      setCustomEndDate('');
    } else if (value === 'custom') {
      setDataLimit(null);
      setTimeRange(null);
    } else {
      setDataLimit(null);
      setTimeRange(value);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleCustomStartDateChange = (event) => {
    setCustomStartDate(event.target.value);
  };

  const handleCustomEndDateChange = (event) => {
    setCustomEndDate(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let queryStartDate = null;
        let queryEndDate = null;

        if (selectedRange === 'custom' && customStartDate && customEndDate) {
          queryStartDate = new Date(customStartDate);
          queryEndDate = new Date(customEndDate);
          // Set end date to end of the day for inclusive range
          queryEndDate.setHours(23, 59, 59, 999);
        }

        const q = buildQuery(timeRange, dataLimit, queryStartDate, queryEndDate);
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, dataLimit, customStartDate, customEndDate, selectedRange]);

  const filteredData = view === 'danger'
    ? data.filter(item => item.heartRate < 60 || item.heartRate > 110 || item.spO2 < 95)
    : data;

  return (
    <div className={styles.dashboardOverlay}>
      <div className={styles.dashboardContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2>Data History</h2>

        <div className={styles.filterContainer}>
          <label htmlFor="dataRange">Select Data Range:</label>
          <select id="dataRange" value={selectedRange} onChange={handleRangeChange}>
            <option value="last_20">Last 20 Data Points</option>
            <option value="last_30">Last 30 Data Points</option>
            <option value="last_40">Last 40 Data Points</option>
            <option value="last_50">Last 50 Data Points</option>
            <option value="1_hour">Last 1 Hour</option>
            <option value="5_hours">Last 5 Hours</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
          {selectedRange === 'custom' && (
            <div className={styles.customDateRange}>
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={customStartDate}
                onChange={handleCustomStartDateChange}
              />
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={customEndDate}
                onChange={handleCustomEndDateChange}
              />
            </div>
          )}
        </div>

        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${view === 'all' ? styles.active : ''}`}
            onClick={() => setView('all')}
          >
            All History
          </button>
          <button
            className={`${styles.toggleButton} ${view === 'danger' ? styles.active : ''}`}
            onClick={() => setView('danger')}
          >
            Danger Range
          </button>
        </div>

        {loading && <p>Loading data...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div>
            <div className={styles.toggleContainer}>
              <button
                className={`${styles.toggleButton} ${displayType === 'list' ? styles.active : ''}`}
                onClick={() => setDisplayType('list')}
              >
                List View
              </button>
              <button
                className={`${styles.toggleButton} ${displayType === 'graph' ? styles.active : ''}`}
                onClick={() => setDisplayType('graph')}
              >
                Graph View
              </button>
            </div>
            {displayType === 'list'
              ? <DataList data={filteredData} />
              : <DataGraph data={filteredData} dataLimit={dataLimit} timeRange={timeRange} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataHistory;
