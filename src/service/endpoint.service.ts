import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { TonClient4 } from '@ton/ton';

export const getClient = async () : Promise<TonClient4 | undefined> => {
    try {
        const endpoint = await getHttpV4Endpoint({
            network: "testnet",
        });

        return new TonClient4({ endpoint });
    }
    catch(e) {
        console.error(e);
    }
}