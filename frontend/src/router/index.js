import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersView from '../views/UsersView.vue'
import UserView from '../views/UserView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/users/:username',
      name: 'user',
      component: UserView
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
      path: '/books/create',
      name: 'create-book',
      component: () => import('../views/CreateBookView.vue')
    },
    {
      path: '/books/:isbn',
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
    }
  ]
})

export default router
