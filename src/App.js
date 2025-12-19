import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from "./components/Landingpage/Home";
import MeinProfil from './components/Navbar/MeinProfil';
import LoginForm from './components/Login/LoginForm';
import MenuCards from './components/Card/MenuCards';
import MenuCategory from './components/Card/MenuCategory';
import Galerie from './components/Galerie/Galerie';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<MeinProfil />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/cards" element={<MenuCards />} />
          <Route path="/cards/:id" element={<MenuCategory />} />
          <Route path="/galerie" element={<Galerie />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
