import React from "react";
import { Card, List, Avatar, Button, Skeleton } from "antd";

const TransactionsTiles = ({ transactions }) => {
  return (
    <Card bordered={false} style={{ width: "100%" }} title="Transactions">
      <List
        // loading={initLoading}
        itemLayout="horizontal"
        // loadMore={loadMore}
        dataSource={transactions}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="list-loadmore-edit">edit</a>,
              <a key="list-loadmore-more">more</a>,
            ]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title={<a href="https://ant.design">{item.name}</a>}
                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
              />
              <div>content</div>
            </Skeleton>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TransactionsTiles;
