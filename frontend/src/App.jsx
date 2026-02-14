import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Animes from "./pages/Animes";
import NotFound from "./pages/NotFound";
import AddAnime from "./pages/AddAnime";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/animes" element={<Animes />} />
          <Route path="/add-anime" element={<AddAnime />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes> 
    </Router>
  );
}

export default App;
