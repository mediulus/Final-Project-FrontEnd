<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">DAM Good Housing</router-link>
        <ul class="nav-menu">
          <li><router-link to="/">Find Housing</router-link></li>
          <li><router-link to="/find-roommates">Find Roommates</router-link></li>
          <li><router-link to="/favorites">Favorites</router-link></li>
          <li><router-link to="/profile">Profile</router-link></li>
        </ul>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import './App.css';
</style>

