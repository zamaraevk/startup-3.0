import React from "react";
import { Card, List, Button, Tag } from "antd";
import { UserAddOutlined, CheckCircleOutlined } from "@ant-design/icons";

const transactionMap = {
  0: "External",
  1: "New founder",
  2: "Launch vesting schedule",
  3: "Destroy company contract",
};

const TransactionsTiles = ({ transactions }) => {
  return (
    <Card bordered={false} style={{ width: "100%" }} title="Transactions">
      <List
        // loading={initLoading}
        itemLayout="horizontal"
        // loadMore={loadMore}
        dataSource={transactions}
        renderItem={(tx) => {
          const isConfirmed = tx.isConfirmedByMe;
          return (
            <List.Item
              actions={[
                <Button type="primary" disabled={isConfirmed}>
                  {isConfirmed ? "Confirmed" : "Confirm"}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<UserAddOutlined />}
                title={
                  <div>
                    <div
                      style={{
                        display: "inline-block",
                        width: 200,
                      }}
                    >
                      {transactionMap[tx.txType]}
                    </div>
                    <Tag
                      size="large"
                      icon={<CheckCircleOutlined />}
                      color="success"
                    >
                      success
                    </Tag>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default TransactionsTiles;
