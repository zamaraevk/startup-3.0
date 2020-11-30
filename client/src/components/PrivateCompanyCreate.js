import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Card, Form, Input, Button, Spin } from "antd";

const PrivateCompanyCreate = ({ accounts, contract }) => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const onFinish = async ({ company_name, ticker }) => {
    try {
      setLoading(true);

      const response = await contract.methods
        .create(company_name, ticker)
        .send({ from: accounts[0] });

      const instanceAddress =
        response.events["ContractInstantiation"].returnValues["instantiation"];

      history.push(`/company/${instanceAddress}`);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {loading ? (
        <Spin size="large" tip="Creating your private company..."/>
      ) : (
        <Card
          title="Create your private company"
          style={{ width: 500, alignSelf: "center" }}
        >
          <Form name="basic" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="company_name"
              style={{
                paddingBottom: 5,
              }}
              rules={[
                {
                  required: true,
                  message: "Please input your company name.",
                },
              ]}
            >
              <Input placeholder="Company name" size="large" />
            </Form.Item>
            <Form.Item
              name="ticker"
              style={{
                paddingBottom: 5,
              }}
              rules={[
                {
                  required: true,
                  message: "Please input your company ticker.",
                },
              ]}
            >
              <Input placeholder="Ticker name" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default PrivateCompanyCreate;
