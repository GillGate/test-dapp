import { useTonConnectUI } from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "ton-core";

export function useTonConnect(): { sender: Sender; connected: boolean } {
    const [tonConnectUI] = useTonConnectUI();

    return {
        sender: {
            send: async (args: SenderArguments) => {
                tonConnectUI.sendTransaction({
                    messages: [
                        {
                            address: args.to.toString(),
                            amount: args.value.toString(),
                            payload: args.body?.toBoc().toString("base64"),
                        }
                    ],
                    validUntil: Date.now() + 1000 * 5 * 60 // 5 min for user to approve
                })
            }
        },
        connected: tonConnectUI.connected
    }
}