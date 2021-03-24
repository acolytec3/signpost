
import { ethers } from 'ethers'
import { IPFS } from 'ipfs/src'
import React from 'react'

export type globalState = {
    ipfs?: IPFS,
    web3?: ethers.providers.Web3Provider,
    address?: string,
    balance: string,
    onboard?: any,
    chain?: number
  }
  
  export const initialState = {
    balance: '0',
    chain: 42
  }
  
  
  export const reducer = (state: globalState, action: any): globalState => {
    switch (action.type) {
      case 'START_IPFS': {
        return { ...state, ipfs: action.payload.ipfs };
      }
      case 'SET_WEB3': {
        return { ...state, web3: action.payload.web3 };
      }
      case 'SET_ADDRESS': {
        return { ...state, address: action.payload.address };
      }
      case 'SET_BALANCE': {
        return { ...state, balance: action.payload.balance };
      }
      case 'SET_ONBOARD': {
        return { ...state, onboard: action.payload.onboard };
      }
      case 'SET_CHAIN': {
        return { ...state, chain: action.payload.chain}
      }
      default:
        return state;
    }
  }

  const GlobalContext = React.createContext<{state:globalState, dispatch: React.Dispatch<any>}>({state: initialState, dispatch: () => null})

  export { GlobalContext as default } 