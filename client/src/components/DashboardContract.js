import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { Button, Card, Col, Row, Descriptions } from "antd";

class DashboardContract extends Component {
  state = {
    loading: null, // ["stop", "resume", "destroy"]
  };

  toggleContract = async () => {
    const { accounts, companyContract, isContractStopped } = this.props;

    if (isContractStopped) {
      this.setState({ loading: "resume" });

      await companyContract.methods
        .resumeContract()
        .send({ from: accounts[0] });
    } else {
      this.setState({ loading: "stop" });
      await companyContract.methods.stopContract().send({ from: accounts[0] });
    }

    this.setState({ loading: null });
    window.location.reload();
  };

  destroyContract = async () => {
    const { accounts, companyContract, history } = this.props;

    this.setState({ loading: "destroy" });
    await companyContract.methods
      .submitTransaction("DestroyCompany", accounts[0], 0, "0x00")
      .send({ from: accounts[0] });

    history.push("/");
  };

  render() {
    const { loading } = this.state;
    const { isContractStopped } = this.props;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card bordered={false}>
              <Descriptions
                title="Contract settings"
                layout="vertical"
                bordered
              >
                <Descriptions.Item label="Emergency stop" span={2}>
                  {isContractStopped ? (
                    <Button
                      loading={loading === "resume"}
                      onClick={this.toggleContract}
                    >
                      Resume the contract
                    </Button>
                  ) : (
                    <Button
                      danger
                      loading={loading === "stop"}
                      onClick={this.toggleContract}
                    >
                      Stop the contract
                    </Button>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={3}>
                  Please make sure that all founders aware. Contract emergency
                  stop will block following actions:
                  <br />
                  - Transaction Submittion
                  <br />- Transaction Confirmation
                </Descriptions.Item>
                <Descriptions.Item label="Contract lifecycle" span={2}>
                  <Button
                    type="primary"
                    danger
                    loading={loading === "destroy"}
                    onClick={this.destroyContract}
                  >
                    Destroy the contract
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={3}>
                  This action will create a transaction to destroy the company
                  contract from the blockchain. To perform this action each
                  founder have to submit confirmation.
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withRouter(DashboardContract);
