<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const emit = defineEmits(["getGatheringsByName"]);
</script>

<template>
  <form @submit.prevent="emit('getGatheringsByName', name)" class="pure-form">
    <fieldset>
      <legend>Search Gatherings</legend>
      <input id="name" type="text" v-model="name" placeholder="Name" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
