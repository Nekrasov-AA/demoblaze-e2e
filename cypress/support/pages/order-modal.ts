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
  field: (key: keyof OrderForm) => cy.get(fieldSelectors[key]),
  purchaseButton: () => cy.get('#orderModal').contains('button', 'Purchase'),

  // Empty values are skipped (cy.type('') throws), so tests can leave required fields blank.
  fill(form: Partial<OrderForm>) {
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
}
