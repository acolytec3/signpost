export const GLOBALS: { [key: string]: { [key: number] : { name: string, contractAddress: string}}}  = {
    CHAINS: {
        1: {
            name: 'mainnet',
            contractAddress: '0x63174FA9680C674a5580f7d747832B2a2133Ad8f'
        },
        4 : {
            name: 'rinkeby',
            contractAddress: '0x8D5A137F4973DB38317497F95540fa331D062638'
        },
        42: {
            name: 'kovan',
            contractAddress: '0xD4F7389297d9cea850777EA6ccBD7Db5817a12b2'
        }
    }
}