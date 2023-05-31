import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';

import { Menu } from './menu';

function App() {
    return <Menu />;
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
