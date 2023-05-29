import React, { useState, useEffect } from "react";
import "../App.css";
import Web3 from "web3";
import File from "../../build/contracts/File.json";
import "../loginStyles.css";
import { create } from "ipfs-http-client";
import SecondFile from "./SecondFile";
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const Middle = (props) => {
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [filehash, setFilehash] = useState("");
  const [contract, setContract] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

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
      const doctorName = props.values.state.doctor;

      // Load existing doctors from local storage or initialize an empty array
      const existingDoctors = JSON.parse(localStorage.getItem("doctors")) || [];

      // Check if the doctor's address already exists in the array
      const isDoctorExists = existingDoctors.some(
        (doctor) => doctor.address === doctorAddress
      );

      if (!isDoctorExists) {
        // Create a new doctor object with address and name
        const newDoctor = {
          address: doctorAddress,
          name: doctorName,
        };

        // Add the new doctor to the existing array
        const updatedDoctors = [...existingDoctors, newDoctor];

        // Save the updated array to local storage
        localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
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
        const filehash = await contractInstance.methods.get().call();
        setFilehash(filehash);

        const storedDoctors = JSON.parse(localStorage.getItem("doctors")) || [];
        const currentDoctor = storedDoctors.find(
          (doctor) => doctor.address === doctorAddress
        );
        if (currentDoctor && currentDoctor.address === doctorAddress) {
          setHasAccess(currentDoctor.hasAccess);
        }
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    };

    loadWeb3().then(() => {
      loadBlockchainData();
    });
  }, []);

  console.log("filehash access", filehash, hasAccess);

  const docclick = () => {
    if (hasAccess) {
      window.open(`https://ipds.infura-ipfs.io/ipfs/${filehash}`, "_blank");
    } else {
      alert("You do not have access to view the records.");
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
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
              <h2 className="ur">Welcome Dr. {props.values.state.doctor}</h2>
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

export default Middle;
