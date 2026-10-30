export const cartPage = {
  rows: () => cy.get('#tbodyid tr'),
  row: (title: string) => cy.contains('#tbodyid tr', title),
  total: () => cy.get('#totalp'),
  placeOrderButton: () => cy.contains('button', 'Place Order'),
}
