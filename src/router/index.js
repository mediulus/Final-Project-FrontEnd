import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../stores/session.js'
import Register from '../pages/Register.vue'
import Login from '../pages/Login.vue'
import FindHousing from '../pages/FindHousing.vue'
import FindRoommates from '../pages/FindRoommates.vue'
import Favorites from '../pages/Favorites.vue'
import MyPostings from '../pages/MyPostings.vue'
import Profile from '../pages/Profile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/home',
      name: 'FindHousing',
      component: FindHousing,
      meta: { requiresAuth: true }
    },
    {
      path: '/find-roommates',
      name: 'FindRoommates',
      component: FindRoommates,
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: Favorites,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-postings',
      name: 'MyPostings',
      component: MyPostings,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const sessionStore = useSessionStore()
  
  console.log('Navigation Guard:', {
    to: to.path,
    hasToken: !!sessionStore.token,
    hasUser: !!sessionStore.user,
    token: sessionStore.token,
    user: sessionStore.user
  })
  
  if (to.meta.requiresAuth && !sessionStore.token) {
    console.log('Redirecting to login - no session token')
    next('/login')
  } else {
    next()
  }
})

export default router
