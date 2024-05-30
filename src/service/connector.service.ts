import TonConnect from "@tonconnect/sdk";
import { SendTransactionRequest, TonConnectUI, UserRejectsError } from "@tonconnect/ui";
import { SenderArguments } from "@ton/core";

export const customConnector = new TonConnect({
    manifestUrl: import.meta.env.DAPP_MANIFEST_URL
});

// https://github.com/ton-connect/sdk/tree/main/packages/ui
export const connector = new TonConnectUI({
    manifestUrl: import.meta.env.DAPP_MANIFEST_URL,
});

export const sender = {
    send: async (args: SenderArguments) => {
        const tx: SendTransactionRequest = {
            validUntil: Date.now() + 1000 * 5 * 60, // 5 min
            messages: [
                {
                    address: args.to.toString(),
                    amount: args.value.toString(),
                    payload: args.body?.toBoc().toString("base64"),
                }
            ]
        };
    
        try {
            await connector.sendTransaction(tx);
        } catch(e) {
            if(e instanceof UserRejectsError) {
                alert("User declined request");
            }
    
            console.error(e);
        }
    }
}