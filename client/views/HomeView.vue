<script setup lang="ts">
import GatheringListComponent from "@/components/Gathering/GatheringListComponent.vue";
import UpcomingGatheringsComponent from "@/components/Gathering/UpcomingGatheringsComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <section>
    <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
    <h1 v-else>Please login!</h1>
  </section>
  <main>
    <div class="all-gatherings">
      <h1>All Gatherings</h1>
      <GatheringListComponent />
    </div>
    <div class="upcoming">
      <h1>Upcoming Gatherings</h1>
      <UpcomingGatheringsComponent />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

main {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: 30em;
}
</style>
