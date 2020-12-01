import React from "react";
import { Card } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

const { Meta } = Card;

const FoundersTile = ({ foundersCount }) => {
  return (
    <Card
      actions={[
        <div>
          <PlusCircleOutlined key="add" /> Add new founder
        </div>,
      ]}
      bordered={false}
      style={{ width: 300 }}
    >
      <Meta title={foundersCount} description="Founders" />
    </Card>
  );
};

export default FoundersTile;
