import React, { Component } from "react";
import { Col, Row, Modal } from "antd";

import BalanceTile from "./DashboardTiles/BalanceTile";
import FoundersTile from "./DashboardTiles/FoundersTile";
import EquityTile from "./DashboardTiles/EquityTile";
import TransactionsTile from "./DashboardTiles/TransactionsTile";

class DashboardContent extends Component {
  state = {
    roleCount: "0",
    currentBalance: "0",
    lockedBalance: "0",
    transactionCount: 0,
    transactions: [],
    isModalVisible: false,
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

  handleOk = () => {
    this.setState({ isModalVisible: false });
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
    } = this.state;
    const { balance, ticker } = this.props;

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
        <Modal
          title="Add new founder"
          visible={isModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>Address...</p>
        </Modal>
      </div>
    );
  }
}

export default DashboardContent;
