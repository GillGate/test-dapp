import { Address, Cell, Contract, ContractProvider, SendMode, Sender, beginCell, contractAddress } from "@ton/core";

export type MainContractConfig = {
    counter_value: number,
    recent_sender: Address,
    owner_address: Address,
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
                .storeUint(config.counter_value, 32)
                .storeAddress(config.recent_sender)
                .storeAddress(config.owner_address)
            .endCell();
}

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new MainContract(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).endCell() // op code deposit to avoid throw(777)
        });
    }

    async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        incrementBy: number = 1
    ) {
        const msgBody = beginCell()
                            .storeUint(1, 32) // op code
                            .storeUint(incrementBy, 32)
                        .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msgBody,
        })
    } 

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msgBody = beginCell()
                            .storeUint(2, 32)
                        .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msgBody
        });
    }

    async sendNoCodeDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msgBody = beginCell().endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msgBody
        });
    }

    async sendWithdrawalRequest(
        provider: ContractProvider, 
        sender: Sender, 
        value: bigint, 
        amount: bigint
    ) {
        const msgBody = beginCell()
                            .storeUint(3, 32) // op code
                            .storeCoins(amount)
                        .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msgBody
        });
    }

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);

        return {
            counter_value: stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address: stack.readAddress(),
        };
    }

    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_balance", []);

        return {
            balance: stack.readNumber()
        }
    }
}