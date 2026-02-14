import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Animes from "./pages/Animes";
import NotFound from "./pages/NotFound";
import AddAnime from "./pages/AddAnime";
import Anime from "./pages/Anime";
import Season from "./pages/Season";
import Episode from "./pages/Episode";
import AddLink from "./pages/AddLink";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/animes" element={<Animes />} />
          <Route path="/anime/:anime_id" element={<Anime />} />
          <Route path="/add-anime" element={<AddAnime />} />
          <Route path="/season/:season_id" element={<Season />} />
          <Route path="/episode/:episode_id" element={<Episode />} />
          <Route path="/add-links" element={<AddLink />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes> 
    </Router>
  );
}

export default App;
