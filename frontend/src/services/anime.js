import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class AnimeApi {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async addAnime(data) {
    const res = await this.api.post("/add/anime", data);
    return res.data.data;
  }

  async updateAnime(anime_id, data) {
    const res = await this.api.put(`/anime/${anime_id}`, data);
    return res.data.data;
  }

  async addSeason(anime_id, data) {
    const res = await this.api.post(`/anime/${anime_id}/add/season`, data);
    return res.data.data;
  }

  async updateSeason(season_id, data) {
    const res = await this.api.put(`/season/${season_id}`, data);
    return res.data.data;
  }

  async addEpisode(season_id, data) {
    const res = await this.api.post(`/season/${season_id}/add/episode`, data);
    return res.data.data;
  }

  async addPack(season_id, data) {
    const res = await this.api.post(`season/${season_id}/add/pack`, data);
    return res.data.data;
  }

  async updateEpisode(episode_id, data) {
    const res = await this.api.put(`/episode/${episode_id}`, data);
    return res.data.data;
  }

  async addEpisodes(season_id, data) {
    const res = await this.api.post(`/season/${season_id}/add/episodes`, data);
    return res.data.data;
  }

  async listAnime(filters) {
    const params = new URLSearchParams(filters);
    const url = "/list/anime?" + params.toString();
    const res = await this.api.get(url);
    return res.data.data;
  }

  async getAnimeById(anime_id) {
    const res = await this.api.get(`/anime/${anime_id}`);
    return res.data.data;
  }

  async getSeasonById(season_id) {
    const res = await this.api.get(`/season/${season_id}`);
    return res.data.data;
  }

  async getEpisodeById(episode_id) {
    const res = await this.api.get(`/episode/${episode_id}`);
    return res.data.data;
  }
}

export default new AnimeApi();
