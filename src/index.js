import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const SONGS_URL = `https://alby-mixtape.fly.dev/index`; // `http://localhost:8080/index`
const UPLOAD_URL = `https://alby-mixtape.fly.dev/upload`; //`http://localhost:8080/upload`

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App songsUrl={SONGS_URL} uploadUrl={UPLOAD_URL}/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
