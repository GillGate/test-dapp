import { Address, toNano, beginCell } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection.ts';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const collectionContent = beginCell()
        // .storeStringTail(`0x01${import.meta.env.DAPP_COLLECTION_DATA}`)
        .storeBuffer(Buffer.from(`0x01${import.meta.env.DAPP_COLLECTION_DATA}`))
    .endCell()

    const nftCollection = provider.open(NftCollection.createFromConfig({
        ownerAddress: provider.sender().address as Address,
        nextItemIndex: 0,
        collectionContent,
        nftItemCode: await compile('NftItem'),
        royaltyParams: {
            royaltyFactor: 15,
            royaltyBase: 100,
            royaltyAddress: provider.sender().address as Address
        }
    }, await compile('NftCollection')));

    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftCollection.address);

    // run methods on `main`
}
