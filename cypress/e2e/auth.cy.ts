import { buildUser } from '../support/factories/user'
import { header } from '../support/pages/header'
import { loginModal } from '../support/pages/login-modal'
import { signupModal } from '../support/pages/signup-modal'

describe('Authentication', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.visit('/')
    cy.stubAlert()
  })

  it('signs up a new user who can then log in', () => {
    const user = buildUser()
    cy.intercept('POST', '**/signup').as('signup')

    header.signupLink().click()
    signupModal.signup(user)
    cy.wait('@signup')

    cy.get('@alert').should('have.been.calledWith', 'Sign up successful.')

    cy.intercept('POST', '**/login').as('login')
    header.loginLink().click()
    loginModal.login(user)
    cy.wait('@login')

    header.welcomeUser().should('have.text', `Welcome ${user.username}`)
  })

  it('shows an error for a wrong password', () => {
    const user = buildUser()
    cy.createUser(user)
    cy.intercept('POST', '**/login').as('login')

    header.loginLink().click()
    loginModal.login({ ...user, password: `wrong_${user.password}` })
    cy.wait('@login')

    cy.get('@alert').should('have.been.calledWith', 'Wrong password.')
    header.welcomeUser().should('not.be.visible')
  })

  it('shows an error for a non-existent user', () => {
    const user = buildUser()
    cy.intercept('POST', '**/login').as('login')

    header.loginLink().click()
    loginModal.login(user)
    cy.wait('@login')

    cy.get('@alert').should('have.been.calledWith', 'User does not exist.')
    header.welcomeUser().should('not.be.visible')
  })

  it('shows an error when signing up with an existing username', () => {
    const user = buildUser()
    cy.createUser(user)
    cy.intercept('POST', '**/signup').as('signup')

    header.signupLink().click()
    signupModal.signup(user)
    cy.wait('@signup')

    cy.get('@alert').should('have.been.calledWith', 'This user already exist.')
  })
})
