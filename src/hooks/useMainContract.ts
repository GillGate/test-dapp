import { useEffect, useState } from "react";
import { MainContract, MainContractConfig } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";
import { sleep } from "../helpers/sleep";

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();

    const [contractData, setContractData] = useState<null | MainContractConfig>();

    const [balance, setBalance] = useState<null | number>(0);

    const mainContract = useAsyncInitialize(async () => {
        if(!client) return;

        const contract = new MainContract(Address.parse("EQACPX4Y6a1MkI3EV4KUrrzo5TLCF2YcbZvQuhRBDbRHpkFi"));

        return client.open(contract) as OpenedContract<MainContract>;
    });

    useEffect(() => {
        async function getValue() {
            if(!mainContract) return;

            setContractData(null);
            const data = await mainContract.getData();
            const { balance } = await mainContract.getBalance();
            setContractData(data);
            setBalance(balance);
            await sleep(5000); // sleep 5 seconds and poll value again
            getValue();
        }
        getValue();
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        ...contractData,
        sendIncrement: async () => {
            return mainContract?.sendIncrement(sender, toNano("0.01"))
        },
        sendDeposit: async () => {
            return mainContract?.sendDeposit(sender, toNano("1"));
        },
        sendWithdrawalRequest: async () => {
            return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.6"))
        }
    }
}