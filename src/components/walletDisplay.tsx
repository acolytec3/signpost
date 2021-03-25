import React from "react";
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import GlobalContext from "../context/globalContext";
import { formatAddress, formatBalance } from "../helpers/helpers";

type WalletProps = {
  handleConnect: () => void;
};

const WalletDisplay: React.FC<WalletProps> = ({ handleConnect }) => {
  const { state, dispatch } = React.useContext(GlobalContext);

  const handleClick = () => {
    if (state.onboard) {
      state.onboard.walletReset();
      dispatch({ type: "SET_ADDRESS", payload: { address: undefined } });
      dispatch({ type: "SET_BALANCE", payload: { balance: "0" } });
      dispatch({ type: "SET_WEB3", payload: { web3: undefined } });
      dispatch({ type: "SET_CHAIN", payload: { chain: undefined}})
    }
  };

  return (
    <Box>
      {state.address ? (
        <Popover placement="top">
          <PopoverTrigger>
            <Button w="250px">
              {formatAddress(state.address)} {formatBalance(state.balance)} ETH
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              <Heading size="sm">Wallet Details</Heading>
            </PopoverHeader>
            <PopoverBody>
              <VStack>
                <Text>
                  {formatAddress(state.address)} {formatBalance(state.balance)}{" "}
                  ETH
                </Text>
                <Button onClick={handleClick}>Disconnect Wallet</Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <Button w="200px" onClick={handleConnect}>
          Connect Web3
        </Button>
      )}
    </Box>
  );
};

export default WalletDisplay;
