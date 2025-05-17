import React from "react";
import { Card, Col, Row } from "antd";
import CountUp from "react-countup";
interface StatisticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const CardDuLieu: React.FC<StatisticCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <Row align="middle">
        <Col span={16}>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#CF1627" }}>
            <CountUp end={value} duration={2.75} />
          </div>
        </Col>
        <Col span={8}>
          <div style={{ fontSize: 36, color: "#CF1627", textAlign: "right" }}>{icon}</div>
        </Col>
      </Row>
    </Card>
  );
};

export default CardDuLieu;
