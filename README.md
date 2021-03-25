# SignPost

## Description

SignPost is a simple interface for autographing any picture or photo and then minting it as an ERC-721 compliant NFT on Ethereum.  App can be accessed at [https://signpost.vercel.app](https://signpost.vercel.app).

This app currently supports two testnets:
- the Charged Particles NFT contract on the Kovan testnet - [Etherscan link](https://kovan.etherscan.io/contract/0xD4F7389297d9cea850777EA6ccBD7Db5817a12b2)
- the Signpost V3 contract on the Rinkeby testnet - [Etherscan link](https://rinkeby.etherscan.io/contract/0x8D5A137F4973DB38317497F95540fa331D062638)

Minting an Autographed NFT on Rinkeby on mobile
![Minting on rinkeby on Metamask Mobile](./rinkeby.gif)

Seeing the autographed NFT on the OpenSea marketplace
![Viewing NFT on opensea marketplace](./opensea.gif)

Minting an Autographed Charged Particle NFT on Kovan
![mint a charged particle on Kovan](./kovan.gif)
## Current Limitations due to Testnet deployment

- Only available on Kovan/Rinkeby
- Only supports following wallets
    - Desktop -Metamask and Torus
    - Mobile - Metamask Mobile, Opera Touch
- NFTs are only visible on OpenSea on Rinkeby 
- NFT metadata is currently stored on IPFS so not guaranteed to be preserved if additional pinning functionality is not built
