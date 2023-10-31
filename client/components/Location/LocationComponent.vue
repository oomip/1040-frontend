<script setup lang="ts">
const props = defineProps(["latitude", "longitude"]);
</script>

<template>
  <article class="location">
    <img src="/path/to/map-icon.png" alt="Map Icon" width="24" height="24" />
    <div class="address">{{ latitude }}</div>
  </article>
</template>

<style scoped>
.location {
  display: flex;
  align-items: center;
}
</style>
