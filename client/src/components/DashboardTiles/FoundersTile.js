import React from "react";
import { Card } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

const { Meta } = Card;

const FoundersTile = ({ foundersCount, showModal }) => {
  return (
    <Card
      actions={[
        <div onClick={showModal}>
          <PlusCircleOutlined key="add" /> Add new founder
        </div>,
      ]}
      bordered={false}
    >
      <Meta title={foundersCount} description="Founders" />
    </Card>
  );
};

export default FoundersTile;
