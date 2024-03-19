import { reactive, readonly } from "vue";
import { getClient } from "../service/endpoint.service";
import { MainContract } from "../contracts/MainContract";
import { Address, OpenedContract, fromNano } from "ton-core";
import "dotenv/config";

const state = reactive({
    balance: 0,
    data: {}
});
const methods = {
    async initContractState() {
        const client = await getClient();

        if(client !== undefined) {
            const contract = new MainContract(Address.parse(import.meta.env.DAPP_MAIN_CONTRACT_ADDRESS));
            const mainContract = client.open(contract) as OpenedContract<MainContract>;
            let { balance } = await mainContract.getBalance();
            state.balance = +fromNano(balance);

            let contractData = await mainContract.getData();
            state.data = contractData;

            return "Contract state updated!";
        }
    }
};
const getters = {
    getBalance() {
        return state.balance;
    },
    getData() {
        return state.data;
    }
};

export default {
    state: readonly(state),
    methods,
    getters,
};