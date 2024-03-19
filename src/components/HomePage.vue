<template>
  Contract balance: {{ contractBalance }}
  <br> <br>
  Counter value: {{ contractData.counter_value }}
  <br> <br>
  Recent sender: {{ recentSender }}
</template>
<script setup lang="ts">
  import { inject, onBeforeMount, computed } from 'vue';

  const contractStore:any = inject("contractStore");

  onBeforeMount(async () => {
    function loadContractState() {
      contractStore.methods.initContractState()
      .then(console.log)
      .catch(console.warn)
      .finally(() => {
        setTimeout(loadContractState, 6500);
      })
    }

    loadContractState();
  });

  const contractBalance = computed(() => contractStore.getters.getBalance());
  const contractData = computed(() => contractStore.getters.getData());

  let recentSender = computed(() => contractData.value?.recent_sender?.toString({bounceable: false}));

</script>
<style scoped>

</style>
