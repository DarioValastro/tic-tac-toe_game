import React from 'react';
import { BrowserRouter as Router, Route,Link ,Routes} from 'react-router-dom';
import Home from './pages/Home';
import TicTacToe from './App'

function RoutesApp() {
    return ( 
        <Router>
          <div>
              <Link to='/game'> </Link>
              <Link to='/'> </Link>
          </div>
          <Routes>
              <Route path="/game" element={<TicTacToe />}></Route>
              <Route path="/" element={<Home />}></Route>
          </Routes>
      
       </Router>
      );
}

export default RoutesApp;