import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredPrompts, setFilteredPrompts] = useState([]);

  const prompts = [
    { name: "Home", link: "/home" },
    { name: "Transaction request", link: "/transactions" },
    { name: "Vehicle Dashboard", link: "/vehicleDashboard" },
    { name: "Vehicle Inventory", link: "/vehicleDashboard/inventory" },
    { name: "Profile", link: "/profile" },
    { name: "Wallet", link: "/home" },
    { name: "Add a vehicle", link: "/vehicleDashboard/add"},
    { name: "Posts", link: "/transactions/post"},
    { name: "Pending Transactions", link: "/transactions/pending"},
    { name: "Transactions History", link: "/transactions/past"},
    { name: "Past Transactions", link: "/transactions/past"},
    { name: "Home Management", link: "/homeGrid"},
    { name: "Pending Home Transactions", link: "/homeGrid/pending"},
    { name: "Home Transactions History", link: "/homeGrid/past"},
  ];

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);

    if (input === "") {
      setFilteredPrompts([]);
    } else {
      const matches = prompts.filter((prompt) =>
        prompt.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredPrompts(matches);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
            <input
              style={{ marginLeft: "60px", height: '2rem' }}
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={handleInputChange}
            />
            {filteredPrompts.length > 0 && (
              <ul style={{ position: 'absolute', backgroundColor: 'white', listStyle: 'none', padding: '0.5rem', marginLeft: '65px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: 1000, borderRadius: '10px' }}>
                {filteredPrompts.map((prompt, index) => (
                  <div style={{margin:'0.5rem'}}>
                    <Link key={index} to={prompt.link} style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}>{prompt.name}</Link>
                    {/* <li
                      key={index}
                      onClick={() => handlePromptClick(prompt.link)}
                      style={{  }}
                    >
                      {prompt.name}
                    </li> */}
                  </div>
                ))}
              </ul>
            )}
    </div>
  );
};


export default Search;
