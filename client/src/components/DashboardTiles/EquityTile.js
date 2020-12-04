import React from "react";
import { Card } from "antd";

const { Meta } = Card;

const EquityTile = ({
  isScheduleLaunched,
  ticker,
  loading,
  currentBalance,
  lockedBalance,
  handleLaunchVestingSchedule,
}) => {
  return (
    <Card
      actions={
        !isScheduleLaunched
          ? [
              <div onClick={() => handleLaunchVestingSchedule()}>
                {loading ? "Launching..." : "Launch schedule"}
              </div>,
              <div>Release equity</div>,
            ]
          : [<div>Release equity</div>]
      }
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
