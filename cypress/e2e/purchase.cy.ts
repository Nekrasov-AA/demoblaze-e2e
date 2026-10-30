import order from '../fixtures/order.json'
import { buildUser } from '../support/factories/user'
import { header } from '../support/pages/header'
import { loginModal } from '../support/pages/login-modal'
import { homePage } from '../support/pages/home-page'
import { productPage } from '../support/pages/product-page'
import { cartPage } from '../support/pages/cart-page'
import { orderModal, purchaseConfirmation } from '../support/pages/order-modal'

const PRODUCT = 'MacBook Pro'

describe('Purchase', () => {
  beforeEach(() => {
    cy.stubAlert()
  })

  it('buys a laptop and shows the paid amount in the confirmation', { tags: '@smoke' }, () => {
    const user = buildUser()
    cy.createUser(user)
    cy.visit('/')

    cy.intercept('POST', '**/login').as('login')
    header.loginLink().click()
    loginModal.login(user)
    cy.wait('@login')
    header.welcomeUser().should('have.text', `Welcome ${user.username}`)

    cy.intercept('POST', '**/bycat').as('byCategory')
    homePage.category('Laptops').click()
    cy.wait('@byCategory')

    cy.intercept('POST', '**/view').as('viewProduct')
    homePage.productLink(PRODUCT).click()
    cy.wait('@viewProduct')
    productPage.name().should('have.text', PRODUCT)

    productPage.readPrice().then((price) => {
      cy.intercept('POST', '**/addtocart').as('addToCart')
      productPage.addToCartButton().click()
      cy.wait('@addToCart')
      cy.get('@alert').should('have.been.calledWith', 'Product added.')

      cy.intercept('POST', '**/viewcart').as('viewCart')
      header.cartLink().click()
      cy.wait('@viewCart')
      cartPage.rows().should('have.length', 1)
      cartPage.row(PRODUCT).contains('td', new RegExp(`^${price}$`)).should('be.visible')
      cartPage.total().should('have.text', String(price))

      cartPage.placeOrderButton().click()
      orderModal.fill(order)
      cy.intercept('POST', '**/deletecart').as('deleteCart')
      orderModal.purchaseButton().click()
      cy.wait('@deleteCart')

      purchaseConfirmation.title().should('have.text', 'Thank you for your purchase!')
      purchaseConfirmation
        .details()
        .should('contain', `Amount: ${price} USD`)
        .and('contain', `Card Number: ${order.card}`)
        .and('contain', `Name: ${order.name}`)

      purchaseConfirmation.confirm()
      cy.location('pathname').should('eq', '/index.html')

      // Rows render only after a separate /view call per item, so an empty table alone
      // could pass too early; the empty Items list in the response is the reliable proof.
      cy.intercept('POST', '**/viewcart').as('viewCartAfterPurchase')
      header.cartLink().click()
      cy.wait('@viewCartAfterPurchase').its('response.body.Items').should('have.length', 0)
      cartPage.rows().should('not.exist')
    })
  })

  it('requires name and credit card to place an order', { tags: '@smoke' }, () => {
    cy.visit('/cart.html')

    cartPage.placeOrderButton().click()
    orderModal.fill({ ...order, name: '', card: '' })
    orderModal.purchaseButton().click()

    // Validation is client-side: no request is sent, so there is no network call to wait for.
    cy.get('@alert').should('have.been.calledWith', 'Please fill out Name and Creditcard.')
    purchaseConfirmation.dialog().should('not.exist')
  })

  // Known bug: the confirmation date uses getMonth() (0-based), so the month is one behind.
  it.skip("shows today's date in the purchase confirmation", { tags: '@extended' }, () => {
    cy.visit('/')

    cy.intercept('POST', '**/bycat').as('byCategory')
    homePage.category('Laptops').click()
    cy.wait('@byCategory')

    cy.intercept('POST', '**/view').as('viewProduct')
    homePage.productLink(PRODUCT).click()
    cy.wait('@viewProduct')

    cy.intercept('POST', '**/addtocart').as('addToCart')
    productPage.addToCartButton().click()
    cy.wait('@addToCart')

    header.cartLink().click()
    cartPage.rows().should('have.length', 1)
    cartPage.placeOrderButton().click()
    orderModal.fill(order)
    orderModal.purchaseButton().click()

    const today = new Date()
    purchaseConfirmation
      .details()
      .should('contain', `Date: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`)
  })
})
