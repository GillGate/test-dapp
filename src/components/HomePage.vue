<template>
    <div class="page">
        <div class="page__wallets">
            <TonConnect />
        </div>
        <div class="page__info">
            Contract balance: {{ contractBalance }} <br />
            <br />
            Counter value: {{ contractData.counter_value }} <br />
            <br />
            Recent sender: {{ recentSenderVisibleAddress }} {{  }}
        </div>
        <div v-if="senderWallet !== ''" class="page__controls">
            <button class="page__button" @click="sendIncrement">Send increment</button>
            <button class="page__button" @click="sendDeposit">Send deposit</button>
        </div>
    </div>
</template>
<script setup lang="ts">
    import { inject, onBeforeMount, computed } from "vue";
    import TonConnect from "../components/TonConnect.vue";

    const contractStore: any = inject("contractStore");

    onBeforeMount(async () => {
        function loadContractState() {
            contractStore.methods
            .initContractState()
            .then(console.log)
            .catch(console.warn)
            .finally(() => {
                setTimeout(loadContractState, 6500);
            });
        }

        loadContractState();
    });

    const senderWallet = computed(() => contractStore.getters.getSenderWallet());

    const contractBalance = computed(() => contractStore.getters.getBalance());
    const contractData = computed(() => contractStore.getters.getData());

    const recentSenderAddress = computed(() =>
        contractData.value?.recent_sender?.toString({ 
            bounceable: false,
            testOnly: true,
        }) ?? ''
    );

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
</script>
<style lang="less">
    .page {
        &__info {
            margin-top: 45px;
        }

        &__controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 45px;
        }
    }
</style>
