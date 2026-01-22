import React from 'react'
// import {Link} from 'react-router-dom';
import Navbar from "../Shared/Navbar/Navbar";
import './userTxn.css';

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Section title="Pending Requests in Manual SmartContract" />
        <Section title="Pending Requests in Automated SmartContract" showSettle />
        <Section title="Pending Requests in Commissioned SmartContract" showSettle />
      </div>
    </div>
  );
};

const Section = ({ title, showSettle }) => (
  <div className="section">
    <h2>{title}</h2>
    <div className="table">
      <div className="row header">
        <div>Prosumer Count</div>
        <div>Consumer Count</div>
        {showSettle && <div>Settle Up</div>}
      </div>
      <div className="row">
        <div></div>
        <div></div>
        {showSettle && (
          <div>
            <button>Settle</button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default App;