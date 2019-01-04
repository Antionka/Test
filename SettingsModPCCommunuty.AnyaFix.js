var faker = require('faker');
const clickDropDown = (title) => {
    cy.get('input[name="moderationMode"]').next().click()
    cy.get(`span[title="${title}"]`).trigger('mouseover').click({ force: true })
    cy.get('span').contains('Only comments with links').should('be.visible')
}
const checkOptions = (value1, value2, value3) => {
    cy.get('span').contains('Only comments with links').next().children().should('have.value', `${value1}`)
    cy.get('span').contains('Auto block commentor').next().children().should('have.value', `${value2}`)
    cy.get('span').contains('Auto remove comments').next().children().should('have.value', `${value3}`)
}

const clickOption = () => {
    cy.get('span').contains('Only comments with links').next().children().next().click()
    cy.get('span').contains('Auto block commentor').next().children().next().click()
    cy.get('span').contains('Auto remove comments').next().children().next().click()
}
const newIntegrationAndCheckSavedOptions = (checkOption, valueCheckOption) => {
    let name = faker.commerce.productName()
    cy.get('span').contains('Name').next().type(name)
    cy.get('span').contains(checkOption).next().children().next().click()
    cy.get('span').contains('SAVE').click()
    cy.wait(1000)
    cy.get('span').contains('Changes were successfully saved').should('be.visible')
    cy.get('span').contains('OPEN PREVIEW').should('be.visible')
    cy.get('input[name="embedCodeComments"]').should('be.visible')
    cy.get('input[name="embedCodeCommunity"]').should('be.visible')
    cy.wait(1000)
    cy.get(`span[title="${name}"]`).click()
    cy.wait(1000)
    cy.get('span').contains('Configuration').click()
    cy.wait(1000)
    cy.get('span').contains(checkOption).next().children().should('have.value', valueCheckOption)
    cy.get('span').contains('REMOVE INTEGRATION').click()
    cy.wait(1000)
    cy.get('span').contains('SUBMIT').click()
}

const password = 'maui123'
const email = faker.internet.email()
const userName = faker.name.findName() 

const login = () => {
    cy.clearCookies()
    cy.visit('https://soapps.net/test/auth/login')
    cy.server()
    cy.route('POST', '/test/auth/api/signin').as('login')
    cy.get('input#email').type(email)
    cy.get('input#password').type(password)
    cy.get('button').contains('Log In').click()
    cy.wait('@login')
    cy.visit('https://soapps.net/test/integrations/')
    cy.get('span').contains('CREATE NEW INTEGRATION').click()
}

before ('Sign Up', () => {
    cy.clearCookies()
    cy.visit ('https://soapps.net/test/auth/signup?redirect_url=https://soapps.net/test/integrations/')
    cy.server()
    cy.route('POST', 'https://soapps.net/test/auth/api/signup').as ('signup')
    cy.get ('input#username').type(userName)
    cy.get ('input#email').type(email)
    cy.get ('input#password').type(password)
    cy.get ('input#rePassword').type(password)
    cy.get ('button').contains('Sign Up').click()
    cy.wait('@signup')
})

describe('Moderation/PC/Community Settings APP test', () => {
    describe('Moderation', () => {
        beforeEach(() => {
            login()
        })
        it('2. default moderation mode', () => {
            cy.get('input[name="moderationMode"]').next().contains('No moderation').should('be.visible')
        })
        it('3. render moderation mode dropdown', () => {
            cy.get('input[name="moderationMode"]').next().click()
            cy.get('div[title="Pre-moderation"]').should('be.visible')
            cy.get('div[title="Post-moderation"]').should('be.visible')
            cy.get('div[title="No moderation"]').should('be.visible').click()
        })
        
        it('4. render Only comments with links', () => {
            clickDropDown('Pre-moderation')
            clickDropDown('Post-moderation')
        })
        
        it('5. default options with post/pre moderation', () => {
            clickDropDown('Pre-moderation')
            checkOptions('false', 'true', 'true')
            clickDropDown('Post-moderation')
            checkOptions('false', 'true', 'true')
        })
        it('6. clickable options ', () => {
            clickDropDown('Pre-moderation')
            checkOptions('false', 'true', 'true')
            clickOption()
            checkOptions('true', 'false', 'false')
        })
        it('7. save options', () => {
            let Name = faker.commerce.productName()
            cy.get('span').contains('Name').next().type(Name)
            clickDropDown('Pre-moderation')
            checkOptions('false', 'true', 'true')
            clickOption()
            cy.get('span').contains('SAVE').click()
            cy.wait(1000)
            cy.get('span').contains('Changes were successfully saved').should('be.visible')
            cy.get('span').contains('OPEN PREVIEW').should('be.visible')
            cy.get('input[name="embedCodeComments"]').should('be.visible')
            cy.get('input[name="embedCodeCommunity"]').should('be.visible')
            cy.wait(1000)
            cy.get(`span[title="${Name}"]`).click()
            cy.wait(1000)
            cy.get('span').contains('Configuration').click()
            cy.wait(1000)
            checkOptions('true', 'false', 'false')
            cy.get('span').contains('REMOVE INTEGRATION').click()
            cy.wait(1000)
            cy.get('span').contains('SUBMIT').click()
        })
    })
    
    describe('Enable promo comment', () => {
        before(() => {
            login()
        })
        it('9. change Enable promo comments', () => {
            newIntegrationAndCheckSavedOptions('Enable promo comments', 'false')
        })
    })
    describe('Enable community', () => {
        before(() => {
            login()
        })
        it('11. default options', () => {
            cy.get('span').contains('Enable community').next().children().should('have.value', 'true')
        })
        it('12. change Enable community', () => {
            login()
            newIntegrationAndCheckSavedOptions('Enable community', 'false')
        })
        describe('Saved windows', () => {
            let name = faker.commerce.productName()
            before(() => {
                login()
                cy.get('span').contains('Name').next().type(name)
                cy.get('span').contains('SAVE').click()
                cy.wait(1000)
            })
            it('13 render Community embed code', ()=>{
                cy.get('input[name="embedCodeCommunity"]').should('be.visible')
            })
            it('14 disible type Comments embed code', ()=>{
                var value = Cypress.$('input[name="embedCodeComments"]')[0].value
                cy.get('input[name="embedCodeComments"]').type('testtest')
                cy.get('input[name="embedCodeComments"]').should('have.value', value)
            })
            it('15 test copy button', ()=>{
                cy.get('div[label="Comments embed code"]')
                .next()
                .trigger('mouseover')
                .click()
                .get('div')
                .contains('Successfully copied')
                .should('be.visible')
                //navigator.clipboard.readText()
                //    .then(text => {
                //    console.log('Pasted content: ', text);
                //        })
            })
            it('16 render embes codes', ()=>{
                cy.get('div[label="Comments embed code"]').should('be.visible')
                cy.get('div[label="Community embed code"]').should('be.visible')
            })
        })
    })
})
