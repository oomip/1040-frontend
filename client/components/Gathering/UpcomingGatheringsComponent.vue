<script setup lang="ts">
import EditGatheringForm from "@/components/Gathering/EditGatheringForm.vue";
import GatheringComponent from "@/components/Gathering/GatheringComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let gatherings = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let editableGatheringsOnly = ref(false);

async function getGatheringsByMember() {
  let gatheringResults;
  try {
    if (editableGatheringsOnly.value === true) {
      gatheringResults = (await fetchy("/api/gatherings/editableByMember", "GET", { query: {} }));
    } else {
      gatheringResults = (await fetchy("/api/gatherings/byMember", "GET", { query: {} }));
    }
  } catch (e) {
    return;
  }
  gatherings.value = gatheringResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getGatheringsByMember();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <div>
      <label for="editable">Editable gatherings only: </label>
      <input id="editable" v-model="editableGatheringsOnly" @change="getGatheringsByMember" type="checkbox" required />
    </div>
    <section class="gatherings" v-if="loaded && gatherings.length !== 0">
      <article v-for="gathering in gatherings" :key="gathering._id">
        <GatheringComponent v-if="editing !== gathering._id" :gathering="gathering" @refreshGatherings="getGatheringsByMember" @editGathering="updateEditing" />
        <EditGatheringForm v-else :gathering="gathering" @refreshGatherings="getGatheringsByMember" @editGathering="updateEditing" />
      </article>
    </section>
    <p v-else-if="loaded">Create or join gatherings on the left!</p>
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
  align-items: flex-start;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
