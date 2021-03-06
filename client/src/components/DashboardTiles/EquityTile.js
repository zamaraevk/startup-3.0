import React, { useState } from "react";
import { PieChart, Pie, Sector, Cell } from "recharts";
import { Card, Button, Result } from "antd";

const { Meta } = Card;

const ActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    ticker,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#999">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill="#177ddc"
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke="#177ddc"
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill="#177ddc" stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="rgba(255, 255, 255)"
      >{`${value} ${ticker}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const EquityTile = ({
  isScheduleLaunched,
  ticker,
  loading,
  currentBalance,
  lockedBalance,
  lockTimeStart,
  handleReleaseEquity,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const COLORS = ["#00C49F", "#FFBB28"];
  const data = [
    {
      name: "Current balance",
      value: Number(currentBalance),
    },
    {
      name: "Locked balance",
      value: Number(lockedBalance),
    },
  ];
  const launchDate = new Date(lockTimeStart * 1000).toLocaleString();
  return (
    <Card
      title="Equity balance"
      extra={
        <Button
          loading={loading === "schedule"}
          type="primary"
          disabled={!isScheduleLaunched}
          onClick={handleReleaseEquity}
        >
          Release equity
        </Button>
      }
      bordered={false}
    >
      {isScheduleLaunched ? (
        <div>
          {lockTimeStart && (
            <Meta
              title="Vesting schedule"
              description={
                <div>
                  <div>{`Started: ${launchDate}`}</div>
                  <div>Duration: 4 years</div>
                </div>
              }
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <PieChart width={740} height={375}>
              <Pie
                activeIndex={activeIndex}
                activeShape={<ActiveShape ticker={ticker} />}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="yellow"
                stroke="rgb(20, 20, 20)"
                onMouseEnter={(data, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>
      ) : (
        <Result title="To view equity chart, founders have to launch vesting schedule." />
      )}
    </Card>
  );
};

export default EquityTile;
