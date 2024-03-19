<script setup lang="ts">
  import { provide } from 'vue';
  import HomePage from './components/HomePage.vue'
  import contractStore from './store/contract.store';

  provide("contractStore", contractStore);
</script>
<template>
  <HomePage />
</template>
<style scoped>

</style>
