import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from "./components/Landingpage/Home";
import LoginForm from './components/Login/LoginForm';
import MenuCategory from './components/Card/MenuCategory';
import Galerie from './components/Galerie/Galerie';
import MenuCardsManager from './components/Card/MenuCardsManager';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/cards" element={<MenuCardsManager />} />
          <Route path="/card/:cardId" element={<MenuCategory />} />
          <Route path="/galerie" element={<Galerie />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
