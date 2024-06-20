import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mantaTestnet: {
      url: "https://pacific-rpc.sepolia-testnet.manta.network/http",
      chainId: 3441006,
      accounts
    },
    mantaMainnet: {
      url: "https://pacific-rpc.manta.network/http",
      chainId: 169,
      accounts
    }
  }
};

export default config;
