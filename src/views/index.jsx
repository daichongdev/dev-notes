import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../components/App';
import '../styles/index.css';
import '../styles/modern.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);