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
  Text,
  Link,
  Heading,
  Fade,
  SlideFade,
} from "@chakra-ui/react";
import Ipfs from "ipfs";
import FileUploader from "./components/fileUpload";
import GlobalContext, { initialState, reducer } from "./context/globalContext";
import { ethers } from "ethers";
import Onboard from "bnc-onboard";
import WalletDisplay from "./components/walletDisplay";
import GithubCorner from "react-github-corner";
import { GLOBALS } from "./helpers/globals";
let web3: ethers.providers.Web3Provider;

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const toast = useToast();

  const startUp = async () => {
    try {
      //@ts-ignore
      let ipfs = await Ipfs.create({
        relay: { enabled: true, hop: { enabled: true, active: true } },

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
    { walletName: "trust", preferred: true },
    { walletName: "torus" },
    { walletName: "opera" },
    { walletName: "operaTouch" },
  ];
  const onboard = Onboard({
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
            description: err?.toString(),
            duration: 5000,
          });
        }
      },
      address: (address) => {
        dispatch({ type: "SET_ADDRESS", payload: { address: address } });
      },
      balance: (balance) => {
        dispatch({ type: "SET_BALANCE", payload: { balance: balance } });
      },
      network: (network) => {
        dispatch({ type: "SET_CHAIN", payload: { chain: network } });
      },
    },
    walletSelect: {
      wallets: wallets,
    },
  });

  const handleConnect = async () => {
    dispatch({ type: "SET_ONBOARD", payload: { onboard: onboard } });
    try {
      const walletSelected = await onboard.walletSelect();
    } catch (err) {
      console.log(err);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: err?.toString(),
        duration: 5000,
      });
    }
  };
  return (
    <ChakraProvider>
      <GlobalContext.Provider value={{ dispatch, state }}>
        <GithubCorner
          href="https://github.com/acolytec3/signpost"
          bannerColor="#000"
          octoColor="#fff"
          size={80}
          direction="left"
        />
        <Center h="90vh">
          <VStack>
            <Heading>SignPost</Heading>
            <Text size="xs" mb="2em">Sign your NFT</Text>
            <WalletDisplay handleConnect={handleConnect} />
            <SlideFade in={state.web3 !== undefined}>
              <FileUploader />
            </SlideFade>
          </VStack>
        </Center>
        {!state.web3 && <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            <Text>
              Click{" "}
              <Link
                href="https://github.com/acolytec3/signpost/blob/master/README.md#usage"
                color="teal.500"
              >
                here
              </Link>{" "}
              for usage instructions
            </Text>
          </AlertDescription>
        </Alert>}
        {state.chain && Object.keys(GLOBALS.CHAINS).filter(
          (chainId) => chainId === state.chain.toString()
        ).length < 1 && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Unsupported network</AlertTitle>
            <AlertDescription>
              Please switch to a supported network before continuing.
            </AlertDescription>
          </Alert>
        )}
      </GlobalContext.Provider>
    </ChakraProvider>
  );
}

export default App;
