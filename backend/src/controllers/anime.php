<?php

require_once PROJECT_ROOT . "/src/models/anime.php";
require_once PROJECT_ROOT . "/src/models/season.php";
require_once PROJECT_ROOT . "/src/models/episode.php";
require_once PROJECT_ROOT . "/src/models/link.php";
require_once PROJECT_ROOT . "/src/models/pack.php";

class AnimeController
{

    private $animedb;
    private $seasondb;
    private $episodedb;
    private $linkdb;
    private $packdb;
    private $db;

    public function __construct()
    {
        $this->animedb = new AnimeDB();
        $this->seasondb = new SeasonDB();
        $this->episodedb = new EpisodeDB();
        $this->linkdb = new LinkDB();
        $this->packdb = new PackDB();
        $this->db = Database::getInstance()->getConnection();
    }

    public function addAnime($params, $data)
    {
        // Helper::successResponse($data);

        try {
            $anime_id = $this->animedb->addAnime($data);

            if (!$anime_id) {
                throw new Exception("Failed To Insert Anime");
            }

            if (isset($data['genres']) && count($data['genres']) > 0) {
                $this->animedb->addGenresToAnime($anime_id, $data['genres']);
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
            $genres = $this->animedb->getGenresOfAnime($anime_id);

            $res = $anime;
            $res['seasons'] = $seasons;
            $res['genres'] = $genres;

            Helper::successResponse($res);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addSeasonToAnime($params, $data)
    {
        $anime_id = $params['anime_id'];
        try {
            $this->db->beginTransaction();

            $season_id = $this->seasondb->insertSeason($anime_id, $data);

            if (array_key_exists('dubs', $data)) {
                $this->seasondb->replaceSeasonDubs($season_id, $data['dubs']);
            }

            $this->db->commit();
            Helper::successResponse(["message" => "Season Inserted with id $season_id", "season_id" => $season_id]);
        } catch (\Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

    public function updateSeason($params, $data)
    {
        if (!isset($params['season_id'])) {
            Helper::errorResponse("No season_id Given");
        }

        $season_id = $params['season_id'];

        try {
            $this->db->beginTransaction();

            $this->seasondb->updateSeason($season_id, $data);

            if (array_key_exists('dubs', $data)) {
                $this->seasondb->replaceSeasonDubs($season_id, $data['dubs']);
            }

            $this->db->commit();

            Helper::successResponse([
                "status" => "success",
                "message" => "Season updated with ID $season_id",
                "season_id" => $season_id
            ]);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

    public function updateAnime($params, $data)
    {
        if (!isset($params['anime_id'])) {
            Helper::errorResponse("No anime_id Given");
        }

        $anime_id = $params['anime_id'];

        try {
            $this->db->beginTransaction();

            $this->animedb->updateAnime($anime_id, $data);

            if (array_key_exists('genres', $data)) {
                $this->animedb->replaceGenresForAnime($anime_id, $data['genres']);
            }

            $this->db->commit();

            Helper::successResponse([
                "status" => "success",
                "message" => "Anime updated with ID $anime_id",
                "anime_id" => $anime_id
            ]);
        } catch (Throwable $e) {
            $this->db->rollBack();
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
            $dubs = $this->seasondb->get_season_dubs($season_id);
            $packs = $this->seasondb->get_season_packs($season_id);

            $res['episodes'] = $episodes;
            $res['dubs'] = $dubs;
            $res['packs'] = $packs;
            Helper::successResponse($res);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addEpisodeToSeason($params, $data)
    {
        $season_id = $params['season_id'];
        try {
            $this->db->beginTransaction();
            $episode_id = $this->episodedb->insertEpisode($season_id, $data);
            $this->db->commit();
            Helper::successResponse(["message" => "Episode inserted with ID $episode_id", "episode_id" => $episode_id]);
        } catch (\Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addPackToSeason($params, $data)
    {
        try {
            $season_id = $params['season_id'];
            $start_ep = $data['start_ep'];
            $end_ep = $data['end_ep'];
            $pack_name = isset($data['pack_name']) && $data['pack_name'] != "" ? $data['pack_name'] : "Episode {$start_ep} - Episode {$end_ep}";

            $pack_id = $this->packdb->addPack($season_id, $pack_name, $start_ep, $end_ep);

            if ($pack_id) {
                Helper::successResponse(["status" => "success", "message" => "Pack inserted with is {$pack_id}"]);
            } else {
                Helper::errorResponse("Failed to Add Pack");
            }

        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());

        }

    }

    public function updateEpisode($params, $data)
    {
        if (!isset($params['episode_id'])) {
            Helper::errorResponse("No episode_id Given");
        }

        $episode_id = $params['episode_id'];

        try {
            $this->db->beginTransaction();
            $this->episodedb->updateEpisode($episode_id, $data);
            $this->db->commit();

            Helper::successResponse([
                "status" => "success",
                "message" => "Episode updated with ID $episode_id",
                "episode_id" => $episode_id
            ]);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addEpisodesToSeason($params, $data)
    {
        if (!is_array($data['episodes'])) {
            Helper::errorResponse("Expected Array of Episodes", 403);
        }

        $season_id = $params['season_id'];
        $episodes = $data['episodes'];
        try {

            $episodesRes = [];

            $this->db->beginTransaction();

            foreach ($episodes as $ep) {
                $episode_id = $this->episodedb->insertEpisode($season_id, $ep);
                $episodesRes[] = $episode_id;
            }

            $this->db->commit();

            Helper::successResponse([
                "status" => "success",
                "episodes" => $episodesRes
            ]);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

    public function getEpisodeById($params, $data)
    {
        $episode_id = $params['episode_id'];
        try {
            $res = [];
            $episode = $this->episodedb->getEpisode($episode_id);
            $content_id = $episode['content_id'];
            $links = $this->linkdb->getLinksOfContent($content_id);
            $res = $episode;
            $res['links'] = $links;
            Helper::successResponse($res);
        } catch (\Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addDefaultEpisodesToSeason($params, $data)
    {
        if (!is_array($data['episodes'])) {
            Helper::errorResponse("Expected Array of Episodes", 403);
        }

        $season_id = $params['season_id'];
        $episodes = $data['episodes'];
        try {

            $episodesRes = [];

            $this->db->beginTransaction();

            foreach ($episodes as $episode_number) {
                $episode_id = $this->episodedb->insertDefaultEpisode($season_id, $episode_number);
                $episodesRes[] = $episode_id;
            }

            $this->db->commit();

            Helper::successResponse([
                "status" => "success",
                "episodes" => $episodesRes
            ]);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Helper::errorResponse($e->getMessage());
        }
    }

}