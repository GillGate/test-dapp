<template>
    <div>
        <button @click="connectWallet" v-if="!isWalletConnected">Connect wallet</button>
        <button @click="disconnectWallet" v-else>Wallet: {{ visibleAddress }}</button>

        <template v-if="isOpenWalletList && !isWalletConnected">
            <p>Choose a wallet:</p>

            <div class="walletList">
                <template v-for="wallet in walletsList">
                    <button @click="onWalletClick(wallet)" class="walletItem">
                        <div class="walletItem__logo">
                            <img :src="wallet.imageUrl" width="50" height="50">
                        </div>
                    </button>
                </template>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, inject, onBeforeMount } from 'vue';
import { WalletInfo, isWalletInfoRemote, isWalletInfoCurrentlyInjected } from "@tonconnect/sdk";
import { customConnector } from '../service/connector.service';
import { Address } from '@ton/core';

const contractStore: any = inject("contractStore");
const tonProofStore: any = inject("tonProofStore");

let walletsList = ref();

onBeforeMount(async () => {
    walletsList.value = await customConnector.getWallets();
    walletsList.value.length = 3;
});

customConnector.onStatusChange(
    async (wallet:any) => {
        if(wallet !== null) {
            isWalletConnected.value = true;
            accountInfo.value = wallet;
            contractStore.methods.setSenderWallet(walletAddress.value);
        }
        else {
            isWalletConnected.value = false;
            accountInfo.value = null;
            contractStore.methods.setSenderWallet('');
        }

        let tonProof = wallet?.connectItems?.tonProof;

        if(tonProof && !('error' in tonProof)) {
            let res = await tonProofStore.methods.checkProof(tonProof.proof, wallet?.account);

            console.log("res checkProof", res);
            console.log("acc info", await tonProofStore.methods.getAccountInfo(wallet?.account));
        }
    }, 
    (e:Error) => {
        alert(e.message);
    }
);

const isOpenWalletList = ref(false);
const isWalletConnected = ref(false);
const accountInfo = ref();

const walletAddress = computed(() => 
    Address.parseRaw(
        accountInfo.value.account.address
    )
    .toString({ 
        bounceable: false, 
        testOnly: true 
    }) ?? 
    ''
);
const visibleAddress = computed(() => 
    walletAddress.value.slice(0, 5) + 
    '…' + 
    walletAddress.value.slice(walletAddress.value.length - 5)
);

const connectWallet = () => {
    isOpenWalletList.value = true;
}

const disconnectWallet = () => {
    customConnector.disconnect();
}

const onWalletClick = async (walletInfo: WalletInfo) => {
    const payload = await tonProofStore.methods.generatePayload();

    console.log(payload);

    if(isWalletInfoRemote(walletInfo)) {
        const connectionURL = customConnector.connect({
            bridgeUrl: walletInfo.bridgeUrl,
            universalLink: walletInfo.universalLink
        }, payload);

        return window.open(connectionURL, '_blank');
    }

    if(isWalletInfoCurrentlyInjected(walletInfo)) {
        return customConnector.connect({
            jsBridgeKey: walletInfo.jsBridgeKey
        }, payload);
    }

    window.open(walletInfo.aboutUrl, '_blank');
}
</script>
<style lang="less">
    .walletList {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
    }

    .walletItem {
        &__logo {
            border-radius: 50%;

            img {
                border-radius: inherit;
            }
        }
    }
</style>