import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Film,
  Plus,
  List,
  Tv,
  Package,
  Settings,
  FishingHook,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/animes", icon: List, label: "All Animes" },
    { path: "/add-anime", icon: Film, label: "Add Anime" },
    { path: "/add-links", icon: FishingHook, label: "Add Links" },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">InfinityBase Admin</h1>
        <p className="text-gray-400 text-sm">Anime Management</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
