<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/waterfall.png" height="500" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>Social Cascadia</h1>
        </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 1em 2em;
  background: linear-gradient(0deg, rgba(0,35,71,1) 0%, rgba(0,87,179,1) 37%, rgba(96,142,190,1) 93%);
  display: flex;
  align-items: center;
  filter: drop-shadow(#ffe8f4 0em 1em 10px);
}

h1 {
  font-size: 2em;
  color: #f7ffeb;
  text-shadow: rgb(13, 106, 85) 1px 0 3px ;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 4em;
  background: radial-gradient(circle, rgb(147, 165, 255, 0.5) 0%, rgba(70,201,252,0.01) 66%);
  border-radius: 100%;
  border-width: 0.2em;
  border-color: rgb(144, 205, 199);
  border-style: dotted;
  border-bottom: #ccc;
  border-top: #ccc;
}

a {
  color: #f7ffeb;
  text-decoration: none;
}

li:hover {
  color: #f7ffeb;
  font-style: italic;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;

}


.underline {
  text-decoration: underline;
  text-decoration-style: dotted;
  font-style: italic;
  color: #ffffff;
}
</style>
