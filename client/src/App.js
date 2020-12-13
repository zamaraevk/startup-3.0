import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import PrivateCompanyFactoryContract from "./contracts/PrivateCompanyFactory.json";
import getWeb3 from "./getWeb3";
import "./App.less";

import { Spin } from "antd";
import PrivateCompanyCreate from "./components/PrivateCompanyCreate";
import PrivateCompanyDashboard from "./components/PrivateCompanyDashboard";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    factoryContract: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Rinkeby Testnet Network
      const contractAddress = "0x8e8ce40A2304031090A7f0BEd887cbEFf9EA9E4C";

      // Get the contract instance.
      const instance = new web3.eth.Contract(
        PrivateCompanyFactoryContract.abi,
        contractAddress
      );
 
      this.setState({ web3, accounts, factoryContract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    const { accounts, factoryContract, web3 } = this.state;

    if (!web3) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="App">
        <Router basename="/">
          <Switch>
            <Route path="/company/:address">
              <PrivateCompanyDashboard accounts={accounts} web3={web3} />
            </Route>
            <Route path="/">
              <PrivateCompanyCreate
                accounts={accounts}
                contract={factoryContract}
                web3={web3}
              />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
