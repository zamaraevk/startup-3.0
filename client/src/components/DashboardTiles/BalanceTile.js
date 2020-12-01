import React from "react";
import { Card } from "antd";
import { DollarCircleOutlined, EyeOutlined } from "@ant-design/icons";

const { Meta } = Card;

const BalanceTile = ({ balance }) => {
  return (
    <Card
      actions={[
        <DollarCircleOutlined key="transfer" />,
        <EyeOutlined key="eye" />,
      ]}
      bordered={false}
      style={{ width: 300 }}
    >
      <Meta title={`${balance} ETH`} description="Wallet balance" />
    </Card>
  );
};

export default BalanceTile;
