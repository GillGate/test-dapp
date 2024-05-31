import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type NftCongig = {};

export function mainConfigToCell(config: NftCongig): Cell {
    return beginCell().endCell();
}

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftItem(address);
    }

    static createFromConfig(config: NftCongig, code: Cell, workchain = 0) {
        const data = mainConfigToCell(config);
        const init = { code, data };
        return new NftItem(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(provider: ContractProvider, via: Sender,
        options: {
            queryId: number,
            value: bigint,
            newOwner: Address,
            responseAddress?: Address,
            fwdAmount?: bigint
        }    
    ) {
        await provider.internal(via, {
            value: options.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32)
                .storeUint(options.queryId, 64)
                .storeAddress(options.newOwner)
                .storeAddress(options.responseAddress ?? null)
                .storeBit(false) // no custon payload
                .storeCoins(options.fwdAmount ?? 0)
                .storeBit(false) // no fwd payload
            .endCell(),
        });
    }
}
