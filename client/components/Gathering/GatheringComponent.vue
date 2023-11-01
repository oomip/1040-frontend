<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["gathering"]);
const emit = defineEmits(["editGathering", "refreshGatherings"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteGathering = async () => {
  try {
    await fetchy(`/api/gatherings/${props.gathering._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshGatherings");
};
</script>

<template>
  <p class="name">{{ props.gathering.name }}</p>
  <p>{{ props.gathering.description }}</p>

  <p><font-awesome-icon icon="fa-solid fa-location-dot" />{{ props.gathering.location }}</p>
  <p><font-awesome-icon icon="fa-solid fa-calendar-days" /> {{ new Date(props.gathering.date).toUTCString() }}</p>
  <div class="base">
    <menu v-if="props.gathering.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editGathering', props.gathering._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deleteGathering">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.gathering.dateCreated !== props.gathering.dateUpdated">Edited on: {{ formatDate(props.gathering.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.gathering.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
