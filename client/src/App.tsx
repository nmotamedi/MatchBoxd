import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Heading } from './components/Heading';
import { Home } from './pages/Home';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Heading />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
