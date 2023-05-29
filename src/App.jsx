import React, { useState, createContext } from "react";
import "./loginStyles.css";
import LoginForm from "./components/LoginForm";
import SecondFile from "./components/SecondFile";
import Middle from "./components/Middle";

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

  const nextStep = () => {
    setState((prevState) => ({
      ...prevState,
      step: prevState.step + 1,
    }));
  };

  const docnextStep = () => {
    setState((prevState) => ({
      ...prevState,
      step: prevState.step + 2,
    }));
  };

  const handleChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const { step } = state;
  const values = { state };

  return (
    <AppContext.Provider value={{ state, setState }}>
      {step === 1 && (
        <LoginForm
          nextStep={nextStep}
          docnextStep={docnextStep}
          handleChange={handleChange}
          values={values}
        />
      )}
      {step === 2 && (
        <SecondFile
          nextStep={nextStep}
          docnextStep={docnextStep}
          handleChange={handleChange}
          values={values}
        />
      )}
      {step === 3 && (
        <Middle
          nextStep={nextStep}
          handleChange={handleChange}
          values={values}
        />
      )}
    </AppContext.Provider>
  );
};

export default App;
