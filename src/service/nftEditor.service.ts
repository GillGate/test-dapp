import "dotenv/config";
import {
    Address,
    beginCell,
    Cell,
    toNano,
    TupleItemCell,
    TupleItemInt,
    TupleItemSlice,
} from "@ton/core";
import { getClient } from "./endpoint.service";
import { TonClient4, WalletContractV3R2 } from "@ton/ton";
import { mnemonicToWalletKey, sign } from "@ton/crypto";

export function flattenSnakeCell(cell: Cell) {
    let c: Cell | null = cell;

    let res = Buffer.alloc(0);

    while (c) {
        const cs = c.beginParse();
        if (cs.remainingBits === 0) {
            return res;
        }
        if (cs.remainingBits % 8 !== 0) {
            throw Error("Number remaining of bits is not multiply of 8");
        }

        const data = cs.loadBuffer(cs.remainingBits / 8);
        res = Buffer.concat([res, data]);
        c = c.refs && c.refs[0];
    }

    return res;
}

function CreateEditableNftEditBody(itemContentUri: string, queryId?: number): Cell {
    const body = beginCell();
    body.storeUint(0x1a0b9d51, 32); // OP edit_content
    body.storeUint(queryId || 0, 64); // query_id

    const uriContent = beginCell();
    uriContent.storeBuffer(Buffer.from(serializeUri(itemContentUri)));
    body.storeRef(uriContent);

    return body.endCell();
}

function serializeUri(uri: string) {
    return new TextEncoder().encode(encodeURI(uri));
}

async function sendEditMessage(client: TonClient4, nftAddress: Address, editContent: Cell) {
    const WALLET_OWNER_SEED = import.meta.env.DAPP_WALLET_OWNER_SEED || process.env.DAPP_WALLET_OWNER_SEED || "";

    const keyPair = await mnemonicToWalletKey(WALLET_OWNER_SEED.split(" "));

    const wallet = WalletContractV3R2.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const provider = client.open(wallet);
    let wSeqno = await provider.getSeqno();
    console.log("wSeqno", wSeqno);
        
    let internalMessage = beginCell()
        .storeUint(0, 1) // indicate that it is an internal message -> int_msg_info$0
        .storeBit(1) // IHR Disabled
        .storeBit(1) // bounce
        .storeBit(0) // bounced
        .storeUint(0, 2) // src -> addr_none
        .storeAddress(nftAddress)
        .storeCoins(toNano("0.005")) // amount
        .storeBit(0) // Extra currency
        .storeCoins(0) // IHR Fee
        .storeCoins(0) // Forwarding Fee
        .storeUint(0, 64) // Logical time of creation
        .storeUint(0, 32) // UNIX time of creation
        .storeBit(0) // No State Init
        .storeBit(1) // We store Message Body as a reference
        .storeRef(editContent) // Store Message Body as a reference
        .endCell();

    let toSign = beginCell()
        .storeUint(698983191, 32) // subwallet_id | We consider this further
        .storeUint(Math.floor(Date.now() / 1e3) + 60, 32) // Transaction expiration time, +60 = 1 minute
        .storeUint(wSeqno, 32) // store seqno
        //.storeUint(0, 8) // for v4r2 Wallet
        .storeUint(3, 8) // store mode of our internal transaction
        .storeRef(internalMessage); // store our internalMessage as a reference

    let signature = sign(toSign.endCell().hash(), keyPair.secretKey); // get the hash of our message to wallet smart contract and sign it to get signature

    let body = beginCell()
        .storeBuffer(signature) // store signature
        .storeBuilder(toSign) // store our message
        .endCell();

    let externalMessage = beginCell()
        .storeUint(0b10, 2) // 0b10 -> 10 in binary
        .storeUint(0, 2) // src -> addr_none
        .storeAddress(wallet.address) // Destination address
        .storeCoins(0) // Import Fee
        .storeBit(0) // No State Init
        .storeBit(1) // We store Message Body as a reference
        .storeRef(body) // Store Message Body as a reference
        .endCell();

    return await client.sendMessage(externalMessage.toBoc());
}

export async function editNft(address:string) {
    let nftAddress: Address;
    try {
        nftAddress = Address.parse(address);
    } catch (e) {
        return;
    }

    const MAX_LVL = 7;

    const client = await getClient();
    let latestBlock = await client!.getLastBlock();
    let lastSeqno = latestBlock.last.seqno;
    const { result: contentInfo } = await client!.runMethod(lastSeqno, nftAddress, "get_nft_data");
    console.log(contentInfo);

    const [, , , , sliceNftContent] = contentInfo as [
        TupleItemInt,
        TupleItemInt,
        TupleItemInt,
        TupleItemCell, // cell
        TupleItemSlice // slice
    ];

    const content = flattenSnakeCell(sliceNftContent.cell).toString("utf-8");

    let nftContent = content;
    console.log("loaded nft content", content);

    let currentLvl = parseInt(content.split('-')[1]);

    if(currentLvl === MAX_LVL) {
        throw('This NFT has reached max level!');
    }

    nftContent = content.slice(0, -6) + `${++currentLvl}.json`;

    console.log("updated nft content", nftContent);

    let editContent = CreateEditableNftEditBody(nftContent);

    try {
        let res = await sendEditMessage(client!, nftAddress, editContent);
        console.log("sendEditMessage res", res);
    }
    catch(e) {
        console.log(e);
    }
}