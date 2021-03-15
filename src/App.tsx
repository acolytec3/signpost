import React from "react";
import {
  ChakraProvider,
  Button,
  Center,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Ipfs from "ipfs";
import FileUploader from "./components/fileUpload";
import GlobalContext, { initialState, reducer } from "./contextx/globalContext";
import { ethers } from "ethers";
import Onboard from "bnc-onboard";

let web3: any;

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const toast = useToast();

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
    networkId: 42,
    subscriptions: {
      wallet: (wallet) => {
        try {
          //@ts-ignore
          window.ethereum.enable();
          web3 = new ethers.providers.Web3Provider(wallet.provider);
          dispatch({ type: "SET_WEB3", payload: { web3: web3 } });
        } catch (err) {
          console.log(err);
          toast({
            position: "top",
            status: "error",
            title: "Something went wrong",
            description: err.toString(),
            duration: 5000,
          });
        }
      },
    },
  });

  const handleConnect = async () => {
    try {
      const walletSelected = await onboard.walletSelect();
    } catch (err) {
      console.log(err);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: err.toString(),
        duration: 5000,
      });
    }
    //    const read = await onboard.walletCheck()
    //    console.log(read);
  };
  return (
    <ChakraProvider>
      <GlobalContext.Provider value={{ dispatch, state }}>
        <Center h="90vh">
          <VStack>
            <Button onClick={handleConnect}>Connect Web3</Button>
            <FileUploader />
          </VStack>
        </Center>
      </GlobalContext.Provider>
    </ChakraProvider>
  );
}

export default App;
