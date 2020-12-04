import React from "react";
import { Card, List, Button, Tag } from "antd";
import {
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const transactionMap = {
  0: "External",
  1: "New founder",
  2: "Launch vesting schedule",
  3: "Destroy company contract",
};

const TransactionsTiles = ({
  transactions,
  prevTransactionId,
  handleConfirmation,
  loadTransaction,
  loading,
}) => {
  const loadMore = (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        height: 32,
        lineHeight: "32px",
      }}
    >
      <Button onClick={() => loadTransaction(prevTransactionId)}>
        Load previous
      </Button>
    </div>
  );

  return (
    <Card bordered={false} style={{ width: "100%" }} title="Transactions">
      <List
        itemLayout="horizontal"
        loadMore={prevTransactionId && loadMore}
        dataSource={transactions}
        renderItem={(tx) => {
          const isConfirmed = tx.isConfirmedByMe;
          const isExecuted = tx.isExecuted;

          return (
            <List.Item
              actions={[
                <Button
                  loading={loading}
                  type="primary"
                  disabled={isConfirmed || isExecuted}
                  onClick={() => handleConfirmation(tx.txId)}
                >
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
                      icon={
                        isExecuted ? (
                          <CheckCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                      color={isExecuted ? "success" : "processing"}
                    >
                      {isExecuted ? "Executed" : "Waiting for confirmations"}
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
