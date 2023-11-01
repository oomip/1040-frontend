<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "../../utils/formatDate";

const props = defineProps(["gathering"]);
const name = ref(props.gathering.name);
const description = ref(props.gathering.description);
const location = ref(props.gathering.location);
const date = ref(props.gathering.date);
const emit = defineEmits(["editGathering", "refreshGatherings"]);

const editGathering = async (name: string, description: string, location: string, date: string) => {
  try {
    await fetchy(`/api/gatherings/${props.gathering._id}`, "PATCH", {
      body: {
        update: {
          name: name,
          description: description,
          location: location,
          date: date,
        },
      },
    });
  } catch (e) {
    return;
  }
  emit("editGathering");
  emit("refreshGatherings");
};
</script>

<template>
  <form @submit.prevent="editGathering(name, description, location, date)">
    <p class="members">{{ props.gathering.members }}</p>
    <label for="name">Gathering Name:</label>
    <input id="name" v-model="name" placeholder="name" required />
    <label for="description">Gathering Description:</label>
    <textarea id="description" v-model="description" placeholder="Description" required> </textarea>
    <label for="location">Gathering Location:</label>
    <textarea id="location" v-model="location" placeholder="Location" required> </textarea>
    <label for="date">Gathering Date:</label>
    <input id="date" type="datetime-local" v-model="date" placeholder="Date" />
    <div class="base">
      <menu>
        <li><button class="btn-small pure-button-primary pure-button" type="submit">Save</button></li>
        <li><button class="btn-small pure-button" @click="emit('editGathering')">Cancel</button></li>
      </menu>
      <p v-if="props.gathering.dateCreated !== props.gathering.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.gathering.dateUpdated) }}</p>
      <p v-else class="timestamp">Created on: {{ formatDate(props.gathering.dateCreated) }}</p>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  border-radius: 4px;
  resize: none;
}

p {
  margin: 0em;
}

.members {
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

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
