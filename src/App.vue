<template>
  <HomePage />
</template>
<script setup lang="ts">
  import { provide } from 'vue';
  import HomePage from './components/HomePage.vue'
  import contractStore from './store/contract.store';
  import tonProofStore from './store/ton-proof.store';
  // import { connector } from './service/connector.service';

  provide("contractStore", contractStore);
  provide("tonProofStore", tonProofStore);

  // connector.restoreConnection();
</script>
<style scoped>

</style>
