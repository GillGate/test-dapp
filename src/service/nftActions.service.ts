import { Address } from "@ton/core";

export async function getNfts() {
    const nftCollectionAddress = Address.parse(import.meta.env.DAPP_COLLECTION_ADDRESS);
    const baseURL = import.meta.env.DAPP_TONAPI_ENDPOINT;
    
    const res = await fetch(`${baseURL}/v2/nfts/collections/${nftCollectionAddress}/items`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${import.meta.env.DAPP_TC_API_KEY}`,
        }
    });

    const { nft_items } = await res.json();

    console.log("nft_items", nft_items);

    let filteredNfts = [];

    nft_items.forEach(nftItem => {
        filteredNfts.push({
            address: nftItem.address,
            index: nftItem.index,
            metadata: nftItem.metadata,
            ownerAddr: nftItem.owner.address
        });
    });

    console.log("filteredNfts", filteredNfts);

    return filteredNfts;
}

/**
 * await connector.connectionRestored;
 * const ownerAddr = connector.account?.address ?? '';
 */
export async function getNftsByOwner(ownerAddr: string) {
    return  (await getNfts()).filter(nftItem => nftItem.ownerAddr === ownerAddr);
}