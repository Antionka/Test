const faker = require('faker')

const userEmail = faker.internet.email()
const userName = faker.name.findName()
const userPass = '123456'

before ('Sign Up', () => {
    cy.clearCookies()
    cy.visit ('https://soapps.net/test/auth/signup?redirect_url=https://soapps.net/test/integrations/')
    cy.server()
    cy.route('POST', 'https://soapps.net/test/auth/api/signup').as ('signup')
    cy.get ('input#username').type(userName)
    cy.get ('input#email').type(userEmail)
    cy.get ('input#password').type(userPass)
    cy.get ('input#rePassword').type(userPass)
    cy.get ('button').contains('Sign Up').click()
    cy.wait('@signup')
})

beforeEach('Log in', () => {
    cy.clearCookies()
    cy.visit('https://soapps.net/test/auth/login?redirect_url=https://soapps.net/test/profile/api/page')
    cy.server()
    cy.route('POST', 'https://soapps.net/test/auth/api/signin').as ('signin')
    cy.get('input#email').type(userEmail)
    cy.get ('input#password').type(userPass)
    cy.get ('button').contains('Log In').click()
    cy.wait('@signin')
})

it('1. Delete my account layout', () => {
    cy.get('button').contains('EDIT PROFILE').click()
    cy.get('span').contains('DELETE MY ACCOUNT').click()
    cy.get('.dgrOev > .Modal__ModalContent-n10wgq-2').as('ModalWindow')
    cy.get('@ModalWindow').should('contain', 'Are you sure you want to delete your account?')
    cy.get('@ModalWindow').should('contain', 'CANCEL')
    cy.get('@ModalWindow').should('contain', 'YES, DELETE')
})

it('2.1 Cancel', () => {
    cy.get('button').contains('EDIT PROFILE').click()
    cy.get('span').contains('DELETE MY ACCOUNT').click()
    cy.get('.dgrOev > .Modal__ModalContent-n10wgq-2').as('ModalWindow')
    cy.get('@ModalWindow').contains('CANCEL').click()
    cy.get('span').contains('DELETE MY ACCOUNT').should('be.visible')
})

it('2.2 Yes, delete', () => {
    cy.get('button').contains('EDIT PROFILE').click()
    cy.get('span').contains('DELETE MY ACCOUNT').click()
    cy.get('.dgrOev > .Modal__ModalContent-n10wgq-2').as('ModalWindow')
    cy.get('@ModalWindow').contains('YES, DELETE').click()
    cy.get('.common__SuspendedWrap-sc-1k1etki-4')
    cy.get('.Text-sc-1mie9jz-0 > span').contains('The account was deleted').should('be.visible')   
})

it('3. Log in with deleted user', () => {
    cy.get('span').contains('Account was deleted. Would you like to restore it?').should('be.visible') 
    cy.get('span').contains('Yes').should('be.visible') 
    cy.get('span').contains('No').should('be.visible') 
})

 it('4. Click Yes', () => {
    cy.get('span').contains('Yes').click()
    cy.get('span').contains('Restore profile').should('be.visible')
})

it('5. Captcha error', () => {
    cy.get('span').contains('Yes').click()
    cy.get('input#email').type(userEmail)
    cy.get('button').contains('Restore').click()
    cy.get('span').contains('Please show that you are not a robot').should('be.visible')
})

it('6. Email error', () => {
    cy.get('span').contains('Yes').click()
    cy.get('button').contains('Restore').click()
    cy.get('span').contains('Please enter valid address')
})

it('7. Log in redirect', () => {
    cy.get('span').contains('Yes').click()
    cy.get('span').contains('Log In').click()
    cy.get('span').contains('Login').should('be.visible')
})

it('8. Logo redirect', () => {
    cy.get('span').contains('Yes').click()
    cy.get('a').should('have.attr', 'href', '//solidopinion.com')
})
