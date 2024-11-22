import React from 'react';
import { Progress, Spin, Row, Col } from 'antd';

const DeploymentProgressBar = ({ progress, filesProcessed, loading, statusMessage }) => {
  return (
    <div>
      <Row>
        <Col span={24}>
          <Progress percent={progress} status="active" />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Spin spinning={loading} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div>{statusMessage}</div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div>{filesProcessed.length} / 8 files processed</div>
        </Col>
      </Row>
    </div>
  );
};

export default DeploymentProgressBar;

