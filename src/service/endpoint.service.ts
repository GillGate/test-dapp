import { getHttpV4Endpoint, getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient4, TonClient } from "@ton/ton";

type TonClients = {
    client: TonClient,
    client4: TonClient4
}

export const getClient = async (): Promise<TonClients | undefined> => {
    try {
        const endpoint1 = await getHttpEndpoint({
            network: "testnet",
        });
        const endpoint2 = await getHttpV4Endpoint({
            network: "testnet",
        });

        return {
            client: new TonClient({ endpoint: endpoint1 }),
            client4: new TonClient4({ endpoint: endpoint2 }),
        };
    } catch (e) {
        console.error(e);
    }
};
