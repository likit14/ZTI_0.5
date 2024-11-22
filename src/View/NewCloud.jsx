import React, { useState } from 'react';
import { Tabs } from 'antd';
import Zti from '../Components/Z-mod/Zti';
import DeploymentOptions from '../Components/Z-mod/Deployop';
import Discovery from '../Components/Z-mod/NwtScan';
import Validation from '../Components/Z-mod/Validate';
import Report from '../Components/Z-mod/Report';

const App = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [disabledTabs, setDisabledTabs] = useState({ "2": true, "3": true, "4" : true });
  const [selectedNodes, setSelectedNodes] = useState([]); // State for selected nodes

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
          <Validation nodes={selectedNodes} onStart={() => handleTabStart(3)}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Report" key="4" disabled={disabledTabs["4"]}>
          <Report nodes={selectedNodes} />
        </Tabs.TabPane>
      </Tabs>
    </Zti>
  );
};

export default App;

