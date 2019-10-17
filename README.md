## Learn TDD in React

### Setup
First, create a new React app:

``$ npx create-react-app learn-tdd-in-react``

Now, run your app and leave it open for the duration of the process:

                $ cd learn-tdd-in-react
                $ yarn start

``create-react-app`` comes with Jest preinstalled, so all we need to add for component testing is React Testing Library:

                $ yarn add --dev @testing-library/react

Next, we need to add Cypress:

                $ yarn add --dev cypress

Add an NPM script for opening Cypress into your package.json:

                {
                ...
                "scripts": {
                    ...
                +    "cypress:open": "cypress open"
                    }
                ...
                }

Now open Cypress and it will initialize your app:

                $ yarn cypress:open

As our last setup step, let’s clear out some of the default code to get a clean starting point. Delete all the following files and folders:

 - cypress/integration/examples/
 - src/App.css
 - src/App.test.js
 - src/logo.svg

Replace the contents of src/App.js with the following:

                import React, { Component } from 'react';

                class App extends Component {
                render() {
                    return (
                    <div>
                    </div>
                    );
                }
                }

                export default App;

Note that although React 16.8 supports hooks, for this tutorial we’re still using class components. But the tests we’ll write will work just the same if you write the components with hooks instead! That’s one of the great things about tests that aren’t coupled to implementation details.

### The Feature Test

When performing outside-in TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, send it, and see it in the list.

Create a file *cypress/integration/creating_a_message.spec.js* and enter the following contents:

                describe('Creating a message', () => {
                    it('Displays the message in the list', () => {
                        cy.visit('http://localhost:3000');

                        cy.get('[data-testid="messageText"]')
                        .type('New message');

                        cy.get('[data-testid="sendButton"]')
                        .click();

                        cy.get('[data-testid="messageText"]')
                        .should('have.value', '');

                        cy.contains('New message');
                    });
                });

The code describes the steps a user would take interacting with our app:

- Visiting the web site
- Entering the text “New message” into a message text field
- Clicking a send button
- Confirming that the message text field is cleared out
- Confirming that the “New message” we entered appears somewhere on screen

After we’ve created our test, the next step in TDD is to *run the test and watch it fail.* This test will fail (be “red”) at first because we haven’t yet implemented the functionality.

If you’ve closed Cypress, reopen it with:

                $ yarn cypress:open

Run the Cypress test by clicking creating_a_message.spec.js in the Cypress window. A Chrome window should open, you should see the test run, then in the left-hand test step column you should see the following error:

                Expected to find element: '[data-testid='messageText']', but never found it.

### Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add an <input type="text"> element to the <App> directly. But say we want to keep our <App> simple and wrap everything related to the input in a custom component. We might call that component <NewMessageForm>. We wish we had it, so let’s go ahead and add it to App.js:

                import React, { Component } from 'react';
               +import NewMessageForm from './NewMessageForm';

                class App extends Component {
                  render() {
                    return (
                      <div>
                +        <NewMessageForm />
                      </div>
                    );
                  }
                }

Next, let’s create NewMessageForm.js with the following contents. It’s tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let’s just make it an empty but functioning component:

                import React, { Component } from 'react';

                export default class NewMessageForm extends Component {
                    render() {
                      return (
                        <div>
                        </div>
                      );
                   }
                }

Now rerun the tests in Cypress. We’re still getting the same error, because we haven’t actually added a text input. But we’re a step closer because we’ve written the code we wish we had: a component to wrap it. Now we can add the input tag directly. We give it a data-testid attribute of “messageText”: that’s the attribute that our test uses to find the component.

                export default class NewMessageForm extends Component {
                render() {
                    return (
                    <div>
                +        <input
                +          type="text"
                +          data-testid="messageText"
                +        />
                    </div>
                    );
                  }
                }

Rerun the tests. The error has changed! The tests are now able to find the “messageText” element. The new error is:

                Expected to find element: ‘[data-testid=’sendButton’]’, but never found it.

Now there’s a different element we can’t find: the element with attribute data-test=’sendButton’.

We want the send button to be part of our NewMessageForm, so fixing this error is easy. We just add a <button> to our component:

                            type="text"
                            data-testid="messageText"
                        />
                +        <button
                +          data-testid="sendButton"
                +        >
                +          Send
                +        </button>
                    </div>
                    );
                }

### Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

                expected '<input />' to have value '', but the value was 'New message'

We’ve made it to our first assertion, which is that the message text box should be empty – but it isn’t. We haven’t yet added the behavior to our app to clear out the message text box.

**Instead of adding the behavior directly, let’s step down from the “outside” level of end-to-end tests to an “inside” component test.** This allows us to more precisely specify the behavior of each piece. Also, since end-to-end tests are slow, component tests prevent us from having to write an end-to-end test for every rare edge case.

Create a src/__tests__ folder, then create a file src/__tests__/NewMessageForm.spec.js and add the following:

                import React from 'react';
                import { render, fireEvent, cleanup} from '@testing-library/react';
                import NewMessageForm from '../NewMessageForm';

                    describe('<NewMessageForm />', () => {
                        let getByTestId;

                        afterEach(cleanup);

                    describe('clicking the send button', () => {
                        beforeEach(() => {
                        ({ getByTestId } = render(<NewMessageForm />));

                        fireEvent.change(
                            getByTestId('messageText'),
                            {
                            target: {
                                value: 'New message',
                            },
                            },
                        );

                        fireEvent.click(getByTestId('sendButton'));
                        });

                        it('clears the text field', () => {
                        expect(getByTestId('messageText').value).toEqual('');
                        });
                    });
                });