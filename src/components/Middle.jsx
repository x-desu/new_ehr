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

  const docclick = () => {
    window.open(
      "https://ipfs.infura.io/ipfs/QmUQJrygU9rh3AfvWzs61hLkeEkJtZHnyR8LMQVAjTTcF5",
      "_blank"
    );
  };

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  const onSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting file to ipfs...");
    ipfs.add(buffer, (error, result) => {
      console.log("Ipfs result", result);
      const filehash = result[0].hash;
      setFilehash(filehash);
      if (error) {
        console.error(error);
        return;
      }
      contract.methods
        .set(result[0].hash)
        .send({ from: account })
        .then((r) => {
          setFilehash(result[0].hash);
        });
    });
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
              <h2 className="ur">Welcome Dr. {props.doctor}</h2>
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
