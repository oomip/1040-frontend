<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";
import { ref } from "vue";
import { useToastStore } from "../../stores/toast";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const description = ref("");
const location = ref("");
const date = ref(formatDate(new Date()));
const emit = defineEmits(["refreshGatherings"]);

const createGathering = async (name: string, description: string, location: string, date: string) => {
  // data validation
  // location
  const locationRegex = /\/\/\/[a-z]+.[a-z]+.[a-z]+/;
  if (!(location.match(locationRegex)) && !location.match(/[a-z]+.[a-z]+.[a-z]+/)) {
    useToastStore().showToast({ message: "Please use What3Words format! Example: ///item.shop.boss", style: "error" });
    return;
  }
  // date
  if (new Date(date).getTime() < Date.now()) {
    useToastStore().showToast({ message: "Date must be in the future!", style: "error" });
    return;
  }
  if (new Date(date).getTime() > new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getTime()) {
    useToastStore().showToast({ message: "Date must be within 1 year from now!", style: "error" });
    return;
  }

  try {
    await fetchy("/api/gatherings", "POST", {
      body: {
        name: name,
        description: description,
        location: location.replaceAll('/', ''),
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
    <input id="name" v-model="name" placeholder="e.g., Mystery Board Game" required />
    <label for="description">Gathering Description:</label>
    <textarea id="description" v-model="description" placeholder="Write more here!" required> </textarea>
    <label for="location"><font-awesome-icon :icon="['fas', 'location-dot']" /> Gathering Location:</label>
    <p> Use <a href="https://what3words.com/">What3Words</a> to find the location's spefific coordinates.</p>
    <textarea id="location" v-model="location" placeholder="///item.shop.boss" required> </textarea>
    <label for="date"><font-awesome-icon :icon="['fas', 'calendar-days']" /> Gathering Date:</label>
    <input id="date" type="datetime-local" v-model="date" max="9999-01-01T01:01"/>
    <p> Please note: if others join your Gathering, you won't be able to edit it anymore! </p>
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

p {
  font-style: italic;
}
</style>
