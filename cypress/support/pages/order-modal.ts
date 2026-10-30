export interface OrderForm {
  name: string
  country: string
  city: string
  card: string
  month: string
  year: string
}

const fieldSelectors: Record<keyof OrderForm, string> = {
  name: '#name',
  country: '#country',
  city: '#city',
  card: '#card',
  month: '#month',
  year: '#year',
}

export const orderModal = {
  dialog: () => cy.get('#orderModal'),
  field: (key: keyof OrderForm) => cy.get(fieldSelectors[key]),
  purchaseButton: () => orderModal.dialog().contains('button', 'Purchase'),

  // Empty values are skipped (cy.type('') throws), so tests can leave required fields blank.
  fill(form: Partial<OrderForm>) {
    // Bootstrap focuses the modal itself when its fade-in ends; typing before that loses keystrokes.
    orderModal.dialog().should('have.focus')
    for (const key of Object.keys(fieldSelectors) as (keyof OrderForm)[]) {
      const value = form[key]
      if (value) {
        orderModal.field(key).type(value)
      }
    }
  },
}

// The purchase confirmation is a SweetAlert dialog, not a native alert.
export const purchaseConfirmation = {
  dialog: () => cy.get('.sweet-alert'),
  title: () => cy.get('.sweet-alert h2'),
  details: () => cy.get('.sweet-alert p.lead'),
  okButton: () => cy.get('.sweet-alert .confirm'),

  confirm() {
    // SweetAlert adds "visible" 500ms after opening; an earlier OK click closes the dialog
    // without running the callback, so the redirect to index.html never happens.
    purchaseConfirmation.dialog().should('have.class', 'visible')
    purchaseConfirmation.okButton().click()
  },
}
