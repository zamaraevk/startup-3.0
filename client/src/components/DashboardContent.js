import React, { Component } from "react";
import { Col, Row } from "antd";

import BalanceTile from "./DashboardTiles/BalanceTile";
import FoundersTile from "./DashboardTiles/FoundersTile";
import EquityTile from "./DashboardTiles/EquityTile";

class DashboardContent extends Component {
  state = {
    roleCount: null,
    currentBalance: "0",
    lockedBalance: "0",
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

    this.setState({
      roleCount,
      currentBalance: equityBalance.currentBalance,
      lockedBalance: equityBalance.lockedBalance,
    });
  };

  render() {
    const { roleCount, currentBalance, lockedBalance } = this.state;
    const { balance, ticker } = this.props;

    return (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <BalanceTile balance={balance} />
          </Col>
          <Col span={8}>
            <FoundersTile foundersCount={roleCount} />
          </Col>
          <Col span={8}>
            <EquityTile
              ticker={ticker}
              currentBalance={currentBalance}
              lockedBalance={lockedBalance}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default DashboardContent;
