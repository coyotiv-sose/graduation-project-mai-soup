import LogInView from '@/views/LogInView.vue'
import { createPinia } from 'pinia'

describe('LogInView', () => {
  beforeEach(() => {
    cy.mount(LogInView, {
      global: {
        plugins: [createPinia()]
      }
    })
  })

  it('renders the login form', () => {
    cy.get('form[aria-label="Login form"]').should('exist')
    cy.get('h1.title').should('contain', 'Log In')
  })

  it('has input fields for identifier and password', () => {
    cy.get('#identifier').should('exist')
    cy.get('#password').should('exist')
  })

  it('allows entering identifier and password', () => {
    cy.get('#identifier').type('testuser@example.com')
    cy.get('#password').type('password123')

    cy.get('#identifier').should('have.value', 'testuser@example.com')
    cy.get('#password').should('have.value', 'password123')
  })

  it('has a submit button', () => {
    cy.get('button[type="submit"]').should('exist').and('contain', 'Log In')
  })

  it('calls performLogin method on form submission', () => {
    cy.mount(LogInView).then(({ component }) => {
      // Access the component instance and stub the performLogin method
      cy.stub(component, 'performLogin').as('performLoginStub')
    })

    // Interact with the form
    cy.get('#identifier').type('testuser@example.com')
    cy.get('#password').type('Password123#')
    cy.get('form').submit()

    // Assert the stub was called
    cy.get('@performLoginStub').should('have.been.calledOnce')
  })

  it('redirects to home page on successful login', () => {
    cy.stub(LogInView.methods, 'login').resolves()
    cy.stub(LogInView.methods, 'performLogin').callThrough()

    const routerPushStub = cy.stub().as('routerPushStub')
    cy.mount(LogInView, {
      global: {
        plugins: [createPinia()],
        mocks: {
          $router: {
            push: routerPushStub
          }
        }
      }
    })

    cy.get('#identifier').type('testuser@example.com')
    cy.get('#password').type('password123')
    cy.get('form').submit()

    cy.get('@routerPushStub').should('have.been.calledWith', { name: 'home' })
  })
})
