import React, { useContext } from "react";
import Web3 from "web3";
import File from "../../build/contracts/File.json";
import "../loginStyles.css";
import { AppContext } from "../App";
const LoginForm = ({ values, handleChange, nextStep, docnextStep }) => {
  const { state, setState } = useContext(AppContext);
  console.log("state", state);
  const continueForm = (e) => {
    e.preventDefault();
    nextStep();
  };

  const docContinueForm = (e) => {
    e.preventDefault();
    docnextStep();
  };

  return (
    <div className="container login-container">
      <div className="row">
        <div className="col-md-6 login-form-1">
          <h3>Doctor</h3>
          <form>
            <div className="form-group">
              <label htmlFor="doctorName">Your Name</label>
              <input
                type="text"
                id="doctorName"
                className="form-control"
                placeholder="Enter Name"
                name="doctor"
                value={state.doctor}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="submit"
                className="btnSubmit"
                value="Login"
                onClick={docContinueForm}
              />
            </div>
          </form>
        </div>
        <div className="col-md-6 login-form-2">
          <h3>Patient</h3>
          <form>
            <div className="form-group">
              <label htmlFor="patientName">Your Name</label>
              <input
                type="text"
                id="patientName"
                className="form-control"
                placeholder="Enter Your Name"
                name="patient"
                value={state.patient}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="patientAge">Your Age</label>
              <input
                type="text"
                id="patientAge"
                className="form-control"
                placeholder="Enter Age"
                name="age"
                value={state.age}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="submit"
                className="btnSubmit"
                value="Login"
                onClick={continueForm}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
