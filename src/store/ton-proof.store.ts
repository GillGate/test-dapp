import { reactive, readonly } from "vue";
import { Account, ConnectAdditionalRequest, TonProofItemReplySuccess } from "@tonconnect/sdk";

const state = reactive({
    host: import.meta.env.DAPP_BACKEND_HOST,
    accessToken: null as null | string
});
const methods = {
    async generatePayload(): Promise<ConnectAdditionalRequest | undefined> {
        try {
            const res = await (
                await fetch(`${state.host}/ton-proof/generatePayload`, {
                    method: 'POST'
                })
            ).json();

            return {
                tonProof: res.payload
            }
        } catch(e) {
            console.error(e);
            return;
        }
    },
    async checkProof(proof: TonProofItemReplySuccess['proof'], account: Account) {
        try {
            const requestBody = {
                address: account.address,
                network: account.chain,
                proof: {
                    ...proof,
                    state_init: account.walletStateInit
                }
            }

            const res = await (
                await fetch(`${state.host}/ton-proof/checkProof`, {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                })
            ).json();

            if(res?.token) {
                state.accessToken = res.token;
            }
        } catch(e) {
            console.error(e);
            return;
        }
    },
    async getAccountInfo(account: Account):Promise<any> {
        const res = await (
            await fetch(`${state.host}/dapp/getAccountInfo?network=${account.chain}`, {
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
        ).json();

        return res;
    }
};
const getters = {
    getAccessToken() {
        return state.accessToken;
    }
};

export default {
    state: readonly(state),
    methods,
    getters,
};