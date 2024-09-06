import SignUpView from '@/views/SignUpView.vue'

const SELECTORS = {
  form: 'form[aria-label="Sign up form"]',
  username: '#username',
  email: '#email',
  password: '#password',
  submitButton: 'button[type="submit"]',
  title: 'h1.title'
}

describe('SignUpView', () => {
  beforeEach(() => {
    cy.mount(SignUpView).then(({ component }) => {
      // attach the component instance to the Cypress context for reuse in tests
      cy.wrap(component).as('component')
    })
  })

  it('renders the sign-up form', () => {
    cy.get(SELECTORS.title).should('contain', 'Sign Up')
    cy.get(SELECTORS.form).should('exist')
    cy.get(SELECTORS.username).should('exist')
    cy.get(SELECTORS.email).should('exist')
    cy.get(SELECTORS.password).should('exist')
    cy.get(SELECTORS.submitButton).should('exist')
  })

  it('initially disables submit button', () => {
    cy.get(SELECTORS.submitButton).should('be.disabled')
  })

  it('keeps submit button disabled when only username is entered', () => {
    cy.get(SELECTORS.username).type('user')
    cy.get(SELECTORS.submitButton).should('be.disabled')
  })

  it('keeps submit button disabled when only email is entered', () => {
    cy.get(SELECTORS.email).type('valid@email.com')
    cy.get(SELECTORS.submitButton).should('be.disabled')
  })

  it('keeps submit button disabled when only password is entered', () => {
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.submitButton).should('be.disabled')
  })

  it('enables submit button when form is valid', () => {
    cy.get(SELECTORS.username).type('validuser')
    cy.get(SELECTORS.email).type('valid@email.com')
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.submitButton).should('not.be.disabled')
  })

  it('re-disables submit button when form becomes invalid', () => {
    cy.get(SELECTORS.username).type('validuser')
    cy.get(SELECTORS.email).type('valid@email.com')
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.username).clear()
    cy.get(SELECTORS.submitButton).should('be.disabled')
  })

  it('shows error for invalid username', () => {
    cy.get(SELECTORS.username).type('a')
    cy.get('.help.is-danger').should(
      'contain',
      'Username must be at least 3 characters'
    )
  })

  it('shows error for invalid email', () => {
    cy.get(SELECTORS.email).type('invalidemail')
    cy.get('.help.is-danger').should(
      'contain',
      'Please enter a valid email address'
    )
  })

  it('calls performSignUp on form submission', () => {
    cy.get('@component').then((component) => {
      cy.stub(component, 'performSignUp').as('performSignUpStub')
    })

    cy.get(SELECTORS.username).type('validuser')
    cy.get(SELECTORS.email).type('valid@email.com')
    cy.get(SELECTORS.password).type('password123')
    cy.get(SELECTORS.form).submit()

    cy.get('@performSignUpStub').should('have.been.calledOnce')
  })

  // TODO: add tests for error handling
  it('shows error message when performSignUp fails')

  it('clears username error when valid username is provided', () => {
    cy.get(SELECTORS.username).type('a')
    cy.get('.help.is-danger').should(
      'contain',
      'Username must be at least 3 characters'
    )

    cy.get(SELECTORS.username).clear().type('validuser')
    cy.get('.help.is-danger').should('not.exist')
  })

  it('clears email error when valid email is provided', () => {
    cy.get(SELECTORS.email).type('invalidemail')
    cy.get('.help.is-danger').should(
      'contain',
      'Please enter a valid email address'
    )

    cy.get(SELECTORS.email).clear().type('valid@email.com')
    cy.get('.help.is-danger').should('not.exist')
  })
})
