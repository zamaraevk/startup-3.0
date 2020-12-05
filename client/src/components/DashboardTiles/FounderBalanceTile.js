import React, { useState } from "react";
import { Card } from "antd";
import {
  DollarCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

const FounderBalanceTile = ({ balance, ticker, showModal }) => {
  const [show, setShow] = useState(true);
  const bal = show ? `${balance}` : "***";
  const EyeIcon = show ? EyeOutlined : EyeInvisibleOutlined;
  return (
    <Card
      actions={[
        <DollarCircleOutlined key="transfer" onClick={showModal} />,
        <EyeIcon key="eye" onClick={() => setShow(!show)} />,
      ]}
      bordered={false}
    >
      <Meta title={`${bal} ${ticker}`} description="Founder balance" />
    </Card>
  );
};

export default FounderBalanceTile;
