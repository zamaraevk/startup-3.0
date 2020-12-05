import React, { Component } from "react";
import { Col, Row } from "antd";

import BalanceTile from "./DashboardTiles/BalanceTile";
import FoundersTile from "./DashboardTiles/FoundersTile";
import EquityPoolTile from "./DashboardTiles/EquityPoolTile";
import TransactionsTile from "./DashboardTiles/TransactionsTile";
import AddressModalForm from "./DashboardTiles/AddressModalForm";
import ExternalTransactionModalForm from "./DashboardTiles/ExternalTransactionModalForm";

class DashboardContent extends Component {
  state = {
    roleCount: "0",
    totalSupply: "0",
    equityPool: "0",
    transactionCount: null,
    transactions: [],
    isModalVisible: false,
    isExternalModalVisible: false,
    loading: null, // ["founder", "confirm", "schedule", "external"]
    isScheduleLaunched: false,
  };

  componentDidMount = async () => {
    const { transactions } = this.state;
    const { accounts, companyContract, web3 } = this.props;

    const ownerRole = await companyContract.methods
      .OWNER_ROLE()
      .call({ from: accounts[0] });

    const roleCount = await companyContract.methods
      .getRoleMemberCount(ownerRole)
      .call({ from: accounts[0] });

    const totalSupply = await companyContract.methods
      .TOTAL_SUPPLY()
      .call({ from: accounts[0] });

    const equityPool = await companyContract.methods
      .equityPool()
      .call({ from: accounts[0] });

    const transactionCount = await companyContract.methods
      .transactionCount()
      .call({ from: accounts[0] });

    const isScheduleLaunched = await companyContract.methods
      .vestingSchedule()
      .call({ from: accounts[0] });

    let lastTransaction;
    let transactionsUpdated = transactions;

    if (transactionCount > 0) {
      lastTransaction = await companyContract.methods
        .getTransactionDetails(transactionCount - 1)
        .call({ from: accounts[0] });
      transactionsUpdated = [...transactions, lastTransaction];
    }

    this.setState({
      roleCount,
      transactionCount,
      totalSupply: totalSupply,
      equityPool: web3.utils.fromWei(equityPool),
      transactions: transactionsUpdated,
      isScheduleLaunched,
    });
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  showExternalModal = () => {
    this.setState({ isExternalModalVisible: true });
  };

  handleOk = async ({ address }) => {
    const { accounts, companyContract } = this.props;

    this.setState({ loading: "founder" });
    await companyContract.methods
      .submitTransaction("NewFounder", address, 0, "0x00")
      .send({ from: accounts[0] });

    this.setState({ loading: null, isModalVisible: false });
    window.location.reload();
  };

  handleExternalOk = async ({ address, amount }) => {
    const { accounts, companyContract, web3 } = this.props;
    const weiAmount = web3.utils.toWei(amount);
    
    this.setState({ loading: "external" });
    await companyContract.methods
      .submitTransaction("External", address, weiAmount, "0x00")
      .send({ from: accounts[0] });

    this.setState({ loading: null, isExternalModalVisible: false });
    window.location.reload();
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  handleExternalCancel = () => {
    this.setState({ isExternalModalVisible: false });
  };

  launchVestingSchedule = async () => {
    const { accounts, companyContract } = this.props;

    this.setState({ loading: "schedule" });
    await companyContract.methods
      .submitTransaction("LaunchVestingSchedule", accounts[0], 0, "0x00")
      .send({ from: accounts[0] });

    window.location.reload();
  };

  confirmTransaction = async (transctionId) => {
    const { accounts, companyContract } = this.props;

    this.setState({ loading: "confirm" });
    await companyContract.methods
      .confirmTransaction(transctionId)
      .send({ from: accounts[0] });

    this.setState({ loading: null });
    window.location.reload();
  };

  loadTransaction = async (transctionId) => {
    const { transactions } = this.state;
    const { accounts, companyContract } = this.props;

    const tx = await companyContract.methods
      .getTransactionDetails(transctionId)
      .call({ from: accounts[0] });

    const transactionsUpdated = [...transactions, tx];
    this.setState({ transactions: transactionsUpdated });
  };

  render() {
    const {
      roleCount,
      transactionCount,
      totalSupply,
      equityPool,
      transactions,
      isScheduleLaunched,
      isModalVisible,
      isExternalModalVisible,
      loading,
    } = this.state;
    const { balance, ticker } = this.props;

    const prevTransactionId = transactionCount - transactions.length - 1;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <BalanceTile balance={balance} showModal={this.showExternalModal} />
          </Col>
          <Col span={8}>
            <FoundersTile
              foundersCount={roleCount}
              showModal={this.showModal}
            />
          </Col>
          <Col span={8}>
            <EquityPoolTile
              ticker={ticker}
              loading={loading === "schedule"}
              equityPool={equityPool}
              totalSupply={totalSupply}
              isScheduleLaunched={isScheduleLaunched}
              handleLaunchVestingSchedule={this.launchVestingSchedule}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TransactionsTile
              loading={loading === "confirm"}
              transactions={transactions}
              handleConfirmation={this.confirmTransaction}
              prevTransactionId={prevTransactionId}
              loadTransaction={this.loadTransaction}
            />
          </Col>
        </Row>
        <AddressModalForm
          loading={loading === "founder"}
          visible={isModalVisible}
          onCreate={this.handleOk}
          onCancel={this.handleCancel}
        />
        <ExternalTransactionModalForm
          loading={loading === "external"}
          visible={isExternalModalVisible}
          onCreate={this.handleExternalOk}
          onCancel={this.handleExternalCancel}
        />
      </div>
    );
  }
}

export default DashboardContent;
