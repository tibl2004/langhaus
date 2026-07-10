import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from "./components/Landingpage/Home";
import LoginForm from './components/Login/LoginForm';
import MenuCategory from './components/Card/MenuCategory';
import Galerie from './components/Galerie/Galerie';
import MenuCardsManager from './components/Card/MenuCardsManager';
import Footer from './components/Landingpage/Footer/Footer';
import Impressum from './components/Impressum/Impressum';
import Kontakt from './components/Landingpage/Kontakt/Kontakt';

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
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/kontakt" element={<Kontakt />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
