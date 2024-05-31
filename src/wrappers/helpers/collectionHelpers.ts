import { Address, DictionaryValue, beginCell } from "ton-core"

export type RoyaltyParams = {
    royaltyFactor: number,
    royaltyBase: number,
    royaltyAddress: Address
}

export type CollectionMint = {
    amount: bigint,
    index: number,
    ownerAddress: Address,
    content: string
}

export const MintValue: DictionaryValue<CollectionMint> = {
    serialize(src, builder) {
        const nftContent = beginCell()
            .storeBuffer(Buffer.from(src.content))
        // .endCell();

        const nftMessage = beginCell()
            .storeAddress(src.ownerAddress)
            .storeRef(nftContent)
        // .endCell();

        builder.storeCoins(src.amount);
        builder.storeRef(nftMessage);
    },
    parse() {
        return {
            amount: 0n,
            index: 0,
            ownerAddress: new Address(0, Buffer.from([])),
            content: ''
        }
    }
}