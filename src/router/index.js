import { createRouter, createWebHistory } from 'vue-router'
import FindHousing from '../pages/FindHousing.vue'
import FindRoommates from '../pages/FindRoommates.vue'
import Favorites from '../pages/Favorites.vue'
import Profile from '../pages/Profile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
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

