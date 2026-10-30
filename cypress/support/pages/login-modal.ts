import type { User } from '../factories/user'

export const loginModal = {
  dialog: () => cy.get('#logInModal'),
  username: () => cy.get('#loginusername'),
  password: () => cy.get('#loginpassword'),
  submitButton: () => loginModal.dialog().contains('button', 'Log in'),

  login(user: User) {
    // Bootstrap focuses the modal itself when its fade-in ends; typing before that loses keystrokes.
    loginModal.dialog().should('have.focus')
    loginModal.username().type(user.username)
    loginModal.password().type(user.password, { log: false })
    loginModal.submitButton().click()
  },
}
