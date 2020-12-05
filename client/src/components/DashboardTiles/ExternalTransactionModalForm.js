import React from "react";
import { Modal, Form, Input } from "antd";
import { BlockOutlined } from "@ant-design/icons";

const ExternalTransactionModalForm = ({
  visible,
  loading,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      title="External Transaction"
      okText="Send"
      cancelText="Cancel"
      okButtonProps={{
        loading,
      }}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form
        form={form}
        name="address"
        initialValues={{ address: "", amount: "" }}
      >
        <Form.Item
          name="address"
          rules={[
            {
              required: true,
              message: "Please add address of external transaction",
            },
          ]}
        >
          <Input
            name="address"
            size="large"
            placeholder="External address"
            prefix={<BlockOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="amount"
          rules={[
            {
              required: true,
              message: "Please add amount to send",
            },
          ]}
        >
          <Input
            name="amount"
            size="large"
            placeholder="ETH amount"
            prefix={<BlockOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExternalTransactionModalForm;
