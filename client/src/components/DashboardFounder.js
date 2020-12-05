import React, { Component } from "react";
import { Col, Row } from "antd";

import FounderBalanceTile from "./DashboardTiles/FounderBalanceTile";
import EquityTile from "./DashboardTiles/EquityTile";

class DashboardContent extends Component {
  state = {
    currentBalance: "0",
    lockedBalance: "0",
    isModalVisible: false,
    loading: null, // ["founder", "confirm", "schedule"]
    isScheduleLaunched: false,
  };

  componentDidMount = async () => {
    const { accounts, companyContract, web3 } = this.props;

    const equityBalance = await companyContract.methods
      .getEquityHolderBalance(accounts[0])
      .call({ from: accounts[0] });

    const isScheduleLaunched = await companyContract.methods
      .vestingSchedule()
      .call({ from: accounts[0] });

    this.setState({
      currentBalance: web3.utils.fromWei(equityBalance.currentBalance),
      lockedBalance: web3.utils.fromWei(equityBalance.lockedBalance),
      isScheduleLaunched,
    });
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
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

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  render() {
    const {
      currentBalance,
      lockedBalance,
      isScheduleLaunched,
      loading,
    } = this.state;
    const { balance, ticker } = this.props;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <FounderBalanceTile balance={balance} ticker={ticker} />
          </Col>
          <Col span={8}>
            <EquityTile
              ticker={ticker}
              loading={loading === "schedule"}
              currentBalance={currentBalance}
              lockedBalance={lockedBalance}
              isScheduleLaunched={isScheduleLaunched}
              handleLaunchVestingSchedule={this.launchVestingSchedule}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default DashboardContent;
