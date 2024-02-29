import { useEffect, useState } from "react";
import { useSigner, useAddress } from "@thirdweb-dev/react";
import { Contract } from "@ethersproject/contracts";
import { message, Typography, Switch, Card } from "antd";
import "./App.css";

const contractAddress = "0x2239CaF0A0d35c83dE8eF2b28879DC20F7047ef7";

const contractABI = [
  "event PinStatusChanged(uint8 pin, uint8 status)",
  "function pinStatus(uint8) view returns (uint8)",
  "function owner() view returns (address)",
  "function setPinStatus(uint8 _pin, uint8 _pinStatus)",
  "function transferOwnership(address _newOwner)"
];

const contract = new Contract(contractAddress, contractABI);

const supportedPins = [
  14, 15, 18, 23, 24, 25, 8, 7, 12, 16, 20, 21, 2, 3, 4, 17, 27, 22, 10, 9, 11,
  5, 6, 13, 19, 26
];

function App() {
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOwner, setCurrentOwner] = useState("");
  const [pinStates, setPinStates] = useState({});

  const account = useAddress();
  const signer = useSigner();

  const handleSetPinStatus = async (pin, status) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    try {
      setLoading({ [pin]: true });
      message.info("Sending pin status change transaction...");
      // +status converts boolean to number (0 or 1) since contract accepts (0 or 1) as status
      const tx = await contract.connect(signer).setPinStatus(pin, +status);
      message.info(
        "Pin status change transaction sent. Waiting for confirmation..."
      );
      await tx.wait();
      message.success(`Pin ${pin} is now turned ${status ? "on" : "off"}`);
      setPinStates({ ...pinStates, [pin]: status });
    } catch (err) {
      console.log("err setting pin status", err);
      message.error("Failed to set pin status");
      setPinStates({ ...pinStates, [pin]: !status });
    } finally {
      setLoading({ [pin]: false });
    }
  };

  const handleTransferOwnership = async (newOwner) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    try {
      setLoading({ transferOwnership: true });
      const tx = await contract.connect(signer).transferOwnership(newOwner);
      await tx.wait();
      setLogMessage(`Ownership transferred to ${newOwner}`);
    } catch (err) {
      console.log("err transferring ownership", err);
      message.error("Failed to transfer ownership");
    } finally {
      setLoading({ transferOwnership: false });
    }
  };

  const getCurrentOwner = async () => {
    if (!signer) return;
    try {
      const owner = await contract.connect(signer).owner();
      setCurrentOwner(owner);
    } catch (err) {
      console.log("err getting current owner", err);
    }
  };

  const getPinStates = async () => {
    if (!signer) return;
    message.info("Getting pin states from chain...");
    try {
      // should use promise all here without await
      const pinStates = {};
      for (let pin of supportedPins) {
        const status = await contract.connect(signer).pinStatus(pin);
        pinStates[pin] = status;
      }
      setPinStates(pinStates);
      console.log("pinStates", pinStates);
    } catch (err) {
      message.error("Failed to get some pin states");
      console.log("err getting pin states", err);
    }
  };

  useEffect(() => {
    getCurrentOwner();
    getPinStates();
  }, [signer]);

  return (
    <div className="App">
      <h1>
        Welcome to{" "}
        <p
          style={{
            color: "blue",
            display: "inline",
            fontWeight: "bold",
            fontSize: "1.5em"
          }}
        >
          DePIN Raspi Connect
        </p>
      </h1>
      <h2>
        Decentralized Smart Home IoT platform that allows you to control
        Raspberry PI GPIO pins using blockchain
      </h2>
      {account ? (
        <Card
          bordered
          extra={
            <Typography.Text strong>
              Owner:{" "}
              {currentOwner?.slice(0, 6) + "..." + currentOwner?.slice(-4)}
            </Typography.Text>
          }
        >
          {supportedPins.map((pin, index) => (
            <div key={index}>
              <Switch
                loading={loading[pin] || false}
                checkedChildren="On"
                unCheckedChildren="Off"
                checked={pinStates[pin] || false}
                onChange={(checked) => handleSetPinStatus(pin, checked)}
              />
              <Typography.Text strong>{pin}</Typography.Text>
            </div>
          ))}
        </Card>
      ) : (
        <h2>Please connect your wallet to get started!</h2>
      )}
    </div>
  );
}

export default App;