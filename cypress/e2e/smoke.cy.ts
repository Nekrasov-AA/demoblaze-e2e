describe('Setup check', () => {
  it('shows the product list on the home page', { tags: '@smoke' }, () => {
    cy.intercept('GET', '**/entries').as('getEntries')

    cy.visit('/')
    cy.wait('@getEntries')

    cy.get('#tbodyid').should('be.visible').children().should('have.length.greaterThan', 0)
  })
})
