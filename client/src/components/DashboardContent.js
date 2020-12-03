import React, { Component } from "react";
import { Col, Row } from "antd";

import BalanceTile from "./DashboardTiles/BalanceTile";
import FoundersTile from "./DashboardTiles/FoundersTile";
import EquityTile from "./DashboardTiles/EquityTile";
import TransactionsTile from "./DashboardTiles/TransactionsTile";
import AddressModalForm from "./DashboardTiles/AddressModalForm";

class DashboardContent extends Component {
  state = {
    roleCount: "0",
    currentBalance: "0",
    lockedBalance: "0",
    transactionCount: 0,
    transactions: [],
    isModalVisible: false,
    loading: false,
  };

  componentDidMount = async () => {
    const { accounts, companyContract } = this.props;
    const ownerRole = await companyContract.methods
      .OWNER_ROLE()
      .call({ from: accounts[0] });

    const roleCount = await companyContract.methods
      .getRoleMemberCount(ownerRole)
      .call({ from: accounts[0] });

    const equityBalance = await companyContract.methods
      .getEquityHolderBalance(accounts[0])
      .call({ from: accounts[0] });

    const transactionCount = await companyContract.methods
      .transactionCount()
      .call({ from: accounts[0] });

    this.setState({
      roleCount,
      transactionCount,
      currentBalance: equityBalance.currentBalance,
      lockedBalance: equityBalance.lockedBalance,
    });
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  handleOk = async ({ address }) => {
    const { accounts, companyContract } = this.props;

    this.setState({ loading: true });

    await companyContract.methods
      .submitTransaction("NewFounder", address, 0, "0x00")
      .send({ from: accounts[0] });

    this.setState({ loading: false, isModalVisible: false });
    window.location.reload();
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  render() {
    const {
      roleCount,
      currentBalance,
      lockedBalance,
      transactions,
      isModalVisible,
      loading,
      transactionCount
    } = this.state;
    const { balance, ticker } = this.props;
    console.log("====", transactionCount)
    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <BalanceTile balance={balance} />
          </Col>
          <Col span={8}>
            <FoundersTile
              foundersCount={roleCount}
              showModal={this.showModal}
            />
          </Col>
          <Col span={8}>
            <EquityTile
              ticker={ticker}
              currentBalance={currentBalance}
              lockedBalance={lockedBalance}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TransactionsTile transactions={transactions} />
          </Col>
        </Row>
        <AddressModalForm
          loading={loading}
          visible={isModalVisible}
          onCreate={this.handleOk}
          onCancel={this.handleCancel}
        />
      </div>
    );
  }
}

export default DashboardContent;
