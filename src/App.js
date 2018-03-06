import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';
import { web3Connection } from './web3';
import NewApplicant from './pages/new-applicant';
import NewLoanDetails from './pages/new-loan-apply';
import UserLoanStatus from './pages/user-loan-status';
import ManageLoanStatus from './pages/manage-loan-status';

class App extends Component {
  
  constructor(props) {
      super(props);
      this.state = {
          connected: undefined
      }
  }

  componentDidMount() {
      web3Connection.watch((connected) => {
          this.setState({ connected });            
      }).catch()
  }
  
  render() {

    const { connected } = this.state;

    return (

      <div>
        <div className = "jumbotron jumbotron-fluid">
          <div className = "container">
            <h2 className = "display-4">Loan Management private blockchain</h2>            
            <p className = "lead">{connected && "Loan management"}{!connected && "Connecting to Loanchain"}</p>
          </div>
        </div>

        <BrowserRouter>
            <Switch>
                <Route exact path = '/' component = { NewApplicant } />
                <Route exact path = '/loan' component = { NewLoanDetails } />
                <Route exact path = '/loanstatus' component = { UserLoanStatus } />
                <Route exact path = '/manageloan' component = { ManageLoanStatus } />
            </Switch>
        </BrowserRouter>

      </div>

    );
  }
}

export default App;
