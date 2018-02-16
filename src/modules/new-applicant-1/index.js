import React, { Component } from 'react';
import LoanChainContract from '../resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';
import Solidity from '../../lib/solidity';
import { web3Connection } from '../../web3';
import loader from '../img/tenor.gif';

class NewApplicant extends Component {

    constructor(props) {

        super(props);

        this.state = {
            compilationResult: undefined,
            statusMessage: undefined,
            thisTxHash: undefined,
            contractABI: undefined,
            thisAddress: undefined,
            connected: undefined,
            isDeployInProgress: undefined,
            showABI: false,
            contractFile : LoanChainContract,
            moduleTitle: 'Please fill in loan applicant details',
            contractName: ':Applicant',
            processCommandText: 'Submit Details',
            form: {
                name: {title: 'Name' , value: 'name'},
                sex: {title: 'Sex', value: 'sex'},
                dob: {title: 'DOB', value: 'dob'},
                street1: {title: 'Street 1', value: 'street1'},
                street2: {title: 'Street 2', value: 'street2'},
                city: {title: 'City', value: 'city'},
                zip: {title: 'Zip', value: 'zip'},
                state: {title: 'State', value: 'state'},
                country: {title: 'Country', value: 'country' },
                ssn: {title: 'Social Security', value: '1234', validate: (value) => {return parseInt(value, 10) || 0} },
                income: {title: 'Anual Income', value: '123456789101112', validate: (value) => {return parseInt(value, 10) || 0} }
            }
        }

        this.compileAndDeployCarContract = this.compileAndDeployCarContract.bind(this);
        this.toogleABI = this.toogleABI.bind(this);
        this.onUpdateContract = this.onUpdateContract.bind(this);

    }

    componentWillMount() {

        Solidity.autoCompileContract(this.state.contractFile).then((compilationResult) => {
            
            console.log('compilationResult', compilationResult);

            this.setState({ compilationResult });

        }).catch((error) => {

            this.setState({
                statusMessage: 'Compilation error ' + JSON.stringify(error),
                compilationResult: undefined,
                isDeployInProgress: false
            });

        });

        web3Connection.watch((connected) => {
            this.setState({ connected });            
        }).catch();

    }

    onUpdateContract(newContract, abi) {
        
        if(!newContract.address) {
            this.setState({
                statusMessage: 'Contract transaction send and waiting for mining...',
                thisTxHash: newContract.transactionHash,
                isDeployInProgress: true,
                contractABI: abi,
                thisAddress: 'waiting to be mined for contract address...'
            });    
            
        } else {
            this.setState({
                statusMessage: 'Contract deployed successfully !!! ',
                thisTxHash: newContract.transactionHash,
                isDeployInProgress: false,
                contractABI: abi,
                thisAddress: newContract.address
            });

            this.onContractCreated(newContract);
        }
        
    }

    onContractCreated(contract) {
        return new Promise(() => {
            console.log('getApplicantDetails', contract.getApplicantDetails());
        }).catch((error) => {
            console.log('Contract created object error', error)
        });
    }

    compileAndDeployCarContract() {

        const contractInput = Object.keys(this.state.form).map((item) => {
                return this.state.form[item].value;
            }),
            contractName = this.state.contractName,
            { compilationResult } = this.state;

        this.setState({
            statusMessage: 'Compiling and deploying car contract',
            isDeployInProgress: true
        });

        
        BlockChain.getGasPriceAndEstimate(compilationResult, contractName).then(({gasPrice, gasEstimate}) => {

            BlockChain.deployContract(contractInput, compilationResult, this.onUpdateContract, gasPrice, gasEstimate, contractName)
            .catch((error) => {
                this.setState({
                    statusMessage: 'deployment error: ' + error,
                    isDeployInProgress: false
                });                    
            });

        }).catch((error) => {
            this.setState({
                statusMessage: 'deployment web3.eth.getGasPrice error: ' + error,
                isDeployInProgress: false
            });
        });

    }

    toogleABI() {
        this.setState({
            showABI : !this.state.showABI
        })
    }

    onDataChange(field, { target }) {
        const { value } = target,   
            updateState = { ...this.state.form };

        console.log('onDataChange', field);
        updateState[field].value = updateState[field].validate ? updateState[field].validate(value) : value;

        this.setState( { form: updateState } );
    }

    renderForm(form) {
        return Object.keys(form).map((item) => {
            const { title, value } = form[item];
            return <div key = {item} >
                <label>{title}</label>
                <input type = "text"  className = "form-control" value = { value } onChange = { this.onDataChange.bind(this, item) } /> <br />
            </div>
        });
    }
    
    render() {
        
        const { 
            moduleTitle,
            processCommandText,
            compilationResult,            
            connected,
            statusMessage,
            thisAddress,
            contractABI,
            showABI,
            isDeployInProgress,
            form
        } = this.state;

        return (
        <div>
            {(compilationResult && connected) && <div>

                <div className = "container">
                    <div className = "row">
                        <h3>{ moduleTitle }</h3> <br />
                        
                        <div className = "col-sm-6">
                            <div className = "form-group">
                                
                                { this.renderForm(form) }

                                <input type = "button" className = "btn btn-primary" value = { processCommandText } onClick = { this.compileAndDeployCarContract } disabled = {isDeployInProgress} />

                            </div>
                        </div>
                        <div className = "col-sm-6">
                            {isDeployInProgress && <img src = {loader} alt = "" />}
                        </div>
                    </div>
                </div>                



            </div>}

            {(!(compilationResult && connected)) && <p align = "center">
                <img src = {loader} alt = "" />
            </p>}

        </div>
        );
    }
}

export default NewApplicant;
