import React from 'react';
import styles from './Menu.module.css';

const Menu = ({
  toggleSidePanel,
  isSidePanelOpen,
  handleGraphToggle,
  handleShowHistory,
  handleCloseHistory,
  handleShowSummaryStatistics,
  handleCloseSummaryStatistics,
  handleDownloadHistory,
  handleDebugChange,
  isDebug,
  showGraph,
  showHistory,
  showSummaryStatistics,
}) => {
  return (
    <div className={styles.menuContainer}>
      <button className={styles.menuButton} onClick={toggleSidePanel}>
        ☰
      </button>
    </div>
  );
};

export default Menu;
