import React from "react";
import {
  ChakraProvider,
  Button,
  Center,
  VStack,
} from "@chakra-ui/react";
import Ipfs from "ipfs";
import FileUploader from "./components/fileUpload";
import GlobalContext, { initialState, reducer } from "./contextx/globalContext";
import { ethers } from "ethers";
import Onboard from "bnc-onboard";

let web3: any;

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const startUp = async () => {
    try {
      //@ts-ignore
      let ipfs = await Ipfs.create({
        relay: { enabled: true, hop: { enabled: true, active: true } },
        repo: "ipfs-cp",
      });
      dispatch({ type: "START_IPFS", payload: { ipfs: ipfs } });
    } catch (error) {
      console.error("IPFS init error:", error);
    }
  };

  React.useEffect(() => {
    startUp();
  }, []);

  const onboard = Onboard({
    dappId: "9df8e2ce-b55b-4d4c-a213-35c5294cba7f",
    networkId: 42,
    subscriptions: {
      wallet: (wallet) => {
        web3 = new ethers.providers.Web3Provider(wallet.provider);
        dispatch({ type: "SET_WEB3", payload: { web3: web3 } });
      },
    },
  });

  return (
    <ChakraProvider>
      <GlobalContext.Provider value={{ dispatch, state }}>
        <Center h="90vh">
          <VStack>
            <Button onClick={() => onboard.walletSelect()}>Connect Web3</Button>
            <FileUploader />
          </VStack>
        </Center>
      </GlobalContext.Provider>
    </ChakraProvider>
  );
}

export default App;
