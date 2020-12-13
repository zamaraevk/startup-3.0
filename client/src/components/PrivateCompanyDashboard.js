import React, { Component } from "react";
import { Switch, Route, Link, withRouter } from "react-router-dom";
import { Layout, Menu, Tag, Typography } from "antd";

import PrivateCompanyContract from "../contracts/PrivateCompany.json";
import {
  HomeOutlined,
  StockOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

import DashboardHome from "./DashboardHome";
import DashboardFounder from "./DashboardFounder";
import DashboardContract from "./DashboardContract";

import "./Pulse.css";

const { Content, Sider, Footer } = Layout;
const { Text } = Typography;

class PrivateCompanyDashboard extends Component {
  state = {
    companyName: null,
    balance: null,
    ticker: null,
    companyContract: null,
    notOwner: false,
    isContractStopped: false,
  };

  componentDidMount = async () => {
    try {
      const { accounts, match, web3 } = this.props;
      const address = match.params.address;
      const instance = new web3.eth.Contract(
        PrivateCompanyContract.abi,
        address,
        {
          from: accounts[0],
        }
      );

      const isOwner = await instance.methods
        .isOwner(accounts[0])
        .call({ from: accounts[0] });

      if (isOwner) {
        const companyName = await instance.methods
          .name()
          .call({ from: accounts[0] });

        const ticker = await instance.methods
          .symbol()
          .call({ from: accounts[0] });

        const isContractStopped = await instance.methods
          .stopped()
          .call({ from: accounts[0] });

        const balance = await web3.eth.getBalance(address);

        this.setState({
          isContractStopped,
          balance: web3.utils.fromWei(balance),
          companyContract: instance,
          companyName,
          ticker,
        });
      } else {
        this.setState({
          notOwner: true,
        });
      }
    } catch (error) {
      console.log("errrrr", error);
    }
  };

  render() {
    const {
      balance,
      companyContract,
      companyName,
      ticker,
      isContractStopped,
    } = this.state;
    const { accounts, match, web3, location, history } = this.props;
    const { path, url } = match;
    const currentPage = location.pathname.match(/(home|founder|contract)/)[0];
    return (
      <div>
        <Layout>
          <Sider
            style={{
              height: "100vh",
            }}
          >
            <div
              className="logo"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "32px",
                margin: "16px",
              }}
            >
              <Text strong style={{ marginRight: 5 }}>
                {companyName}
              </Text>
              <Tag color="#177ddc">{ticker}</Tag>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[currentPage]}
            >
              <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to={`${url}/home`}>Home</Link>
              </Menu.Item>
              <Menu.Item key="founder" icon={<StockOutlined />}>
                <Link to={`${url}/founder`}>Founder</Link>
              </Menu.Item>
              <Menu.Item key="contract" icon={<PaperClipOutlined />}>
                <Link to={`${url}/contract`}>Contract</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            {companyContract && (
              <Content style={{ margin: "24px 16px 0" }}>
                <div
                  className="site-layout-background"
                  style={{
                    padding: 24,
                    minHeight: "100%",
                  }}
                >
                  <Switch>
                    <Route path={`${path}/home`}>
                      <DashboardHome
                        web3={web3}
                        ticker={ticker}
                        accounts={accounts}
                        balance={balance}
                        companyContract={companyContract}
                      />
                    </Route>
                    <Route path={`${path}/founder`}>
                      <DashboardFounder
                        web3={web3}
                        ticker={ticker}
                        accounts={accounts}
                        balance={balance}
                        companyContract={companyContract}
                      />
                    </Route>
                    <Route path={`${path}/contract`}>
                      <DashboardContract
                        web3={web3}
                        ticker={ticker}
                        accounts={accounts}
                        balance={balance}
                        companyContract={companyContract}
                        isContractStopped={isContractStopped}
                      />
                    </Route>
                  </Switch>
                </div>
              </Content>
            )}
            {companyContract && (
              <Footer
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingRight: 40,
                }}
              >
                <div
                  className={`pulse ${isContractStopped ? "red" : "green"}`}
                ></div>
                <div
                  style={{
                    color: isContractStopped ? "#a61d24" : "green",
                  }}
                >
                  {isContractStopped ? "contract stopped" : "contract live"}
                </div>
              </Footer>
            )}
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default withRouter(PrivateCompanyDashboard);
