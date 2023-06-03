import React, { useState, useEffect, useContext } from "react";
import "../App.css";
import Web3 from "web3";
import File from "../../build/contracts/File.json";
import "../loginStyles.css";
import { create } from "ipfs-http-client";
import Patient from "./Patient";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
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

const Doctor = (props) => {
  const { state } = useContext(AppContext);
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [filehash, setFilehash] = useState("");
  const [contract, setContract] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
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
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const doctorAddress = accounts[0];
      const doctorName = state.doctor;

      const fetchDoctors = async () => {
        try {
          // Fetch doctors from the server
          const response = await fetch("http://localhost:3000/doctors");
          const data = await response.json();
          const existingDoctor = data.find(
            (doctor) => doctor.address === doctorAddress
          );

          if (!existingDoctor) {
            // Doctor does not exist, make a POST request to add the doctor
            await fetch("http://localhost:3000/doctors", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: doctorName,
                address: doctorAddress,
              }),
            });
          }
        } catch (error) {
          console.error("Error fetching or storing doctors", error);
        }
      };

      if (doctorAddress && doctorName) {
        fetchDoctors();
      }

      setAccount(doctorAddress);
      const networkId = await web3.eth.net.getId();
      const networkData = File.networks[networkId];
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
    });
  }, []);

  console.log("filehash access", filehash, hasAccess);

  const docclick = async () => {
    if (contract) {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const doctorAddress = accounts[0];

      // Check if the doctor has grant/revoke permissions
      const hasAccess = await contract.methods.hasAccess(doctorAddress).call();

      if (hasAccess) {
        // Retrieve the file hash from the smart contract
        const filehash = await contract.methods.get().call();
        setFilehash(filehash);

        window.open(`https://ipds.infura-ipfs.io/ipfs/${filehash}`, "_blank");
      } else {
        alert("You do not have access to view the records.");
      }
    }
  };
  const back = () => {
    navigate("/");
  };

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <button
          onClick={() => back()}
          style={{
            backgroundColor: "transparent",
            border: "none",
            position: "absolute",
            top: "0",
            left: "0",
            margin: "20px",
            fontSize: "20px",
          }}
          className="navbar-toggler d-md-none collapsed"
        >
          Back
        </button>
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          rel="noopener noreferrer"
        >
          Electronic Health Record System
        </a>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <h2 className="ur">Welcome Dr. {state.doctor}</h2>
              <br />
              <br />
              <h3>View Patient's Records</h3>
              <br></br>
              <input
                type="submit"
                id="docbtn"
                className="btnSubmit"
                value="View Records"
                onClick={docclick}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
