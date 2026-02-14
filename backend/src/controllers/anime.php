<?php

require_once PROJECT_ROOT . "/src/models/anime.php";
require_once PROJECT_ROOT . "/src/models/season.php";
require_once PROJECT_ROOT . "/src/models/episode.php";
class AnimeController
{

    private $animedb;
    private $seasondb;
    private $episodedb;

    public function __construct()
    {
        $this->animedb = new AnimeDB();
        $this->seasondb = new SeasonDB();
        $this->episodedb = new EpisodeDB();
    }

    public function addAnime($params, $data)
    {
        // Helper::successResponse($data);

        try {
            $anime_id = $this->animedb->addAnime($data);

            if (!$anime_id) {
                throw new Exception("Failed To Insert Anime");
            }

            Helper::successResponse(["status" => "success", "message" => "Anime inserted with ID $anime_id", "anime_id" => $anime_id]);

        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }

    }

    public function getAnimes($params, $data)
    {
        try {
            $animes = $this->animedb->get_animes($data);
            Helper::successResponse($animes);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function getAnimeById($params, $data)
    {
        if (!isset($params['anime_id'])) {
            Helper::errorResponse("No anime_id Given");
        }

        $anime_id = $params['anime_id'];

        try {
            $anime = $this->animedb->getAnimeById($anime_id);
            if (!$anime) {
                Helper::errorResponse("No Anime Found", 404);
            }
            $seasons = $this->animedb->get_anime_seasons($anime_id);

            $res = $anime;
            $res['seasons'] = $seasons;
            Helper::successResponse($res);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addSeasonToAnime($params, $data)
    {
        $anime_id = $params['anime_id'];
        try {
            $season_id = $this->seasondb->insertSeason($anime_id, $data);
            Helper::successResponse(["message" => "Season Inserted with id $season_id", "season_id" => $season_id]);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function getSeasonById($params, $data)
    {
        $season_id = $params['season_id'];
        try {
            $season = $this->seasondb->getSeason($season_id);
            $res = $season;
            $episodes = $this->seasondb->seasonEpisodes($season_id);
            $res['episodes'] = $episodes;
            Helper::successResponse($res);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addEpisodeToSeason($params, $data)
    {
        $season_id = $params['season_id'];
        try {
            $episode_id = $this->episodedb->insertEpisode($season_id, $data);
            Helper::successResponse(["message" => "Episode inserted with ID $episode_id", "episode_id" => $episode_id]);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

}