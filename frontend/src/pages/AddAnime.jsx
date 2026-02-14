import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Loader from "../components/Loader";
import tmdbApi from "../services/tmdb";
import api from "../services/anime";
import AnimeForm from "../components/AnimeForm";

const AddAnime = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("tv");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await tmdbApi.searchTMDB(query, type);
      setResults(data.results || []);
    } catch (error) {
      alert("Error searching TMDB: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnime = async (tmdbId, title) => {
    const confirmed = window.confirm(
      `Do you want to add "${title}" to Database?`,
    );
    if (!confirmed) return;

    try {
      const response = await api.addAnimeFromTMDB(tmdbId, type);
      alert(response);
      // Remove added item from results
      setResults(results.filter((r) => r.id !== tmdbId));
    } catch (error) {
      alert("Error adding anime: " + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const selectAnime = (a) => {
    const isTv = type === "tv";

    const animeData = {
      type,
      anime_name: isTv ? a.name : a.title,
      backdrop_img: a.backdrop_path,
      backdrop_source: "tmdb",
      poster_img: a.poster_path,
      poster_source: "tmdb",
      anime_rel_date: isTv ? a.first_air_date : a.release_date,
      rating: a.vote_average,
      overview: a.overview,
      anime_tmdb_id: a.id,
      genres: [],
    };

    setSelectedAnime(animeData);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Add Anime from TMDB
      </h1>

      {selectedAnime && (
        <Card>
          <AnimeForm
            data={selectedAnime}
            onCancel={() => setSelectedAnime(null)}
            onSaved={() => setSelectedAnime(null)}
          />
        </Card>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Search Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter anime name..."
              onKeyPress={handleKeyPress}
            />
          </div>
          <div>
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: "tv", label: "TV Show" },
                { value: "movie", label: "Movie" },
              ]}
            />
          </div>
        </div>
        <Button onClick={handleSearch} className="w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Search size={20} />
            <span>Search</span>
          </div>
        </Button>
      </Card>

      {loading && <Loader />}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((anime) => {
            const title = type === "tv" ? anime.name : anime.title;
            const releaseDate =
              type === "tv" ? anime.first_air_date : anime.release_date;
            const imageUrl = tmdbApi.getTMDBImageUrl(
              anime.poster_path,
              "poster",
              "medium",
            );

            return (
              <Card
                key={anime.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-36 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">ID: {anime.id}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Year:{" "}
                      {releaseDate
                        ? new Date(releaseDate).getFullYear()
                        : "N/A"}
                    </p>
                    <Button
                      onClick={() => selectAnime(anime)}
                      variant="success"
                      className="w-full text-sm"
                    >
                      Add to Database
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <Card>
          <p className="text-center text-gray-500">
            No results found. Try a different search query.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AddAnime;
