import { Address, toNano, ContractProvider } from 'ton-core';
import { NftItem } from '../wrappers/NftItem';
import { NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('NFT Item address'));

    // if (!(await provider.isContractDeployed(address))) {
    //     ui.write(`Error: Contract at address ${address} is not deployed!`);
    //     return;
    // }

    const nftItem = provider.open(NftItem.createFromAddress(address));

    await nftItem.sendTransfer(provider.sender(), {
        value: toNano('0.1'),
        fwdAmount: toNano('0.03'),
        queryId: Date.now(),
        newOwner: randomAddress(), 
        responseAddress: randomAddress(), 
    });

    // to figure out why contract doesn't burn

    ui.write(`NFT item transfered successfully!`);
}