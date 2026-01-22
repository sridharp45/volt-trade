import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import { Link } from 'react-router-dom';
// import logo from "./BYD_SEAL.png";
import './Sidebar.css';

// const CustomBurgerIcon = () => <img style={{width:"50px"}} src={logo} alt="logo" />;

const Sidebar = () => {
  return (
    <Menu>
      {/* <img style={{width:"50px"}} src={logo} alt="logo" /> */}
          <Link to="/home" className="menu-links">
            Home
          </Link>
          <Link to="/transactions" className="menu-links">
            Transactions
          </Link>
          {/* <Link to="/query" className="menu-links">
            Query
          </Link> */}
          <Link to="/homeGrid" className="menu-links">
            Home Management
          </Link>
          <Link to="/vehicleDashboard" className="menu-links">
            Vehicle Inventory
          </Link>
          <Link to="/admin" className="menu-links">
            Admin
          </Link>
          {<Link to="/liveStream" className="menu-links">
            Live Stream
          </Link>}
          <Link to="/support" className="menu-links">
            Help & Support
          </Link>
          {/* <Link to="/charging" className="menu-links">
            Charging
          </Link> */}
    </Menu>
  );
};

export default Sidebar;
