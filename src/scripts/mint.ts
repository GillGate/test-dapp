import { Address, toNano, ContractProvider } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('NFT Collection address'));

    // if (!(await provider.isContractDeployed(address))) {
    //     ui.write(`Error: Contract at address ${address} is not deployed!`);
    //     return;
    // }

    const nftCollection = provider.open(NftCollection.createFromAddress(address));

    await nftCollection.sendMintNft(provider.sender(), {
        value: toNano('0.02'),
        amount: toNano('0.02'),
        itemIndex: 1,
        itemOwnerAddress: provider.sender().address as Address,
        itemContent: JSON.stringify({
            name: "Test NFT",
        }),
        queryId: Date.now()
    });

    // to figure out why contract doesn't burn

    ui.write(`NFT item deployed successfully!`);
}