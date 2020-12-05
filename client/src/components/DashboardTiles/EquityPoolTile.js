import React, { useState } from "react";
import { Card } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const { Meta } = Card;

const EquityPoolTile = ({
  isScheduleLaunched,
  ticker,
  loading,
  equityPool,
  totalSupply,
  handleLaunchVestingSchedule,
}) => {
  const [show, setShow] = useState(true);

  const balance = show ? `${equityPool}/${totalSupply}` : "****/****";
  const EyeIcon = show ? EyeOutlined : EyeInvisibleOutlined;
  let actions = [<EyeIcon key="eye" onClick={() => setShow(!show)} />];

  if (!isScheduleLaunched) {
    actions = [
      <div onClick={() => handleLaunchVestingSchedule()}>
        {loading ? "Submitting..." : "Launch schedule"}
      </div>,
      ...actions,
    ];
  }

  return (
    <Card actions={actions} bordered={false}>
      <Meta
        title={`${balance} ${ticker}`}
        description="Equity pool/Total supply"
      />
    </Card>
  );
};

export default EquityPoolTile;
