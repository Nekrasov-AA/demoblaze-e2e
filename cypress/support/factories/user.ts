export interface User {
  username: string
  password: string
}

// ASCII only: createUser encodes with btoa(), which matches the UI's encoding only for ASCII.
export function buildUser(): User {
  return {
    username: `qa_${Date.now()}_${Cypress._.random(1000, 9999)}`,
    password: `pw_${Math.random().toString(36).slice(2, 10)}`,
  }
}
