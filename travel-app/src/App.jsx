import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <div><h1>Home Page</h1><Link to="/about">Go to About</Link></div>;
}

function About() {
  return <div><h1>About Page</h1><Link to="/">Go to Home</Link></div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
