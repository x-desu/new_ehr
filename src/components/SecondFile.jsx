import React, { useState, useEffect } from "react";
import "../App.css";
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

const SecondFile = (props) => {
  console.log("patient", props.values.state);
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [filehash, setFilehash] = useState("");
  const [contract, setContract] = useState(null);
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
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
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
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    };

    loadWeb3().then(() => {
      loadBlockchainData();
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
      props.values.state.hash = cid.toString();
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

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
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
              <h3 className="ur">
                Welcome Patient {props.values.state.patient}
              </h3>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SecondFile;