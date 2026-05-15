import React from 'react';
import client from '../../mqtt'; // Import the MQTT client
import styles from './dashboard.module.css';
import BarGauge from './BarGauge';
import DataGraph from './DataGraph'; // Import the DataGraph component
import DataHistory from './DataHistory'; // Import the DataHistory component
import Menu from './Menu'; // Import the Menu component
import SidePanel from './SidePanel'; // Import the SidePanel component
import SummaryStatistics from './SummaryStatistics'; // Import the SummaryStatistics component
import { saveSensorData, getSensorData } from '../../firebase'; // Import saveSensorData and getSensorData
import FallingHearts from './FallingHearts'; // Import the FallingHearts component
import alarmSound from '../../assets/sounds/alarm.mp3'; // Import the alarm sound

const NORMAL_PRESET = { heartRate: { min: 70, max: 99 }, spO2: { min: 97, max: 99 } };
const DANGER_PRESET = { heartRate: { min: 40, max: 130 }, spO2: { min: 85, max: 94 } };

const Main = () => {
  const [currentData, setCurrentData] = React.useState({
    heartRate: 0,
    spO2: 0,
    sensorEnabled: false,
  });
  const [isDebug, setIsDebug] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [heartRateRange, setHeartRateRange] = React.useState({ min: 60, max: 100 });
  const [spO2Range, setSpO2Range] = React.useState({ min: 95, max: 100 });
  const [showGraph, setShowGraph] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showSummaryStatistics, setShowSummaryStatistics] = React.useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = React.useState(false);
  const [isDangerActive, setIsDangerActive] = React.useState(false); // New state for screen-wide danger effect
  const [currentPresetType, setCurrentPresetType] = React.useState('normal');
  const [hasReceivedFirstData, setHasReceivedFirstData] = React.useState(false);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };


  const handleGraphToggle = () => {
    setShowGraph(prev => !prev);
    setShowHistory(false); // Close other views
    setShowSummaryStatistics(false); // Close other views
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    setShowGraph(false); // Close other views
    setShowSummaryStatistics(false); // Close other views
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleShowSummaryStatistics = () => {
    setShowSummaryStatistics(true);
    setShowGraph(false); // Close other views
    setShowHistory(false); // Close other views
  };

  const handleCloseSummaryStatistics = () => {
    setShowSummaryStatistics(false);
  };

  const handleDownloadHistory = async () => {
    try {
      const history = await getSensorData();
      if (history.length === 0) {
        alert("No history data to download.");
        return;
      }

      const csvRows = [];
      // CSV Header
      csvRows.push('Timestamp,Heart Rate,SpO2');

      // CSV Data
      history.forEach(data => {
        const date = new Date(data.timestamp.seconds * 1000);
        const formattedDate = date.toLocaleString();
        csvRows.push(`${formattedDate},${data.heartRate},${data.spO2}`);
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'sensor_history.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("History data downloaded successfully!");
    } catch (error) {
      console.error("Error downloading history data:", error);
      alert("Failed to download history data.");
    }
  };

  const handlePresetChange = (presetType) => {
    let preset;
    if (presetType === 'normal') {
      preset = NORMAL_PRESET;
    } else if (presetType === 'danger') {
      preset = DANGER_PRESET;
    }
    setHeartRateRange(preset.heartRate);
    setSpO2Range(preset.spO2);
    setIsStreaming(true); // Automatically start streaming when a preset is selected
    setCurrentPresetType(presetType); // Set the current preset type
  };

  React.useEffect(() => {
    let interval;
    if (isDebug && isStreaming) {
      interval = setInterval(() => {
        setCurrentData(prev => {
          let newHeartRate, newSpO2;
          
          // Use existing logic for normal and danger presets
          if (currentPresetType === 'danger') {
            // Randomly choose between low danger (40-59) or high danger (111-130)
            if (Math.random() < 0.5) { // 50% chance for low danger
              newHeartRate = parseFloat((Math.random() * (59 - 40) + 40).toFixed(1));
            } else { // 50% chance for high danger
              newHeartRate = parseFloat((Math.random() * (130 - 111) + 111).toFixed(1));
            }
          } else {
            newHeartRate = parseFloat((Math.random() * (heartRateRange.max - heartRateRange.min) + heartRateRange.min).toFixed(1));
          }
          newSpO2 = parseFloat((Math.random() * (spO2Range.max - spO2Range.min) + spO2Range.min).toFixed(1));

          const newData = { ...prev, heartRate: newHeartRate, spO2: newSpO2 };
          if (prev.sensorEnabled && newHeartRate !== 0 && newSpO2 !== 0) {
            saveSensorData({ heartRate: newHeartRate, spO2: newSpO2 }); // Save data to Firebase
          }
          // Set hasReceivedFirstData to true once the first debug data is generated
          if (!hasReceivedFirstData && (newHeartRate !== 0 || newSpO2 !== 0)) {
            setHasReceivedFirstData(true);
          }
          return newData;
        });
      }, 1000); // Update every 1 second
    }

    return () => {
      clearInterval(interval);
    };
  }, [isDebug, isStreaming, heartRateRange, spO2Range, currentPresetType, hasReceivedFirstData, setHasReceivedFirstData]);

  React.useEffect(() => {
    const hrDangerous = currentData.heartRate < 60 || currentData.heartRate > 110;
    const spO2Dangerous = currentData.spO2 < 95;
    const newIsDangerActive = (hrDangerous || spO2Dangerous) && currentData.sensorEnabled && hasReceivedFirstData;
    setIsDangerActive(newIsDangerActive);
  }, [currentData, currentData.sensorEnabled, hasReceivedFirstData]);

  const audioRef = React.useRef(new Audio(alarmSound));
  
  React.useEffect(() => {
    // Audio warning logic
    const audio = audioRef.current;
    audio.loop = true;

    if (isDangerActive) {
      // Only play if not already playing
      if (audio.paused) {
        audio.play().catch(e => console.error("Error playing sound:", e));
      }
    } else {
      // Only pause if not already paused
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0; // Reset audio to the beginning
      }
    }

    return () => {
      // On component unmount or before re-running effect, ensure audio is paused
      if (!audio.paused) { // Check if it's actually playing
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isDangerActive]);
  React.useEffect(() => {
    if (!isDebug) {
      const handleMessage = (topic, message) => {
        const value = message.toString();
        let updatedHeartRate = currentData.heartRate;
        let updatedSpO2 = currentData.spO2;

        let newHeartRate = updatedHeartRate;
        let newSpO2 = updatedSpO2;

        if (topic === 'healthMonitor/heartRate') {
          newHeartRate = parseFloat(value);
          setCurrentData(prev => ({ ...prev, heartRate: newHeartRate }));
          if (!hasReceivedFirstData && newHeartRate !== 0) {
            setHasReceivedFirstData(true);
          }
        } else if (topic === 'healthMonitor/spO2') {
          newSpO2 = parseFloat(value);
          setCurrentData(prev => ({ ...prev, spO2: newSpO2 }));
          if (!hasReceivedFirstData && newSpO2 !== 0) {
            setHasReceivedFirstData(true);
          }
        }
        // Only save if it's a heartRate or spO2 update and sensor is enabled and value is not 0
        const shouldSave = (topic === 'healthMonitor/heartRate' && newHeartRate !== 0) || (topic === 'healthMonitor/spO2' && newSpO2 !== 0);
 
        if (shouldSave) {
          if (currentData.sensorEnabled) {
            // When saving, we want to save the original values, not the calibrated ones if calibration is on.
            saveSensorData({ heartRate: newHeartRate, spO2: newSpO2 });
          }
        }

        if (topic === 'healthMonitor/status') {
          if (value === 'manual_enabled') {
            setCurrentData(prev => ({ ...prev, sensorEnabled: true }));
          } else if (value === 'manual_disabled' || value === 'auto_disabled_no_finger') {
            setCurrentData(prev => ({ ...prev, sensorEnabled: false, heartRate: 0, spO2: 0 }));
            setHasReceivedFirstData(false);
          }
        }
      };

      client.on('message', handleMessage);

      return () => {
        client.removeListener('message', handleMessage);
      };
    }
  }, [isDebug, currentData, hasReceivedFirstData]);

  const toggleSensor = () => {
    const newStatus = !currentData.sensorEnabled;
    const command = newStatus ? 'on' : 'off';
    client.publish('healthMonitor/sensorControl', command);
    setCurrentData(prev => ({ ...prev, sensorEnabled: newStatus }));
    if (!newStatus) {
        // When turning off, reset data
        setCurrentData({ heartRate: 0, spO2: 0, sensorEnabled: false });
        setHasReceivedFirstData(false); // Reset hasReceivedFirstData
    }
  };

  const handleDebugChange = () => {
    const newDebugState = !isDebug;
    setIsDebug(newDebugState);
    setIsStreaming(false); // Stop streaming when debug mode is toggled
    if (newDebugState) {
      // If debug mode is being turned on, initialize with normal preset
      handlePresetChange('normal');
    } else {
      // If debug mode is being turned off, reset sensor values and preset type
      setCurrentData(prev => ({ ...prev, heartRate: 0, spO2: 0 }));
      setCurrentPresetType('normal');
      setHasReceivedFirstData(false); // Reset hasReceivedFirstData
    }
  };

  // Calculate if heart rate or SpO2 are dangerous
  const isHeartRateDangerous = (currentData.heartRate < 60 || currentData.heartRate > 110) && hasReceivedFirstData;
  const isSpO2Dangerous = (currentData.spO2 < 95) && hasReceivedFirstData;

  return (
    <div className={styles.dashboard}>
      {isDangerActive && <FallingHearts />}
      <h1 className={styles.pageTitle}>Health Monitoring Dashboard</h1>

      <div className={styles.menuSection}>
        <Menu
          toggleSidePanel={toggleSidePanel}
          isSidePanelOpen={isSidePanelOpen}
          handleGraphToggle={handleGraphToggle}
          handleShowHistory={handleShowHistory}
          handleDownloadHistory={handleDownloadHistory}
          handleDebugChange={handleDebugChange}
          isDebug={isDebug}
          showGraph={showGraph}
          showHistory={showHistory}
          showSummaryStatistics={showSummaryStatistics}
          onCloseSummaryStatistics={handleCloseSummaryStatistics}
        />
      </div>

      <div className={styles.contentWrapper}>
        <div className={`${styles.summarySection} ${showGraph ? styles.fullWidthSection : ''}`}>
          {showHistory && <DataHistory onClose={handleCloseHistory} />}
          <SummaryStatistics isOpen={showSummaryStatistics} onClose={handleCloseSummaryStatistics} />
          {showGraph ? (
            <div className={styles.dataGraphContainer}>
              <DataGraph
                data={currentData}
                isDebug={isDebug}
                isStreaming={isStreaming}
                heartRateRange={heartRateRange}
                setHeartRateRange={setHeartRateRange}
                setSpO2Range={setSpO2Range}
                onClose={handleGraphToggle}
              />
            </div>
          ) : (
            <div className={`${styles.statsContainer} ${isDangerActive ? styles.lowHealthVignette : ''}`}>
              <div className={`${styles.statCard} ${(isHeartRateDangerous && currentData.sensorEnabled) ? styles.flickerRed : ''}`}>
                <h3>Heart Rate</h3>
                <BarGauge
                  value={currentData.heartRate}
                  maxValue={200}
                  label="Heart Rate"
                />
                <h2 className={styles.statValue}>{currentData.heartRate.toFixed(1)} BPM</h2>

              </div>
              <div className={`${styles.statCard} ${(isSpO2Dangerous && currentData.sensorEnabled) ? styles.flickerRed : ''}`}>
                <h3>SpO2</h3>
                <BarGauge
                  value={currentData.spO2}
                  maxValue={100}
                  label="SpO2"
                />
                <h2 className={styles.statValue}>{currentData.spO2.toFixed(1)}%</h2>
                  </div>
            </div>
          )}
        </div>
        {!showGraph && (
          <div className={styles.menuSection}>
            <Menu
              toggleSidePanel={toggleSidePanel}
              isSidePanelOpen={isSidePanelOpen}
              handleGraphToggle={handleGraphToggle}
              handleShowHistory={handleShowHistory}
              handleDownloadHistory={handleDownloadHistory}
              handleDebugChange={handleDebugChange}
              isDebug={isDebug}
              showGraph={showGraph}
              showHistory={showHistory}
              showSummaryStatistics={showSummaryStatistics}
              onCloseSummaryStatistics={handleCloseSummaryStatistics}
            />
          </div>
        )}
      </div>
      <button
        className={`${styles.sensorButton} ${currentData.sensorEnabled ? styles.off : styles.on}`}
        onClick={toggleSensor}
      >
        {currentData.sensorEnabled ? 'Turn Sensor Off' : 'Turn Sensor On'}
      </button>

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={toggleSidePanel}
        isDebug={isDebug}
        onDebugChange={handleDebugChange}
        showGraph={showGraph}
        onGraphToggle={handleGraphToggle}
        onShowHistory={handleShowHistory}
        onCloseHistory={handleCloseHistory}
        onDownloadHistory={handleDownloadHistory}
        onShowSummaryStatistics={handleShowSummaryStatistics}
        onCloseSummaryStatistics={handleCloseSummaryStatistics}
        showHistory={showHistory}
        showSummaryStatistics={showSummaryStatistics}
        currentData={currentData} // Pass currentData to SidePanel
        handlePresetChange={handlePresetChange} // Pass handlePresetChange to SidePanel
      />
    </div>
  );
};

export default Main;