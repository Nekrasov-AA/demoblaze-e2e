import type { User } from '../factories/user'

export const signupModal = {
  dialog: () => cy.get('#signInModal'),
  username: () => cy.get('#sign-username'),
  password: () => cy.get('#sign-password'),
  submitButton: () => signupModal.dialog().contains('button', 'Sign up'),

  signup(user: User) {
    // Bootstrap focuses the modal itself when its fade-in ends; typing before that loses keystrokes.
    signupModal.dialog().should('have.focus')
    signupModal.username().type(user.username)
    signupModal.password().type(user.password, { log: false })
    signupModal.submitButton().click()
  },
}
