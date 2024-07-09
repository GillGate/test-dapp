import {
    Address,
    beginCell,
    Cell,
    external,
    internal,
    storeMessage,
    toNano,
    TupleItemCell,
    TupleItemInt,
    TupleItemSlice,
} from "@ton/core";
import { getClient } from "./endpoint.service";
import { connector } from "./connector.service";
import { WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { delay } from "../utils/delay";

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

export async function EditNftEditable() {
    const nftAddress = "EQBEUJRKBpr3vCWWcCTkfxxUpiDIfYOc4ZOaZ_itikoDyq89";

    let nftContent = "";

    let address: Address;
    try {
        address = Address.parse(nftAddress);
    } catch (e) {
        return;
    }

    const client4 = await getClient();
    let latestBlock = await client4.getLastBlock();
    let lastSeqno = latestBlock.last.seqno;
    const { result: contentInfo } = await client4.runMethod(lastSeqno, address, "get_nft_data");
    console.log(contentInfo);

    const [, , , , sliceNftContent] = contentInfo as [
        TupleItemInt,
        TupleItemInt,
        TupleItemInt,
        TupleItemCell, // cell
        TupleItemSlice // slice
    ];

    const content = flattenSnakeCell(sliceNftContent.cell).toString("utf-8");

    nftContent = content;
    console.log("loaded nft content", content);

    nftContent = "2.json";
    console.log("current nft content", nftContent);

    let editContent = CreateEditableNftEditBody(nftContent);

    const editContentString = editContent.toBoc().toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
    console.log("editContent", editContentString);

    /*connector.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
            {
                address: nftAddress,
                amount: `${toNano(0.01)}`,
                payload: editContentString
            },
        ]
    });
    */

    latestBlock = await client4.getLastBlock();
    lastSeqno = latestBlock.last.seqno;

    const keyPair = await mnemonicToWalletKey(import.meta.env.DAPP_WALLET_OWNER_SEED.split(" "));

    console.log("keyPair", keyPair);

    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    console.log("wallet", wallet);

    const transfer = wallet.createTransfer({
        seqno: lastSeqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: address,
                value: `${toNano(0.01)}`,
                body: editContentString,
            })
        ]
    });

    console.log("transfer", transfer);

    const msg = beginCell()
        .store(
            storeMessage(
                external({
                    to: wallet.address,
                    body: transfer,
                })
            )
        )
        .endCell();

    console.log("msg", msg);

    let k = 0;
    async function updateNft() {
        while (k < 100) {
            try {
                const res = await client4.sendMessage(msg.toBoc());
                console.log("send msg res", res);
                k = 100;
                return res;
            } catch (e) {
                console.log(`attempt ${k}`);
                k++;

                console.log("ton api error", e);

                let res = await updateNft();
                if (!!res) {
                    k = 100;
                    break;
                }
                await delay(5100);

                if (e.status === 429) {
                    delay(200);
                } else {
                    console.log("ton api error", e);
                    k = 100;
                    break;
                }
            }
        }
    }

    await updateNft();
}
