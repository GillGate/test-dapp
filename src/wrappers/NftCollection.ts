import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from '@ton/core';
import { CollectionMint, MintValue, RoyaltyParams } from './helpers/collectionHelpers';

export type NftCollectionConfig = {
    ownerAddress: Address,
    nextItemIndex: number,
    collectionContent: Cell,
    nftItemCode: Cell,
    royaltyParams: RoyaltyParams
};

export function NftCollectionConfigToCell(config: NftCollectionConfig): Cell {
    return beginCell()
        .storeAddress(config.ownerAddress)
        .storeUint(config.nextItemIndex, 64)
        .storeRef(config.collectionContent)
        .storeRef(config.nftItemCode)
        .storeRef(
            beginCell()
                .storeUint(config.royaltyParams.royaltyFactor, 16)
                .storeUint(config.royaltyParams.royaltyBase, 16)
                .storeAddress(config.royaltyParams.royaltyAddress)
            .endCell()
        )
    .endCell();
}

export class NftCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftCollection(address);
    }

    static createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
        const data = NftCollectionConfigToCell(config);
        const init = { code, data };
        return new NftCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMintNft(provider: ContractProvider, via: Sender, 
        options: {
            value: bigint,
            queryId: number,
            itemIndex: number,
            itemOwnerAddress: Address,
            itemContent: string,
            amount: bigint
        }
    ) {
        const nftContent = beginCell()
            .storeBuffer(Buffer.from(options.itemContent))
        // .endCell();

        const nftMessage = beginCell()
            .storeAddress(options.itemOwnerAddress)
            .storeRef(nftContent)
        // .endCell();

        await provider.internal(via, {
            value: options.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(options.queryId, 64)
                .storeUint(options.itemIndex, 64)
                .storeCoins(options.amount)
                .storeRef(nftMessage)
            .endCell()
        })
    }

    async sendBatchMint(provider: ContractProvider, via: Sender, 
        options: {
            value: bigint,
            queryId: number,
            nfts: CollectionMint[]
        }    
    ) {
        if(options.nfts.length > 250) {
            throw new Error("More than 250 NFT's at once!");
        }

        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintValue);
        for(const nft of options.nfts) {
            dict.set(nft.index, nft)
        }

        await provider.internal(via, {
            value: options.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32)
                .storeUint(options.queryId, 64)
                .storeDict(dict)
            .endCell()
        })
    }
}