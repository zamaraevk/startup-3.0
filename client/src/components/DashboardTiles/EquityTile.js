import React from "react";
import { Card } from "antd";

const { Meta } = Card;

const EquityTile = ({ ticker, currentBalance, lockedBalance }) => {
  return (
    <Card
      actions={[<div>Launch schedule</div>, <div>Release equity</div>]}
      bordered={false}
    >
      <Meta
        title={`${currentBalance}/${lockedBalance} ${ticker}`}
        description="Equity balance"
      />
    </Card>
  );
};

export default EquityTile;
