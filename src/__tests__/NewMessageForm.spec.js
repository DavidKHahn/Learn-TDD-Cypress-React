import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
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
