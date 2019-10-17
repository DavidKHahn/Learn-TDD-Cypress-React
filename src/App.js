import React, { Component } from 'react';
import MessageList from './MessageList';
import NewMessageForm from './NewMessageForm';

class App extends Component {
  state = { messages: [] };

  handleSend = (newMessage) => {
    this.setState(state => ({
      messages: [newMessage, ...state.messages]
    }))
  }

  render() {
    const { messages } = this.state;
    return (
      <div>
        <NewMessageForm onSend={this.handleSend} />
        <MessageList data={messages} />
      </div>
    );
  }
}

export default App;