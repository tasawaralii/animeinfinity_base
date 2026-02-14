import axios from "axios";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function extractTmdbSeasonId(tmdbSeasonId) {
  const match = tmdbSeasonId.match(/^(\d+)-S(\d+)$/);

  if (!match) {
    throw new Error("Invalid tmdbSeasonId format");
  }

  const [, anime_id, season_number] = match;

  return {
    anime_id: Number(anime_id),
    season_number: Number(season_number),
  };
}

class TMDBApiService {
  constructor() {
    this.tmdb = axios.create({
      baseURL: TMDB_BASE_URL,
    });
  }

  // TMDB API Methods
  async searchTMDB(query, type = "tv") {
    try {
      const response = await this.tmdb.get(`/search/${type}`, {
        params: {
          api_key: TMDB_API_KEY,
          query: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error("TMDB Search Error:", error);
      throw error;
    }
  }

  async getTMDBDetails(id, type = "tv") {
    try {
      const response = await this.tmdb.get(`/${type}/${id}`, {
        params: {
          api_key: TMDB_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error("TMDB Details Error:", error);
      throw error;
    }
  }

  async getTMDBSeasonDetails(tmdbSeasonId) {
    const { anime_id, season_number } = extractTmdbSeasonId(tmdbSeasonId);
    const res = await this.tmdb.get(`/tv/${anime_id}/season/${season_number}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return res.data;
  }

  async getEpisodeGroups(tmdb_id) {
    const res = await this.tmdb.get(`/tv/${tmdb_id}/episode_groups`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return res.data.results;
  }

  async getGroup(tv_episode_group_id) {
    const res = await this.tmdb.get(`tv/episode_group/${tv_episode_group_id}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    return res.data.groups;
  }

  // Get image URL helper
  getTMDBImageUrl(path, type = "poster", size = "w500") {
    if (!path) return null;
    const sizeMap = {
      poster: {
        small: "w92",
        medium: "w185",
        large: "w500",
        original: "original",
      },
      backdrop: {
        small: "w300",
        medium: "w780",
        large: "w1280",
        original: "original",
      },
      still: {
        small: "w300",
        medium: "w780",
        large: "w1280",
        original: "original",
      },
    };
    const imageSize = sizeMap[type][size] || sizeMap[type].medium;
    return `https://image.tmdb.org/t/p/${imageSize}${path}`;
  }
}

export default new TMDBApiService();
