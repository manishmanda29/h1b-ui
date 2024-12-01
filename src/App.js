import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Dashboard from './Dashboard';
import Visualizations from './Visualizations';

function App() {
  return (
    <><Header/>
    <Routes>
      <Route path={"/h1b-data"} element={<Dashboard />} />
      <Route path={"/"} element={<Visualizations/>}></Route>
      <Route path={"/visualizations"} element={<Visualizations/>}></Route>
    </Routes>
  </>
  );
}

export default App;
