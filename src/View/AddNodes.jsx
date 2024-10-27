import React, { useState } from 'react';
import { Tabs } from 'antd';
import Zti from "../Components/Z-mod/Zti"
import DeploymentOptions from '../Components/Z-mod/Scaleup';
// import TabThree from '../Components/Z-mod/Scaleup';

const App = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [disabledTabs, setDisabledTabs] = useState({ "2": true, "3": true });

  const handleTabStart = (currentTab) => {
    const nextTab = (currentTab + 1).toString();
    setDisabledTabs((prevState) => ({
      ...prevState,
      [nextTab]: false,
    }));
    setActiveTab(nextTab);
  };

  return (
    <Zti>
        <h2>Add Nodes</h2>
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <Tabs.TabPane tab="Discovery" key="1" disabled={disabledTabs["1"]}>
          <DeploymentOptions onStart={() => handleTabStart(1)} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="Tab 2" key="3" disabled={disabledTabs["3"]}> */}
          {/* <TabThree onStart={() => handleTabStart(3)} /> */}
        {/* </Tabs.TabPane> */}
      </Tabs>
    </Zti>
  );
};

export default App;
