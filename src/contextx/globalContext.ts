
import { ethers } from 'ethers'
import React from 'react'

export type globalState = {
    ipfs: any,
    web3?: ethers.providers.Web3Provider,
  }
  
  export const initialState = {
    ipfs: null,
  }
  
  
  export const reducer = (state: globalState, action: any): globalState => {
     console.log(state)
     console.log(action)
    switch (action.type) {
      case 'START_IPFS': {
        return { ...state, ipfs: action.payload.ipfs }
      }
      case 'SET_WEB3': {
        return { ...state, web3: action.payload.web3}
      }
      default:
        return state;
    }
  }

  const GlobalContext = React.createContext<{state:globalState, dispatch: React.Dispatch<any>}>({state: initialState, dispatch: () => null})

  export { GlobalContext as default } 