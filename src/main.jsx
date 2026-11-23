import { createRoot } from 'react-dom/client';
import './styles/base.css';
import { Deck } from './deck/Deck.jsx';

createRoot(document.getElementById('root')).render(<Deck />);
