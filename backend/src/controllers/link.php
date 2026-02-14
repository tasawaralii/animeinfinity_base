<?php

require_once PROJECT_ROOT . "/src/services/addLinkService.php";
require_once PROJECT_ROOT . "/src/services/animeService.php";
require_once PROJECT_ROOT . "/src/models/season.php";
require_once PROJECT_ROOT . "/src/models/link_server.php";
class LinkController
{
    private $linkService;
    private $animeService;
    private $seasondb;

    private $linkServerdb;

    public function __construct()
    {
        $this->linkService = new AddLinkService();
        $this->animeService = new AnimeService();
        $this->seasondb = new SeasonDB();
        $this->linkServerdb = new LinkServerDB();

    }
    public function addLink($params, $data)
    {
        if (!isset($params['content_id'])) {
            Helper::errorResponse("No Content_id Given", 400);
        }
        if (!isset($data['gdrive_id'])) {
            Helper::errorResponse($data['Not Google Drive ID Provided'], 400);
        }

        $content_id = $params['content_id'];
        $gdrive_id = $data['gdrive_id'];

        try {
            $res = $this->linkService->addLink($content_id, $gdrive_id, $data);
            Helper::successResponse($res);
        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function addSeasonEpisodeLink($params, $data)
    {
        if (!isset($params['season_id'])) {
            Helper::errorResponse("No season_id Given", 400);
        }
        if (!isset($data['gdrive_id'])) {
            Helper::errorResponse($data['Not Google Drive ID Provided'], 400);
        }
        if (!isset($data['extract_mode'])) {
            Helper::errorResponse("No mode given for extracting episode number");
        }

        $season_id = $params['season_id'];
        $gdrive_id = $data['gdrive_id'];
        $mode = $data['extract_mode'];

        $metadata = Helper::fetchGdriveFile($gdrive_id);
        $name = $metadata['name'];

        $episode_number = Helper::findEpisode($name, $mode);

        if (!$episode_number) {
            Helper::errorResponse("Not Able to find Number with mode $mode");
        }

        $episode = $this->seasondb->getEpisodeBySeasonIdAndNumber($season_id, $episode_number);

        if (!isset($episode['content_id'])) {
            Helper::errorResponse("Episode $episode_number Not Found");
        }

        $content_id = $episode['content_id'];

        try {
            $res = $this->linkService->addLink($content_id, $gdrive_id, $data);
            Helper::successResponse($res);
        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function fetchFolderFiles($params, $data)
    {
        if (!isset($data['gdrive_folder_id'])) {
            Helper::errorResponse('Not Folder ID Provided', 400);
        }

        $gdrive_folder_id = $data['gdrive_folder_id'];

        $files = Helper::getFolderFiles($gdrive_folder_id);

        $res = [];

        foreach ($files as $f) {
            if ($f['kind'] == "drive#file") {
                $res[] = "https://drive.google.com/file/d/{$f['id']}";
            }
        }

        Helper::successResponse($res);

    }
    public function getAnimes($params, $data)
    {
        try {
            $res = $this->animeService->getAnimeAjax($data);
            Helper::successResponse($res);
        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function getSeasons($params, $data)
    {
        if (!isset($params['anime_id'])) {
            Helper::errorResponse("No anime_id Given", 400);
        }
        $anime_id = $params['anime_id'];
        try {

            $seasons = $this->animeService->getAnimeSeasonsAjax($anime_id);

            $res = [];

            foreach ($seasons as $s) {
                $res[] = [
                    "season_id" => $s['season_id'],
                    "name" => "Season " . $s['season_number'],
                    "type" => "season"
                ];
            }

            Helper::successResponse($res);

        } catch (Throwable $e) {
            Helper::errorResponse($e->getMessage());
        }
    }

    public function getEpisodes($params, $data)
    {
        if (!isset($params['season_id'])) {
            Helper::errorResponse("No season_id Given", 400);
        }

        $season_id = $params['season_id'];

        $episodes = $this->seasondb->seasonEpisodes($season_id);

        $res = [];

        foreach ($episodes as $e) {
            $res[] = [
                "episode_id" => $e['episode_id'],
                "name" => "Episode " . $e['episode_number'],
                "type" => "episode",
                "content_id" => $e['content_id']
            ];
        }

        Helper::successResponse($res);

    }

    public function getPacks($params, $data)
    {
        if (!isset($params['season_id'])) {
            Helper::errorResponse("No season_id Given", 400);
        }
        $season_id = $params['season_id'];

        $packs = $this->seasondb->seasonPacks($season_id);

        $res = [];

        foreach ($packs as $p) {
            $res[] = [
                "pack_id" => $p['pack_id'],
                "name" => "Pack E{$p['start_ep']} - E{$p['end_ep']}",
                "type" => "pack",
                "content_id" => $p['content_id']
            ];
            ;
        }

        Helper::successResponse($res);

    }

    public function getServers($params, $data)
    {
        if (!isset($params['link_id'])) {
            Helper::errorResponse("No link_id Provided");
        }

        $link_id = $params['link_id'];
        $servers = $this->linkServerdb->get_link_servers_by_link_db($link_id);

        Helper::successResponse($servers);

    }
}