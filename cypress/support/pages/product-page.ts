export const productPage = {
  name: () => cy.get('.name'),
  price: () => cy.get('.price-container'),
  addToCartButton: () => cy.contains('a', 'Add to cart'),

  // The price is rendered as "$1100 *includes tax".
  readPrice: () =>
    productPage
      .price()
      .invoke('text')
      .then((text) => {
        const match = text.match(/\$([\d.]+)/)
        if (!match) {
          throw new Error(`Cannot parse price from "${text}"`)
        }
        return Number(match[1])
      }),
}
