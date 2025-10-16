import {
  NetworkName,
  NETWORK_CONFIG as ALL_NETWORK_CONFIG,
} from "@railgun-community/shared-models";

/** our EVM network */
export const NETWORK = "Ethereum_Sepolia" as NetworkName;
if (!NETWORK) {
  throw new Error("NETWORK is not set");
}
if (!Object.values(NetworkName).includes(NETWORK)) {
  throw new Error(`NETWORK '${NETWORK}' is not valid`);
}

/** the network config for our EVM network */
export const NETWORK_CONFIG = ALL_NETWORK_CONFIG[NETWORK];

/** the RPC URL for our EVM network, should be over TOR */
export const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
if (!RPC_URL) {
  throw new Error("RPC_URL is not set");
}

export const PORT = process.env.PORT || 8080;
