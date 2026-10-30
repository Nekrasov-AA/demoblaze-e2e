export const homePage = {
  // All category links share the duplicate id "itemc", so the text is the only stable handle.
  category: (name: string) => cy.contains('.list-group-item', name),
  productLink: (name: string) => cy.contains('.hrefch', name),
}
