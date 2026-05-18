import logo from './logo.svg';
import './App.css';
import { UserContext } from './UserContext';
import Header from './component/Layouts/Header';
import Footer from './component/Layouts/Footer';
import { Outlet, useLocation } from 'react-router-dom';

function App(props) {
  let params1 = useLocation();
  return (
    <UserContext.Provider>
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
