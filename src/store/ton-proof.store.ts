import { reactive, readonly } from "vue";
import { Account, ConnectAdditionalRequest, TonProofItemReplySuccess } from "@tonconnect/sdk";
import { connector } from "../service/connector.service";

const state = reactive({
    host: import.meta.env.DAPP_BACKEND_HOST,
    accessToken: null as null | string,
    intervalPeriod: 1000 * 60 * 10, // 10 min
    localStorageATKey: 'first-dapp-auth-token',
});
const methods = {
    async initBackendAuth() {
        await connector.connectionRestored;
        state.accessToken = localStorage.getItem(state.localStorageATKey);
        let interval:any;

        if(!state.accessToken && connector.wallet) {
            await connector.disconnect();
        }

        if(!connector.wallet) {
            state.accessToken = null;
            localStorage.removeItem(state.localStorageATKey);
            await this.refreshTonProofPayload();
            interval = setInterval(() => this.refreshTonProofPayload(), state.intervalPeriod)
        }

        connector.onStatusChange(async (wallet) => {
            clearInterval(interval);

            if(!wallet) {
                state.accessToken = null;
                localStorage.removeItem(state.localStorageATKey);
                await this.refreshTonProofPayload();
                interval = setInterval(() => this.refreshTonProofPayload(), state.intervalPeriod)
            }
            else {
                let tonProof = wallet.connectItems?.tonProof;
                if(tonProof && !('error' in tonProof)) {
                    this.checkProof(tonProof.proof, wallet.account)
                }
            }
        })
    },
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
                localStorage.setItem(state.localStorageATKey, res.token);
            }
        } catch(e) {
            console.error(e);
            return;
        }
    },
    async refreshTonProofPayload() {
        connector.setConnectRequestParameters({ state: 'loading' });

        const newPayload = await this.generatePayload();
        if(!newPayload) {
            connector.setConnectRequestParameters(null);
        }
        else {
            connector.setConnectRequestParameters({ state: 'ready', value: newPayload });
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