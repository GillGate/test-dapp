<template>
    <button class="page__button page__button--edit" @click="changeNft">Edit Nft</button>
</template>
<script setup>
    import { editNft } from '../service/nftEditor.service';
    const nftAddress = "kQDXwx_mlYw1PLLjhrNWNMDaKpuRa6DFd6qcNTADi6eKDEMt";

    async function changeNft() {
        return await editNft(nftAddress);
    }
</script>