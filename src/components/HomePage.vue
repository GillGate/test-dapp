<template>
    <div class="page">
        <div class="page__wallets">
            <TonConnect />
        </div>
        <div class="page__info">
            Contract balance: {{ contractBalance }} <br />
            <!-- <br /> -->
            <!-- Counter value: {{ contractData.counter_value }} <br />
            <br />
            Recent sender: {{ recentSenderVisibleAddress }} -->
        </div>
        <div v-if="senderWallet !== ''" class="page__controls">
            <!-- <button class="page__button" @click="sendIncrement">Send increment</button> -->
            <button class="page__button" @click="sendDeposit">Send deposit</button>
            <button class="page__button page__button--withdraw" @click="withdrawFunds">Withdraw funds</button>
        </div>
        <EditNft />
    </div>
</template>
<script setup lang="ts">
    import { inject, onBeforeMount, computed } from "vue";
    import TonConnect from "../components/TonConnect.vue";
    // import EditNft from "../components/EditNft.vue";
    // import { MainContractConfig } from "../wrappers/MainContract";
    // import { Address } from "@ton/core";
    import { sendWithdrawMessage } from '../service/withdrawFunds.service';

    const contractStore: any = inject("contractStore");

    onBeforeMount(async () => {
        function loadContractState() {
            contractStore.methods
            .initContractState()
            .then(console.log)
            .catch(console.error)
            .finally(() => {
                setTimeout(loadContractState, 6500);
            });
        }

        loadContractState();

        // (async () => await sendCancelOrder("kQALAedrCCqsEVnMdUoJ5TkfJZqSCjhakNFwH5jrnaetmcjU"))();

    });

    const senderWallet = computed(() => contractStore.getters.getSenderWallet());

    const contractBalance = computed(() => contractStore.getters.getBalance());
    // const contractData:ComputedRef<MainContractConfig> = computed(
    //     () => contractStore.getters.getData()
    // );

    // const recentSenderAddress = computed(() =>
    //     contractData.value?.recent_sender?.toString({ 
    //         bounceable: false,
    //         testOnly: true,
    //     }) ?? ''
    // );

    // const isAdmin = computed(() => {
    //     if(senderWallet?.value) {
    //         return Address.parse(senderWallet?.value).toRawString() ===
    //             contractData.value?.owner_address?.toRawString()
    //     }

    //     return false;
    // });

    // const recentSenderVisibleAddress = computed(() => 
    //     recentSenderAddress.value?.slice(0, 5) + 
    //     '…' + 
    //     recentSenderAddress.value?.slice(recentSenderAddress.value.length - 5)
    // );

    // const sendIncrement = () => {
    //     return contractStore.methods.sendIncrement();
    // };
    const sendDeposit = () => {
        contractStore.methods.sendDeposit(2);
    };
    const withdrawFunds = () => {
        return sendWithdrawMessage("0QBX_oJ8xet3pvRJ6JK1GHq9oUiQjct0ohQlgYX1OGopNcOP", 1.8);
    }
</script>
<style lang="less">
    .page {
        &__info {
            margin-top: 45px;
        }

        &__button {
            margin-bottom: 10px;

            &--edit {
                background-color: blueviolet;
            }
        }

        &__controls {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 450px;
            gap: 10px;
            margin-top: 45px;
        }
    }
</style>