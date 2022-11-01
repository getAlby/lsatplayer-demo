import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


const SONGS_URL = `https://alby-mixtape.fly.dev/index`; // `http://localhost:8080/index`
const UPLOAD_URL = `https://alby-mixtape.fly.dev/upload`; //`http://localhost:8080/upload`


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App songsUrl={SONGS_URL} uploadUrl={UPLOAD_URL}/>} />
    </Routes>
  </BrowserRouter>
);
