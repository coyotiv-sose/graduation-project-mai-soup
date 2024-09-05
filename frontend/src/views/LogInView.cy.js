import LogInView from './LogInView.vue'

describe('<LogInView />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogInView)
  })
})