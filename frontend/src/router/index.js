import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '../stores/account'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/users/:username',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LogInView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/libraries',
      name: 'all-libraries',
      component: () => import('../views/AllLibrariesView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/libraries/create',
      name: 'create-library',
      component: () => import('../views/CreateLibraryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/libraries/:id',
      name: 'single-library',
      component: () => import('../views/SingleLibraryView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/books',
      name: 'all-books',
      component: () => import('../views/AllBooksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/books/:id',
      name: 'single-book',
      component: () => import('../views/SingleBookView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/loans',
      name: 'loans',
      component: () => import('../views/LoansView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/libraries/:id/add-book',
      name: 'add-book',
      component: () => import('../views/AddBookView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/libraries/:id/edit',
      name: 'edit-library',
      component: () => import('../views/EditLibraryView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const store = useAccountStore()

  if (to.meta.requiresAuth && !store.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
