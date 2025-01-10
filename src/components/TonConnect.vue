<template>
    <div id="ton-connect" class="tonConnect"></div>
    <!-- <br /> -->
    <!-- <button @click="sendTx">Test tx</button> -->
</template>
<script setup lang="ts">
    import { onMounted, inject, computed } from "vue";
    import { connector, /*sender, sendTx*/ } from '../service/connector.service';
    import { Address } from "@ton/core";
    // import { getNftsByOwner } from "../service/nftActions.service";
    // import { SendTransactionRequest } from '@tonconnect/ui';

    const contractStore: any = inject("contractStore");



    onMounted(async () => {
        await connector.connectionRestored;
        connector.uiOptions = {
            buttonRootId: 'ton-connect'
        }

        // console.log("my nft", await getNftsByOwner(connector?.account?.address));

        
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