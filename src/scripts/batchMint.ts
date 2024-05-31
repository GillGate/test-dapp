import { Address, toNano, ContractProvider } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('NFT Collection address'));

    // if (!(await provider.isContractDeployed(address))) {
    //     ui.write(`Error: Contract at address ${address} is not deployed!`);
    //     return;
    // }

    const nftCollection = provider.open(NftCollection.createFromAddress(address));

    await nftCollection.sendBatchMint(provider.sender(), {
        value: toNano('0.05'),
        queryId: Date.now(),
        nfts: [
            {
                amount: toNano('0.02'),
                index: 1,
                ownerAddress: randomAddress(),
                content: '456'
            },
            {
                amount: toNano('0.02'),
                index: 2,
                ownerAddress: randomAddress(),
                content: '789'
            }
        ]
    });

    // to figure out why contract doesn't burn

    ui.write(`Batch of NFT's deployed successfully!`);
}