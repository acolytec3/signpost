import { ethers, BigNumber } from 'ethers';

export const formatAddress = (address: string) => {
    return (
      address.substring(0, 4) + "..." + address.substring(address.length - 4)
    );
  };
  
 export  const formatBalance = (balance: string) => {
    if (BigNumber.from(balance).lt("1000000000000000")) return "<0.001";
    else return ethers.utils.formatEther(BigNumber.from(balance)).substring(0, 5);
  };