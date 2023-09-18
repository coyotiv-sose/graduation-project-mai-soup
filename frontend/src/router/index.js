import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '../stores/account'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users/:username',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LogInView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue')
    },
    {
      path: '/libraries',
      name: 'libraries',
      component: () => import('../views/LibrariesView.vue')
    },
    {
      path: '/libraries/create',
      name: 'create-library',
      component: () => import('../views/CreateLibraryView.vue')
    },
    {
      path: '/libraries/:id',
      name: 'library',
      component: () => import('../views/LibraryView.vue')
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('../views/BooksView.vue')
    },
    {
      path: '/books/:id',
      name: 'book',
      component: () => import('../views/BookView.vue')
    },
    {
      path: '/loans',
      name: 'loans',
      component: () => import('../views/LoansView.vue')
    },
    {
      path: '/libraries/owned/:id',
      name: 'owned-library',
      component: () => import('../views/OwnedLibraryView.vue')
    },
    {
      path: '/libraries/:id/add-book',
      name: 'add-book',
      component: () => import('../views/AddBookView.vue')
    },
    {
      path: '/libraries/:id/edit',
      name: 'edit-library',
      component: () => import('../views/EditLibraryView.vue')
    }
  ],
  beforeEach: (to) => {
    const store = useAccountStore()

    if (to.meta.requiresAuth && !store.isLoggedIn) return { name: 'login' }
  }
})

export default router
