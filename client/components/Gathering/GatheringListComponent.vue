<script setup lang="ts">
import CreateGatheringForm from "@/components/Gathering/CreateGatheringForm.vue";
import EditGatheringForm from "@/components/Gathering/EditGatheringForm.vue";
import GatheringComponent from "@/components/Gathering/GatheringComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchGatheringForm from "./SearchGatheringForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let gatherings = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getGatherings(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let gatheringResults;
  try {
    gatheringResults = await fetchy("/api/gatherings", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  gatherings.value = gatheringResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getGatherings();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a gathering:</h2>
    <CreateGatheringForm @refreshGatherings="getGatherings" />
  </section>
  <div class="row">
    <h2>Gatherings:</h2>
    <SearchGatheringForm @getGatheringsByName="getGatherings" />
  </div>
  <section class="gatherings" v-if="loaded && gatherings.length !== 0">
    <article v-for="gathering in gatherings" :key="gathering._id">
      <GatheringComponent v-if="editing !== gathering._id" :gathering="gathering" @refreshGatherings="getGatherings" @editGathering="updateEditing" />
      <EditGatheringForm v-else :gathering="gathering" @refreshGatherings="getGatherings" @editGathering="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No gatherings found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.gatherings {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
