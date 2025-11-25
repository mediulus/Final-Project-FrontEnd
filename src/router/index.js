import { createRouter, createWebHistory } from 'vue-router'
import Register from '../pages/Register.vue'
import Login from '../pages/Login.vue'
import FindHousing from '../pages/FindHousing.vue'
import FindRoommates from '../pages/FindRoommates.vue'
import Favorites from '../pages/Favorites.vue'
import Profile from '../pages/Profile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/register'
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/home',
      name: 'FindHousing',
      component: FindHousing
    },
    {
      path: '/find-roommates',
      name: 'FindRoommates',
      component: FindRoommates
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: Favorites
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    }
  ]
})

export default router
