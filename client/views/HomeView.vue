<script setup lang="ts">
import GatheringListComponent from "@/components/Gathering/GatheringListComponent.vue";
import UpcomingGatheringsComponent from "@/components/Gathering/UpcomingGatheringsComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <div class="gatheringlists">
      <article>
        <h1>All Gatherings</h1>
        <GatheringListComponent />
      </article>
      <article v-if="isLoggedIn" class="upcoming">
        <h1>Upcoming Gatherings</h1>
        <UpcomingGatheringsComponent />
      </article>
    </div>
  </main>
</template>

<style scoped>
.gatheringlists {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: start;
  padding: 1em;
}


main {
  display: flex;
  flex-flow: column wrap;
}

section {
  text-align: center;
  justify-content: center;
}

article {
  border-right: 1px dotted rgb(29, 45, 123);
  padding: 1em;
}

article:last-child {
  border: none;
}

</style>
