import { reactive, readonly } from "vue";
import { getClient } from "../service/endpoint.service";
import { MainContract, MainContractConfig } from "../wrappers/MainContract";
import { Address, OpenedContract, fromNano, toNano } from "@ton/core";
import { sender } from "../service/connector.service";

const state = reactive({
    balance: 0,
    data: {} as MainContractConfig,
    contract: {} as OpenedContract<MainContract>,
    senderWallet: null as string | null
});
const methods = {
    async initializeContract(client: any) {
        const contract = new MainContract(Address.parse(import.meta.env.DAPP_MAIN_CONTRACT_ADDRESS));
        state.contract = client.open(contract);
    },
    async initContractState():Promise<any> {
        let client;
        let connectionAttempts = 0;
    
        try {
            client = await getClient();
        }
        catch(e) {
            if(connectionAttempts < 30) {
                setTimeout(this.initContractState, 500);
                console.log("Connection attempt:", connectionAttempts)
                connectionAttempts++;
            }
        }

        if(client !== undefined) {
            this.initializeContract(client);

            let { balance } = await state.contract.getBalance();
            state.balance = +fromNano(balance);

            state.data = await state.contract.getData();

            return "Contract state updated!";
        }
    },
    sendIncrement(incrementBy = 1) {
        state.contract.sendIncrement(sender, toNano('0.01'), incrementBy);
    },
    sendDeposit(amount = 0.5) {
        state.contract.sendDeposit(sender, toNano(`${amount}`));
    },
    withdrawFunds() {
        state.contract.sendWithdrawalRequest(sender, toNano(`0.025`), toNano(`${state.balance / 2}`))
    },
    setSenderWallet(walletAddress: string) {
        state.senderWallet = walletAddress;
    }
};
const getters = {
    getBalance() {
        return state.balance;
    },
    getData() {
        return state.data;
    },
    getSenderWallet() {
        return state.senderWallet;
    }
};

export default {
    state: readonly(state),
    methods,
    getters,
};