import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "link";

class LinkServerApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async getAllAnimes(filters) {
    const params = new URLSearchParams();
    params.append("anime_name", filters.anime_name);
    const url = `/animes?${params.toString()}`;
    const res = await this.api.get(url);
    return res.data.data;
  }

  async getSeasonsOfAnime(anime_id) {
    const res = await this.api.get(`/anime/${anime_id}/seasons`);
    return res.data.data;

  }

  async getEpisodesOfSeason(season_id) {
    const res = await this.api.get(`/season/${season_id}/episodes`);
    return res.data.data;
  }

  async getPacksOfSeason(season_id) {
    const res = await this.api.get(`/season/${season_id}/packs`);
    return res.data.data;
  }

  async addLinkToEpisode(content_id, gdrive_id) {
    const res = await this.api.post(`/episode/${content_id}`, { gdrive_id });
    return res.data.data.link;
  }

  async addLinkToMovie(content_id, gdrive_id) {
    const res = await this.api.post(`/movie/${content_id}`, { gdrive_id });
    return res.data.data.link;
  }

  async addLinkToSeason(season_id, gdrive_id, extract_mode) {
    const res = await this.api.post(`/season/${season_id}`, {
      gdrive_id,
      extract_mode,
    });
    return res.data.data.link;

  }
  async addLinkToPack(content_id, gdrive_id) {
    const res = await this.api.post(`/pack/${content_id}`, { gdrive_id });
    return res.data.data.link;
  }

  async fetchFilesFromFolder(folder_id) {
    const query = new URLSearchParams();
    query.append("gdrive_folder_id", folder_id);

    const endpoint = "/drive/fetch-folder?" + query.toString();
    const res = await this.api.get(endpoint);
    return res.data.data;
  }
}

export default new LinkServerApiService();
