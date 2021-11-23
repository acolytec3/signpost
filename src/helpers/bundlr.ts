import { ethers, BigNumber } from 'ethers'
import axios from 'axios'
import { createData, InjectedEthereumSigner } from 'arbundles';

export const getPrice = async (bytesSize: number): Promise<BigNumber> => {
    const priceResponse = await (
        await fetch(`https://node1.bundlr.network/price/matic/${bytesSize}`)
    ).json();
    return BigNumber.from(priceResponse)
}

export const getBundlrBalance = async (address: string): Promise<BigNumber> => {
    const balanceResponse = await (await fetch(`https://node1.bundlr.network/account/balance/matic?address=${address}`)).json();
    return BigNumber.from(balanceResponse.balance)
}

export const createTx = async (to: string, amount: BigNumber, provider: ethers.providers.Web3Provider): Promise<ethers.providers.TransactionRequest> => {
    const estimatedGas = await provider.estimateGas({ to, value: amount.toHexString() })
    const gasPrice = await provider.getGasPrice();
    const signer = await provider.getSigner();
    const tx = signer.populateTransaction({ to, value: amount.toHexString(), gasPrice, gasLimit: estimatedGas })
    return tx;
}

export const fundMatic = async (amount: BigNumber, provider: ethers.providers.Web3Provider): Promise<number> => {
    const bundlrAddress = await (
        await fetch("https://node1.bundlr.network/info")
    ).json();
    const tx = await createTx(
        bundlrAddress.addresses.matic,
        amount,
        provider
    );
    const signer = await provider.getSigner();
    const txResp = await signer!.sendTransaction(tx);
    await txResp.wait();
    const res = await axios.post(
        "https://node1.bundlr.network/account/balance/matic",
        {
            tx_id: txResp.hash,
        }
    );
    return res.status;
};

export const uploadItem = async (data: Buffer, provider: ethers.providers.Web3Provider): Promise<any> => {
    const signer = new InjectedEthereumSigner(provider);
    await signer.setPublicKey();
    const item = createData('data', signer);
    await item.sign(signer);
    const res = await axios.post('https://dev1.bundlr.network/tx/matic', item.getRaw(), {
        headers: { "Content-Type": "application/octet-stream", 'Access-Control-Allow-Origin': '*', },
        timeout: 100000,
        maxBodyLength: Infinity,
        validateStatus: (status) => (status > 200 && status < 300) || status !== 402
    })
    if (res.status === 402) {
        throw new Error("not enough funds to send data")
    }
    return res
}