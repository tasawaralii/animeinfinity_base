import { Film, Tv, Package, Plus } from "lucide-react";
import Card from "../components/Card";

const Home = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/add-anime"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <Plus size={20} className="text-blue-600" />
              <span className="text-gray-700">Add Anime from TMDB</span>
            </a>
            <a
              href="/animes"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <Tv size={20} className="text-green-600" />
              <span className="text-gray-700">List Animes</span>
            </a>
            <a
              href="/add-links"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <Package size={20} className="text-purple-600" />
              <span className="text-gray-700">Add Links</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
