<script setup lang="ts">
import CreateGatheringForm from "@/components/Gathering/CreateGatheringForm.vue";
import EditGatheringForm from "@/components/Gathering/EditGatheringForm.vue";
import GatheringComponent from "@/components/Gathering/GatheringComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchGatheringForm from "./SearchGatheringForm.vue";

const emit = defineEmits(["refreshAllGatherings"]);
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let gatherings = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchName = ref("");

async function getGatherings(name?: string) {
  let query: Record<string, string> = (name !== undefined && name !== '') ? { name } : {};
  let gatheringResults;
  try {
    gatheringResults = await fetchy("/api/gatherings", "GET", { query });
  } catch (_) {
    return;
  }
  searchName.value = name ? name : "";
  gatherings.value = gatheringResults;
  emit("refreshAllGatherings")
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
  <section class="gatherings">
    <div v-if="isLoggedIn" class="row">
      <div>
        <SearchGatheringForm @getGatheringsByName="getGatherings" />
      </div>
        <h2>Create a gathering:</h2>
        <CreateGatheringForm @refreshGatherings="getGatherings" />
    </div>
    <article v-for="gathering in gatherings" :key="gathering._id" v-if="loaded && gatherings.length !== 0">
      <GatheringComponent v-if="editing !== gathering._id" :gathering="gathering" @refreshGatherings="getGatherings" @editGathering="updateEditing" />
      <EditGatheringForm v-else :gathering="gathering" @refreshGatherings="getGatherings" @editGathering="updateEditing" />
    </article>
    <p v-else-if="loaded">No gatherings found</p>
    <p v-else>Loading...</p>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  /* display: grid;
  grid-template-columns: repeat(3, 33.3%);
  justify-content: left; */
  gap: 1em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  max-width: 20em;
}

.gatherings {
  padding: 1em;
}

.row {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  margin: 0 auto;
  max-width: 20em;
}
</style>
