<template>
    <button class="page__button page__button--edit" @click="editNft">Edit Nft</button>
</template>
<script setup>
    import { editNft } from '../service/nftEditor.service';
</script>