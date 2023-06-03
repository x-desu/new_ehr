import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../App";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import File from "../../build/contracts/File.json";
import "../loginStyles.css";
import { create } from "ipfs-http-client";
import LoginForm from "./LoginForm";
const projectId = "2QH6h8iM8IjbLKewjuo6JENhMVG";
const projectSecret = "a15a4916d404f3e8bfb62c4ce1d980a8";
const auth = "Basic " + btoa(projectId + ":" + projectSecret);

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth, // Replace YOUR_PROJECT_ID with your actual project ID from Infura
  },
});

const Patient = (props) => {
  const { state } = useContext(AppContext);
  console.log(state);
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [filehash, setFilehash] = useState("");
  const [contract, setContract] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [visibility, setVisibility] = useState("hidden");

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
      const fetchDoctors = async () => {
        try {
          const response = await fetch("http://localhost:3000/doctors");
          if (response.ok) {
            const data = await response.json();
            const uniqueDoctors = data.filter(
              (doctor, index, self) =>
                index === self.findIndex((t) => t.address === doctor.address)
            );
            setDoctors(uniqueDoctors);
          } else {
            console.error("Failed to fetch doctors");
          }
        } catch (error) {
          console.error("Error fetching doctors", error);
        }
      };

      fetchDoctors();
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      console.log("Network ID:", networkId);
      const networkData = File.networks[networkId];
      console.log("Network Data:", networkData);

      if (networkData) {
        const contractInstance = new web3.eth.Contract(
          File.abi,
          networkData.address
        );
        setContract(contractInstance);
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    };

    loadWeb3().then(() => {
      loadBlockchainData();
      loadDoctors();
    });
  }, []);

  const captureFile = (event) => {
    event.preventDefault();
    setVisibility("hidden");
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.onloadend = () => {
      const fileData = new Blob([reader.result]);
      setBuffer(fileData);
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setVisibility("visible");

    try {
      const fileData = await readFileData(buffer);
      const { cid } = await ipfs.add(fileData);
      console.log("IPFS result", cid.toString());
      setVisibility("hidden");
      setFilehash(cid.toString());
      state.hash = cid.toString();
      await contract.methods.set(cid.toString()).send({ from: account });
      console.log("File hash stored in the contract");
    } catch (error) {
      console.error("IPFS error:", error);
    }
  };

  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  // Assuming you have initialized web3 and contractInstance

  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const grantAccess = async (doctorAddress) => {
    if (contract) {
      try {
        await contract.methods
          .grantAccess(doctorAddress)
          .send({ from: account });
        console.log("Access granted successfully.");
        await contract.events.AccessGranted((error, event) => {
          if (error) {
            console.error("Error granting access:", error);
          } else {
            console.log("Access granted for", event.returnValues[0]);
            alert("Access granted for " + event.returnValues[0]);
          }
        });
      } catch (error) {
        console.error("Error granting access:", error);
      }
    }
  };

  const revokeAccess = async (doctorAddress) => {
    if (contract) {
      try {
        await contract.methods
          .revokeAccess(doctorAddress)
          .send({ from: account });
        console.log("Access revoked successfully.");
        await contract.events.AccessRevoked((error, event) => {
          if (error) {
            console.error("Error revoking access:", error);
          } else {
            console.log("Access revoked for", event.returnValues[0]);
            alert("Access revoked for " + event.returnValues[0]);
          }
        });
      } catch (error) {
        console.error("Error revoking access:", error);
      }
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <button
          style={{
            backgroundColor: "transparent",
            borderRadius: "0.5rem",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "1.5rem",
            position: "absolute",
            top: "0",
            left: "0",
            margin: "1rem",
            hover: "pointer",
          }}
          onClick={goBack}
        >
          back
        </button>
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          rel="noopener noreferrer"
        >
          <p id="heading">Electronic Health Record System</p>
        </a>
      </nav>

      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <br />
              <br />
              <p>&nbsp;</p>
              <h2>Electronic Health Record</h2>
              <br />
              <h3 className="ur">Welcome Patient {state.patient}</h3>
              <br />
              <br />

              <form onSubmit={onSubmit}>
                <input type="file" name="btnSubmit" onChange={captureFile} />
                <br />
                <br />
                <br />
                <input
                  type="submit"
                  id="finalbtn"
                  className="btnSubmit"
                  onClick={LoginForm.continue}
                />
                <br />
                <br />
                <div id="afterSub" style={{ visibility: visibility }}>
                  Submitting to IPFS....Please Wait For A While
                </div>
              </form>
              <h3>Doctors:</h3>
              <div className="card-container">
                {doctors.map((doctor, index) => (
                  <div key={index} className="card">
                    <div className="card-header">{doctor.name}</div>
                    <div className="card-body">
                      <button
                        onClick={() => revokeAccess(doctor.address)}
                        className="btn btn-primary"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => grantAccess(doctor.address)}
                        className="btn btn-primary"
                      >
                        Grant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Patient;
