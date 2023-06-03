import React, { useState, createContext } from "react";
import "./loginStyles.css";
import LoginForm from "./components/LoginForm";
import Patient from "./components/Patient";
import Doctor from "./components/Doctor";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export const AppContext = React.createContext();
const App = () => {
  const [state, setState] = useState({
    doctor: "",
    patient: "",
    age: 0,
    step: 1,
    role: "",
    hash: "",
  });

  const handleChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const values = { state };
  console.log(state);
  return (
    <AppContext.Provider value={{ state, handleChange }}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/doctor" element={<Doctor />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
