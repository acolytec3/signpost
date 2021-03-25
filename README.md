# SignPost

## Description

SignPost is a simple interface for autographing any picture or photo and then minting it as an ERC-721 compliant NFT on Ethereum.  App can be accessed at [https://signpost.vercel.app](https://signpost.vercel.app).

This app currently supports two testnets:
- the Charged Particles NFT contract on the Kovan testnet - [Etherscan link](https://kovan.etherscan.io/contract/0xD4F7389297d9cea850777EA6ccBD7Db5817a12b2)
- the Signpost V3 contract on the Rinkeby testnet - [Etherscan link](https://rinkeby.etherscan.io/contract/0x8D5A137F4973DB38317497F95540fa331D062638)

## Usage

### Single signature

- Connect to your preferred network (Kovan or Rinkeby)
- Select an image
- Autograph your image anywhere within the image itself
- Select "Autograph NFT" and then sign the message presented
- Select "Mint NFT" to mint on your preferred network

### Multiple signatures

#### First signature
- Connect to your preferred network (Kovan or Rinkeby)
- Select an image
- Autograph your image anywhere within the image itself
- Select "Autograph NFT" and then sign the message presented
- Copy the IPFS hash generated
- Send IPFS hash to next signer

#### Additional signatures
- Connect to prefered network
- Paste IPFS hash in text box
- Press "Load Autograph from IPFS"
- Autograph image
- Select "Autograph NFT" and then sign the message presented

#### Mint NFT (once all signatures are complete)
- Paste IPFS hash in text box
- Press "Load Autograph from IPFS"
- Select "Mint NFT" to mint on your preferred network

### Viewing your NFT
- Kovan 
    - Go to [Charged Particles](https://staging.charged.fi) and connect the wallet that minted the particle
    - View your NFT
- Rinkeby
    - Go to [Opensea](https://testnets.opensea.io) and connect the wallet that minted the particle
    - Go to your profile page and view your NFT

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
