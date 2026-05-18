import React, { useState } from 'react';
import './App.css';
import { UserContext } from './UserContext';
import Header from './component/Layouts/Header';
import Footer from './component/Layouts/Footer';
import { useLocation } from 'react-router-dom';

function App(props) {
  const [user, setUser] = useState(null);
  let params1 = useLocation();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {
        params1['pathname'].includes("login") ? '' : <Header />
      }
      {props.children}
      {
        params1['pathname'].includes("login") ? '' : <Footer />
      }
    </UserContext.Provider>
  );
}

export default App;
