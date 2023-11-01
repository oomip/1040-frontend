<script setup lang="ts">
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
const editableGatheringsOnly = ref(false);

async function getGatheringsByMember(checkAuthor?: string) {
  let query: Record<string, string> = checkAuthor !== undefined ? { checkAuthor } : {};
  let gatheringResults;
  try {
    gatheringResults = await fetchy("/api/gatherings/byMember", "GET", { query });
  } catch (_) {
    return;
  }
  gatherings.value = gatheringResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getGatheringsByMember(String(editableGatheringsOnly));
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <div class="row">
      <h2>Gatherings:</h2>
      <SearchGatheringForm @getGatheringsByName="getGatheringsByMember" />
    </div>
    <section class="gatherings" v-if="loaded && gatherings.length !== 0">
      <article v-for="gathering in gatherings" :key="gathering.date">
        <GatheringComponent v-if="editing !== gathering._id" :gathering="gathering" @refreshGatherings="getGatheringsByMember" @editGathering="updateEditing" />
        <EditGatheringForm v-else :gathering="gathering" @refreshGatherings="getGatheringsByMember" @editGathering="updateEditing" />
      </article>
    </section>
    <p v-else-if="loaded">Sign up for some gatherings on the left!</p>
    <p v-else>Loading...</p>
  </section>
  <section v-else>
    <p>Your gatherings would be displayed here.</p>
  </section>
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
  display: flex;
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
