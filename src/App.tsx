import React from "react";
import {
  ChakraProvider,
  Center,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import Ipfs from "ipfs";
import FileUploader from "./components/fileUpload";
import GlobalContext, { initialState, reducer } from "./context/globalContext";
import { ethers } from "ethers";
import Onboard from "bnc-onboard";
import WalletDisplay from "./components/walletDisplay";

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

  const wallets = [
    { walletName: "metamask", preferred: true },
    { walletName: "authereum" },
    { walletName: "opera" },
    { walletName: "operaTouch" },
  ]
  const onboard = Onboard({
    dappId: '00a53f9e-0e52-4e15-8d56-76e47bea5c0c',
    networkId: state?.chain ? state.chain : 42,
    subscriptions: {
      wallet: (wallet) => {
        try {
          //@ts-ignore
          if (window.ethereum) {
            //@ts-ignore
            window.ethereum.enable();
          }
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
      address: (address) => {
        dispatch({ type: "SET_ADDRESS", payload: { address: address }});
      },
      balance: (balance) => {
        dispatch({ type: "SET_BALANCE", payload: { balance: balance }});
      },
      network: (network) => {
        dispatch({ type: "SET_CHAIN", payload: { chain: network}})
      }
    },
  });

  const handleConnect = async () => {
    dispatch({ type:"SET_ONBOARD", payload: { onboard: onboard }})
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
  };
  return (
    <ChakraProvider> 
      <GlobalContext.Provider value={{ dispatch, state }}>
        <Center h="90vh">
          <VStack>
            <WalletDisplay handleConnect={handleConnect} />
            <FileUploader />
          </VStack>
        </Center>
        {state.chain && state.chain !== 42 && state.chain !== 4 &&  (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>
                  Unsupported network
                </AlertTitle>
                <AlertDescription>
                  Please switch to Rinkeby or Kovan before continuing.
                </AlertDescription>
              </Alert>
            )}
      </GlobalContext.Provider>
    </ChakraProvider>
  );
}

export default App;
