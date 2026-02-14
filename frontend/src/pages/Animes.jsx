import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Loader from "../components/Loader";
import api from "../services/anime";
import { Link } from "react-router-dom";

const Animes = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [limit, setLimit] = useState("10");

  useEffect(() => {
    loadAnimes();
  }, []);

  const loadAnimes = async () => {
    setLoading(true);
    try {
      const data = await api.listAnime({ anime_name: search, type, limit });
      setAnimes(data);
      // setAnimes([]);
    } catch (error) {
      console.error("Error loading animes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadAnimes();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Animes</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search animes..."
            />
          </div>
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "tv", label: "TV Show" },
              { value: "movie", label: "Movie" },
            ]}
          />
          <Select
            label="Limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            options={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <Button onClick={handleSearch}>
          <div className="flex items-center gap-2">
            <Search size={20} />
            <span>Search</span>
          </div>
        </Button>
      </Card>

      {loading ? (
        <Loader />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {animes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No animes found
                    </td>
                  </tr>
                ) : (
                  animes.map((anime) => (
                    <tr
                      key={anime.anime_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{anime.anime_id}</td>
                      <td className="py-3 px-4">{anime.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            anime.type === "tv"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {anime.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/anime/${anime.anime_id}`}
                            className="text-sm py-1 border px-2 rounded"
                          >
                            Edit
                          </Link>
                          <Button variant="danger" className="text-sm py-1">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Animes;
