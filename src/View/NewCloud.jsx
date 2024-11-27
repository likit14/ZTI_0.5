import React, { useState } from 'react';
import { Tabs } from 'antd';
import Zti from '../Components/Z-mod/Zti';
import DeploymentOptions from '../Components/Z-mod/Deployop';
import Discovery from '../Components/Z-mod/NwtScan';
import Validation from '../Components/Z-mod/Validate';
import Report from '../Components/Z-mod/Report';

const App = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [disabledTabs, setDisabledTabs] = useState({ "2": true, "3": true, "4": true });
  const [selectedNodes, setSelectedNodes] = useState([]); // State for selected nodes
  const [ibn, setIbn] = useState(''); // State for ibn value

  const handleTabStart = (currentTab) => {
    const nextTab = (currentTab + 1).toString();
    setDisabledTabs((prevState) => ({
      ...prevState,
      [nextTab]: false,
    }));
    setActiveTab(nextTab);
  };

  const handleNodeSelection = (nodes) => {
    setSelectedNodes(nodes);
    setDisabledTabs((prevState) => ({
      ...prevState,
      "3": false, // Enable Validation tab
    }));
    setActiveTab("3"); // Move to Validation tab
  };

  // Function to update ibn and enable the Report tab
  const handleIbnUpdate = (newIbn) => {
    setIbn(newIbn); // Update ibn value
    setDisabledTabs((prevState) => ({
      ...prevState,
      "4": false, // Enable Report tab
    }));
    // setActiveTab("4"); // Move to Report tab
  };
  const handleNextButtonClick = () => {
    setActiveTab("4"); // Navigate to the Report tab
  };

  return (
    <Zti>
      <h2>New Cloud</h2>
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <Tabs.TabPane tab="Deployment Options" key="1" disabled={disabledTabs["1"]}>
          <DeploymentOptions onStart={() => handleTabStart(1)} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Discovery" key="2" disabled={disabledTabs["2"]}>
          <Discovery onNodeSelect={handleNodeSelection} onStart={() => handleTabStart(2)} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Validation" key="3" disabled={disabledTabs["3"]}>
          <Validation
            next={handleNextButtonClick}
            nodes={selectedNodes}
            onStart={() => handleTabStart(3)}
            onIbnUpdate={handleIbnUpdate} // Pass the ibn update handler here
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Report" key="4" disabled={disabledTabs["4"]}>
          {activeTab === "4" && <Report ibn={ibn} />}
        </Tabs.TabPane>
      </Tabs>
    </Zti>
  );
};

export default App;
