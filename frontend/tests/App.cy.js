import App from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

describe('App.vue', () => {
  let router

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        {
          path: '/other',
          name: 'other',
          component: { template: '<div>Other</div>' }
        }
      ]
    })

    cy.mount(App, {
      global: {
        // needs pinia as it's required by App, even if not used in tests
        plugins: [router, createPinia()]
      }
    })

    // ensure the router is ready before starting each test
    await router.isReady()
  })

  it('renders MainNavbar component', () => {
    cy.get('nav').should('exist')
  })

  it('renders main element', () => {
    cy.get('main').should('exist') // ensures that <main> exists in non-home routes
  })

  it("wraps main's contents in container when not on home route", () => {
    // navigate to a different route
    router.push('/other')

    // ensure that the navigation is finished before making assertions
    cy.url().should('include', '/other') // wait for the URL to update
    cy.get('main.container').should('exist') // the container should now exist
  })

  it('does not wrap RouterView in container on home route', () => {
    // navigate to the home route
    router.push('/')

    // ensure the route has changed before making assertions
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('main.container').should('not.exist') // the container should NOT exist
  })
})
