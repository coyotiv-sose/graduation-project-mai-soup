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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
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
    }
  ]
})

export default router
