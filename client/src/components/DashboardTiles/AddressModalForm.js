import React from "react";
import { Modal, Form, Input } from "antd";
import { BlockOutlined } from "@ant-design/icons";

const AddressModalForm = ({ visible, loading, onCreate, onCancel }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      title="Add new founder"
      okText="Add"
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
      <Form form={form} name="address" initialValues={{ address: "" }}>
        <Form.Item
          name="address"
          rules={[
            {
              required: true,
              message: "Please add new founder address",
            },
          ]}
        >
          <Input
            name="address"
            size="large"
            placeholder="Founder address"
            prefix={<BlockOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddressModalForm;
