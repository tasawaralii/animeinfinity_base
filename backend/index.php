<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define("PROJECT_ROOT", __DIR__);

require_once "./env.php";
require_once "./src/lib/Router.php";
require_once "./src/lib/Helper.php";
require_once "./src/lib/Database.php";
require_once "./src/controllers/anime.php";
require_once "./src/controllers/cron.php";
require_once "./src/controllers/link.php";
require_once "./src/controllers/upload.php";

$router = new Router();
$linkController = new LinkController();
$uploadController = new UploadController();
$cronController = new CronController();
$animeController = new AnimeController();


$router->get("/", function () {
    Helper::successResponse("Working");
});


$router->get("/link/animes", [$linkController, "getAnimes"]);
$router->get("/link/anime/{anime_id}/seasons", [$linkController, "getSeasons"]);
$router->get("/link/season/{season_id}/episodes", [$linkController, "getEpisodes"]);
$router->get("/link/season/{season_id}/packs", [$linkController, "getPacks"]);

$router->get("/link/drive/fetch-folder", [$linkController, "fetchFolderFiles"]);

$router->post("/link/movie/{content_id}", [$linkController, "addLink"]);
$router->post("/link/episode/{content_id}", [$linkController, "addLink"]);
$router->post("/link/season/{season_id}", [$linkController, "addSeasonEpisodeLink"]);
$router->post("/link/pack/{content_id}", [$linkController, "addLink"]);

$router->get("/links", [$uploadController, "getLinks"]);
$router->get("/links/{link_id}", [$uploadController, "getLink"]);
$router->get("/links/{link_id}/servers", [$linkController, "getServers"]);

$router->post("/add/server/{server_sid}/link/{link_id}", [$uploadController, "addServer"]);

$router->post("/add/anime", [$animeController, "addAnime"]);
$router->get("/list/anime", [$animeController, "getAnimes"]);
$router->get("/anime/{anime_id}", [$animeController, "getAnimeById"]);
$router->put("/anime/{anime_id}", [$animeController, "updateAnime"]);
$router->post("/anime/{anime_id}/add/season", [$animeController, "addSeasonToAnime"]);

$router->get("/season/{season_id}", [$animeController, 'getSeasonById']);
$router->put("/season/{season_id}", [$animeController, 'updateSeason']);
$router->post("/season/{season_id}/add/episode", [$animeController, "addEpisodeToSeason"]);
$router->post("/season/{season_id}/add/episodes", [$animeController, "addEpisodesToSeason"]);
$router->post("/season/{season_id}/add/default-episodes", [$animeController, "addDefaultEpisodesToSeason"]);
$router->post("/season/{season_id}/add/pack", [$animeController, "addPackToSeason"]);

$router->get("/episode/{episode_id}", [$animeController, "getEpisodeById"]);
$router->put("/episode/{episode_id}", [$animeController, "updateEpisode"]);

$router->resolve();