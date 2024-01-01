import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import InfoBar from '../InfoBar/InfoBar';
import './Chat.css';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;
const Chat = () => {

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ENDPOINT = 'http://localhost:5000';
  // const ENDPOINT = 'https://mernchatappbackend-8ngn.onrender.com/';

  const location = useLocation();
  useEffect(() => {

    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);
    setName(name);
    setRoom(room);

    socket.emit('join', { name, room }, () => {

    })

    return () => {
      socket.disconnect();
      socket.off();
    }

  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, message]);
    })

  }, [messages]);

  //function for sending messages

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  console.log(message, messages)

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      
    </div>
  )
}

export default Chat
