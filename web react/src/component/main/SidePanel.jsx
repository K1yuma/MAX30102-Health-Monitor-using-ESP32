import React from 'react';
import styles from './SidePanel.module.css';

const SidePanel = ({
  isOpen,
  isDebug,
  onDebugChange,
  showGraph,
  onGraphToggle,
  onClose,
  onShowHistory,
  onCloseHistory,
  onDownloadHistory,
  onShowSummaryStatistics,
  showHistory,
  showSummaryStatistics,
  onCloseSummaryStatistics,
  currentData, // Add currentData to props
  handlePresetChange, // Add handlePresetChange to props
}) => {
  return (
    <div className={`${styles.sidePanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.content}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h2>Menu</h2>
        <div className={styles.toggleContainer} onClick={onDebugChange}>
          <label htmlFor="debugToggle">Debug Mode</label>
          <div className={`${styles.toggleBar} ${isDebug ? styles.active : ''}`}></div>
        </div>
        {isDebug && (
          <div className={styles.debugControls}>
            <button className={styles.menuItemButton} onClick={() => handlePresetChange('normal')}>
              Normal Range Preset
            </button>
            <button className={styles.menuItemButton} onClick={() => handlePresetChange('danger')}>
              Danger Range Preset
            </button>
          </div>
        )}
        <div className={styles.toggleContainer} onClick={onGraphToggle}>
          <label htmlFor="graphToggle">Show Graph</label>
          <div className={`${styles.toggleBar} ${showGraph ? styles.active : ''}`}></div>
        </div>
        <button className={styles.menuItemButton} onClick={showHistory ? onCloseHistory : onShowHistory}>
          Data History
        </button>
        <button className={styles.menuItemButton} onClick={onDownloadHistory}>
          Download History
        </button>
        <button className={styles.menuItemButton} onClick={showSummaryStatistics ? onCloseSummaryStatistics : onShowSummaryStatistics}>
          Summary Statistics
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
