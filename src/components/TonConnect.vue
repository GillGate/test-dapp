<template>
    <div id="ton-connect" class="tonConnect"></div>
</template>
<script setup lang="ts">
    import { onMounted, inject, computed } from "vue";
    import { connector } from "../service/connector.service";
    import { Address } from "ton-core";

    const contractStore: any = inject("contractStore");

    onMounted(async () => {
        await connector.connectionRestored;
        connector.uiOptions = {
            buttonRootId: 'ton-connect'
        }
    });

    const walletAddress = computed(() => 
        Address.parseRaw(
            connector?.account?.address ?? ''
        )
        .toString({ 
            bounceable: false, 
            testOnly: true 
        }) ?? 
        ''
    );

    connector.onStatusChange((wallet) => {
        if(wallet !== null) {
            contractStore.methods.setSenderWallet(walletAddress?.value);
        }
        else {
            contractStore.methods.setSenderWallet(null);
        }
    });
</script>
<style lang="less">
    .tonConnect {
        display: flex;
        justify-content: center;
    }
</style>