import { Address, beginCell, toNano } from "@ton/core";
import { mnemonicToWalletKey, sign } from "@ton/crypto";
import { TonClient4, WalletContractV3R2 } from "@ton/ton";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";

export async function sendCancelOrder(address: string) {
    let orderAddress: Address;
    try {
        orderAddress = Address.parse(address);
    } catch (e) {
        return;
    }

    console.log("call cancel");

    const endpoint = await getHttpV4Endpoint({
        network: "testnet",
    });
    const client = new TonClient4({ endpoint })
    const WALLET_OWNER_SEED = import.meta.env.DAPP_ADMIN_WALLET_SEED;

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
        .storeAddress(orderAddress)
        .storeCoins(toNano(0.01)) // amount
        .storeBit(0) // Extra currency
        .storeCoins(0) // IHR Fee
        .storeCoins(0) // Forwarding Fee
        .storeUint(0, 64) // Logical time of creation
        .storeUint(0, 32) // UNIX time of creation
        .storeBit(0) // No State Init
        .storeBit(0) // We store Message Body as a slice
        .storeUint(1, 32) // op code
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

    // return await client.sendMessage(externalMessage.toBoc());
}