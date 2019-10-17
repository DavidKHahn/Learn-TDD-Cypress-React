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