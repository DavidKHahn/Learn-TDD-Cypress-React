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

React Testing Library has a different API than Cypress, but a lot of the test seems the same as the end-to-end test: we still enter a new message and click the send button. But this is testing something very different. Instead of testing the whole app running together, we’re testing just the NewMessageForm by itself.

Run yarn test to run the component test. We get the same error as we did with the end-to-end test:

                Expected value to equal:
                    ""
                Received:
                    "New message"

Now, we can add the behavior to the component to get this test to pass. To accomplish this, we’ll need to make the input a controlled component, so its text is available in the parent component’s state:

                export default class NewMessageForm extends Component {
                +  state = { inputText: '' }
                +
                +  handleTextChange = (event) => {
                +    this.setState({ inputText: event.target.value });
                +  }
                +
                render() {
                +    const { inputText } = this.state;
                    return (
                    <div>
                        <input
                        type="text"
                        data-testid="messageText"
                +          value={inputText}
                +          onChange={this.handleTextChange}
                        />
                        <button
                        data-testid="sendButton"
                        >

Next, we want to clear out inputText when the send button is clicked:

                handleTextChange = (event) => {
                    this.setState({ inputText: event.target.value });
                }

                +  handleSend = () => {
                +    this.setState({ inputText: '' });
                +  }
                +
                render() {
                ...
                        <button
                        data-testid="sendButton"
                +          onClick={this.handleSend}
                        >
                        Send
                        </button>

Rerun the component test and it passes. **Once a component test passes, step back up to the outer end-to-end test to see what the next error is.** Rerun creating_a_message.spec.js. Now our final assertion fails:

                Expected to find content: 'New message' but never did.

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won’t be responsible for displaying this message, though: we’ll create a separate MessageList component that also exists in the parent App component. The way we can send data to the parent component is by taking in an event handler and calling it.

To add this event handler behavior to NewMessageForm, we want to step back down to the component test. In this case, the component test won’t be asserting exactly the same thing as the end-to-end test. The end-to-end test is looking for the ‘New message’ content on the screen, but the component test will only be asserting the behavior that the NewMessageForm component is responsible for: that it calls the event handler.

Add another test case to NewMessageForm.spec.js:

                afterEach(cleanup);

                describe('clicking the send button', () => {
                +    let sendHandler;
                +
                    beforeEach(() => {
                +      sendHandler = jest.fn();
                -      ({ getByTestId } = render(<NewMessageForm />));
                +      ({ getByTestId } = render(<NewMessageForm onSend={sendHandler} />));

                    fireEvent.change(
                ...
                    it('clears the text field', () => {
                    expect(getByTestId('messageText').value).toEqual('');
                    });
                +
                +    it('calls the send handler', () => {
                +      expect(sendHandler).toHaveBeenCalledWith('New message');
                +    });
                });
                });

Notice that we **make one assertion per test in component tests.** Having separate test cases for each behavior of the component makes it easy to understand what it does, and easy to see what went wrong if one of the assertions fails. The beforeEach block will run through the same steps for each of the two test cases below.

You may recall that this isn’t what we did in the end-to-end test, though. Generally you **make multiple assertions per test in end-to-end tests.** Why? End-to-end tests are slower, so the overhead of the repeating the steps would significantly slow down our suite as it grows. In fact, larger end-to-end tests tend to turn into “feature tours:” you perform some actions, do some assertions, perform some more actions, do more assertions, etc.

Run the component test again. You’ll see the “clears the text field” test pass, and the new ‘emits the “send” event’ test fail with the error:

                Expected mock function to have been called with:
                ["New message"]
                But it was not called.

So the sendHandler isn’t being called. Let’s fix that:

                handleSend = () => {
                +    const { inputText } = this.state;
                +    const { onSend } = this.props;
                +
                +    onSend(inputText);
                +
                    this.setState({ inputText: '' });
                }

Now the component test passes. That’s great! Now we step back up again to run our feature test and we get:

                Uncaught TypeError: onSend is not a function

We changed NewMessageForm to use an onSend event handler, but we haven’t passed one to our NewMessageForm in our production code. Let’s add an empty one to get past this error:

                class App extends Component {
                +  handleSend = (newMessage) => {
                +  }
                +
                render() {
                    return (
                    <div>
                -        <NewMessageForm />
                +        <NewMessageForm onSend={this.handleSend} />
                    </div>
                    );
                }

Rerun the e2e test and we get:

                Expected to find content: ‘New message’ but never did.

We no longer get the onSend error–now we’re back to the same assertion failure, because we’re still not displaying the message. But we’re a step closer!

### A List

Next, we need to save the message in state in the App component. Let’s add it to an array:

                import NewMessageForm from './NewMessageForm';

                    class App extends Component {
                    +  state = { messages: [] };
                    +
                    handleSend = (newMessage) => {
                    +    this.setState(state => ({
                    +      messages: [newMessage, ...state.messages],
                    +    }));
                    }

                render() {

Next, to display the messages, let’s create another custom component to keep our App component nice and simple. We’ll call it MessageList. We’ll write the code we wish we had in App.js:

                    import React, { Component } from 'react';
                    import NewMessageForm from './NewMessageForm';
                    +import MessageList from './MessageList';

                        class App extends Component {
                        ...

                        render() {
                        +    const { messages } = this.state;
                            return (
                            <div>
                                <NewMessageForm onSend={this.handleSend} />
                        +        <MessageList data={messages} />
                            </div>
                            );
                    }

Next, we’ll create MessageList.js and add an empty implementation. Since this component won’t have any state, it can be a functional component instead of a class component:

                    import React from 'react';

                    const MessageList = ({ data }) => (
                    <div />
                    );

                    export default MessageList;

Rerun the tests, and, as we expect, we still aren’t displaying the message. But now that we have a MessageList component, we’re ready to finally implement that and make the test pass:

                    import React from 'react';

                        const MessageList = ({ data }) => (
                        -  <div />
                        +  <ul>
                        +    { data.map(message => <li key={message}>{message}</li>) }
                        +  </ul>
                        );

                    export default MessageList;

Rerun the tests and they pass. We’ve let the tests drive our first feature!

Let’s load up the app in a regular browser: go to http://localhost:3000. Well, it works, but it’s not the prettiest thing in the world. But now we can add styling.

### Why TDD?

What have we gained by using outside-in Test-Driven Development?

- *Confidence it works.* Unit or component tests are great to specify the functionality of functions or classes, but the app can still crash or do the wrong thing when they’re connected together. An end-to-end test confirms that all the pieces connect in the right way.
- *Input on our design.* Our component test confirms that the way we interact with NewMessageForm is simple. If it was complex, our component test would have been harder to write.
- *100% test coverage.* By only writing the minimal code necessary to pass each error, this ensures we don’t have any code that isn’t covered by a test. This avoids the situation where a change we make breaks untested code.
- *Minimal code.* We’ve built the minimal features that pass our test. This has helped us avoid to speculate on features the code might need in the future, that increase our maintenance cost without adding any benefit.
- *Ability to refactor.* Because we have 100% test coverage, we can make changes to our code to improve its design to handle future requirements. Our code doesn’t develop cruft that makes it complex to work within.
- *Ability to ship quickly.* We aren’t spending time building code our users don’t need. When some old code is slowing us down, we can refactor it to make it quicker to work with. And our tests reduce the amount of manual testing we need to do before a release.

End-to-end testing has had major payoffs for server-rendered apps, and with Cypress you can see the same benefits in client-side frameworks like React.

### More Resources
To learn more about TDD, I recommend:

 - https://www.youtube.com/playlist?list=PLXXnezSEtvNMlfJFd1Z2wilxymcOaVl9Q (React TDD Videos)
 - https://javascriptplayground.com/testing-react-enzyme-jest/ (Testing with React Enzyme Jest)

(Credit for this exercise and resource goes to @CodingItWrong, thank you!)

