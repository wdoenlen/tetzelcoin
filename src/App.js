import React, { Component } from 'react'
import Tetzel from '../build/contracts/Tetzel.json'
import TetzelCrowdsale from '../build/contracts/TetzelCrowdsale.json'
import getWeb3 from './utils/getWeb3'

import ConfessionBox from './components/ConfessionBox'
import SinsTable from './components/SinsTable'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      tetzelInstance: null,
      tetzelCoinAddress: null,
      account: null,
      recentSins: [],
    }
  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    try {
      var web3 = await getWeb3;
      this.setState({web3: web3.web3});
      await this.fetchAccount();
      await this.instantiateContracts();
      this.instantiateFilter();
    } catch(e) {
      console.log(e);
    }
  }

  async fetchAccount() {

    try {
      var accounts = await this._getAccountsPromise();
    } catch(e) {
      console.log(e);
    }
    
    if (!accounts) {
      throw "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
    }

    this.setState({account: accounts[0]});

  }

  _getAccountsPromise() {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.state.web3.eth.getAccounts(function (e, accounts) {
        if (e != null) {
          reject(e);
        } else {
          resolve(accounts);
        }
      });
    });
  }

  hexToAscii(h) {
    var hex  = h.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }

  async instantiateContracts() {

    const contract = require('truffle-contract')
    const tetzel = contract(Tetzel)
    const tetzelCrowdsale = contract(TetzelCrowdsale)

    tetzel.setProvider(this.state.web3.currentProvider)
    tetzelCrowdsale.setProvider(this.state.web3.currentProvider)

    //TODO: Is there any way to do this without making so many async calls?
    var tetzelInstance = await tetzel.deployed();
    var tetzelCrowdsaleAddress = await tetzelInstance.crowdsale.call();
    var tetzelCrowdsaleInstance = await tetzelCrowdsale.at(tetzelCrowdsaleAddress);
    var tetzelCoinAddress = await tetzelCrowdsaleInstance.token.call();

    this.setState({
      tetzelInstance: tetzelInstance,
      tetzelCoinAddress: tetzelCoinAddress
    });
  }

  async confess(sin, payment) {

    payment = parseFloat(payment);

    var isValidSin = sin.length > 0;
    var isValidPayment = payment > 0;

    if ( !(isValidSin && isValidPayment) ) {
      throw "Invalid confession";
    }

    try {
      var results = await this.state.tetzelInstance.confess(
        sin, {from: this.state.account, value: this.state.web3.toWei(payment, 'ether')}
      );
      console.log(results);
    } catch(e) {
      console.log(e);
    }
  }

  instantiateFilter() {
    
    var sinFilter = this.state.web3.eth.filter({
      address: this.state.tetzelInstance.address,
      fromBlock: 1,
      toBlock: 'latest'
    });

    sinFilter.watch((err, event) => {
      if (err !== null) {
        console.log("There was an error getting event logs");
      }

      var logObj = {
        blockNumber: event.blockNumber,
        sinner: "0x" + event.topics[1].replace(/^0x0+/, ""),
        sin: this.hexToAscii(event.data.replace("0x", "")),
        payment: this.state.web3.fromWei(parseInt(event.topics[3], 16), 'ether'),
        sinHash: event.topics[2],
      };
2
      this.setState({ recentSins: [...this.state.recentSins, logObj] });

    });

  } 

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">TetzelCoin</a>
        </nav>

        <main className="container">
          <ConfessionBox 
            tokenAddress={ this.state.tetzelCoinAddress } 
            onConfess={ this.confess.bind(this) } />
          <SinsTable recentSins={ this.state.recentSins } />
        </main>
      </div>
    );
  }
}

export default App