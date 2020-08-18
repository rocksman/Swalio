import React from 'react';
import { Provider } from "react-redux";
import store from "./stores";
import Route from './route';
import {constants} from './constants/request';
import socketIOClient from "socket.io-client";
import './App.css';

let socket;
class App extends React.Component{
  componentWillMount(){
    socket = socketIOClient(constants.request);
  }
  render(){
    return(
      <Provider store={store}>
        <Route/>
      </Provider>
    )
  }
}

export {socket};

export default App;
