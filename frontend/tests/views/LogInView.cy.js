import LogInView from '@/views/LogInView.vue'
import { createPinia } from 'pinia'

const SELECTORS = {
  form: 'form[aria-label="Login form"]',
  identifier: '#identifier',
  password: '#password',
  submitButton: 'button[type="submit"]',
  title: 'h1.title'
}

describe('LogInView', () => {
  beforeEach(() => {
    cy.mount(LogInView, {
      global: {
        plugins: [createPinia()]
      }
    }).then(({ component }) => {
      // attach the component instance to the Cypress context for reuse in tests
      cy.wrap(component).as('component')
    })
  })

  it('renders the login form', () => {
    cy.get(SELECTORS.form).should('exist')
    cy.get(SELECTORS.title).should('contain', 'Log In')
  })

  it('has input fields for identifier and password', () => {
    cy.get(SELECTORS.identifier).should('exist')
    cy.get(SELECTORS.password).should('exist')
  })

  it('allows entering identifier and password', () => {
    cy.get(SELECTORS.identifier).type('testuser@example.com')
    cy.get(SELECTORS.password).type('password123')

    cy.get(SELECTORS.identifier).should('have.value', 'testuser@example.com')
    cy.get(SELECTORS.password).should('have.value', 'password123')
  })

  it('has a submit button', () => {
    cy.get(SELECTORS.submitButton).should('exist').and('contain', 'Log In')
  })

  it('calls performLogin method on form submission', () => {
    cy.get('@component').then((component) => {
      cy.stub(component, 'performLogin').as('performLoginStub')
    })

    cy.get(SELECTORS.identifier).type('testuser@example.com')
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.form).submit()

    cy.get('@performLoginStub').should('have.been.calledOnce')
  })

  it('redirects to home page on successful login', () => {
    cy.get('@component').then((component) => {
      // stub login method and callThrough performLogin
      cy.stub(component, 'login').resolves()
      cy.stub(component, 'performLogin').callThrough()

      // mock the router's push method
      const routerPushStub = cy.stub().as('routerPushStub')
      component.$router = {
        push: routerPushStub
      }
    })

    cy.get(SELECTORS.identifier).type('testuser@example.com')
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.form).submit()

    cy.get('@routerPushStub').should('have.been.calledWith', { name: 'home' })
  })
})
