import fetch from 'node-fetch';

fetch('http://localhost:5000/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error); 