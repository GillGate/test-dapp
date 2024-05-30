<template>
    <div class="page">
        <div class="page__wallets">
            <!-- <CustomTonConnect /> -->
            <TonConnect />
        </div>
        <div class="page__info">
            Contract balance: {{ contractBalance }} <br />
            <br />
            Counter value: {{ contractData.counter_value }} <br />
            <br />
            Recent sender: {{ recentSenderVisibleAddress }}
        </div>
        <div v-if="senderWallet !== ''" class="page__controls">
            <button class="page__button" @click="sendIncrement">Send increment</button>
            <button class="page__button" @click="sendDeposit">Send deposit</button>

            <button v-if="isAdmin" class="page__button page__button--withdraw" @click="withdrawFunds">Withdraw funds</button>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { inject, onBeforeMount, computed, ComputedRef } from "vue";
    // import CustomTonConnect from "../components/CustomTonConnect.vue";
    import TonConnect from "../components/TonConnect.vue";
    import { MainContractConfig } from "../contracts/MainContract";
    import { Address } from "@ton/core";

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
    });

    const senderWallet = computed(() => contractStore.getters.getSenderWallet());

    const contractBalance = computed(() => contractStore.getters.getBalance());
    const contractData:ComputedRef<MainContractConfig> = computed(
        () => contractStore.getters.getData()
    );

    const recentSenderAddress = computed(() =>
        contractData.value?.recent_sender?.toString({ 
            bounceable: false,
            testOnly: true,
        }) ?? ''
    );

    const isAdmin = computed(() => {
        if(senderWallet?.value) {
            return Address.parse(senderWallet?.value).toRawString() ===
                contractData.value?.owner_address?.toRawString()
        }

        return false;
    });

    const recentSenderVisibleAddress = computed(() => 
        recentSenderAddress.value?.slice(0, 5) + 
        '…' + 
        recentSenderAddress.value?.slice(recentSenderAddress.value.length - 5)
    );

    const sendIncrement = () => {
        return contractStore.methods.sendIncrement(2);
    };
    const sendDeposit = () => {
        contractStore.methods.sendDeposit(1);
    };
    const withdrawFunds = () => {
        // contractStore.methods.
    }
</script>
<style lang="less">
    .page {
        &__info {
            margin-top: 45px;
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
./CustomTonConnect.vue