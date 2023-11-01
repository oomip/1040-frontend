<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const description = ref("");
const location = ref("");
const date = ref(formatDate(new Date()));
const emit = defineEmits(["refreshGatherings"]);

const createGathering = async (name: string, description: string, location: string, date: string) => {
  try {
    await fetchy("/api/gatherings", "POST", {
      body: {
        name: name,
        description: description,
        location: location,
        date: date,
      },
    });
  } catch (_) {
    return;
  }
  emit("refreshGatherings");
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  description.value = "";
  location.value = "";
  date.value = formatDate(new Date());
};
</script>

<template>
  <form @submit.prevent="createGathering(name, description, location, date)">
    <label for="name">Gathering Name:</label>
    <input id="name" v-model="name" placeholder="name" required />
    <label for="description">Gathering Description:</label>
    <textarea id="description" v-model="description" placeholder="Description" required> </textarea>
    <label for="location">Gathering Location:</label>
    <textarea id="location" v-model="location" placeholder="Location" required> </textarea>
    <label for="date">Gathering Date:</label>
    <input id="date" type="datetime-local" v-model="date" placeholder="Date" />
    <button type="submit" class="pure-button-primary pure-button">Create Gathering</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 2em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

input {
  font-family: inherit;
  font-size: inherit;
  height: 2em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
