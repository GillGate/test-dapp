import "dotenv/config";
import {
    Address,
    beginCell,
    toNano,
} from "@ton/core";
import { getClient } from "./endpoint.service";
import { WalletContractV3R2 } from "@ton/ton";
import { mnemonicToWalletKey, sign } from "@ton/crypto";

export async function sendWithdrawMessage(userAddress: string, userCoins: number) {
    try {
        const WALLET_OWNER_SEED = import.meta.env.DAPP_WALLET_OWNER_SEED || process.env.DAPP_WALLET_OWNER_SEED || "";
        const SMC_ADDRESS = import.meta.env.DAPP_MAIN_BALANCE_ADDRESS || process.env.DAPP_MAIN_BALANCE_ADDRESS || "";

        console.log("call withdraw to", userAddress, userCoins);

        const keyPair = await mnemonicToWalletKey(WALLET_OWNER_SEED.split(" "));

        const wallet = WalletContractV3R2.create({
            workchain: 0,
            publicKey: keyPair.publicKey,
        });

        const client = await getClient();
        const provider = client!.open(wallet);
        let wSeqno = await provider.getSeqno();
        console.log("wSeqno", wSeqno);

        let smcAddress = Address.parse(SMC_ADDRESS);
        let destinationAddress = Address.parse(userAddress);
            
        let internalMessage = beginCell()
            .storeUint(0, 1) // indicate that it is an internal message -> int_msg_info$0
            .storeBit(1) // IHR Disabled
            .storeBit(1) // bounce
            .storeBit(0) // bounced
            .storeUint(0, 2) // src -> addr_none
            .storeAddress(smcAddress)
            .storeCoins(toNano("0.005")) // amount
            .storeBit(0) // Extra currency
            .storeCoins(0) // IHR Fee
            .storeCoins(0) // Forwarding Fee
            .storeUint(0, 64) // Logical time of creation
            .storeUint(0, 32) // UNIX time of creation
            .storeBit(0) // No State Init
            .storeBit(0) // We store Message Body as a slice
            .storeUint(5, 32) // OP code: Withdraw
            .storeAddress(destinationAddress)
            .storeCoins(toNano(userCoins))
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

        return await client!.sendMessage(externalMessage.toBoc());
    } 
    catch (e) {
        console.log(e);
    }
}

// (async () => await sendWithdrawMessage())();