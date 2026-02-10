<?php
// header("Access-Control-Allow-Origin: http://localhost:5173");
// header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("content-type: application/json");
define("PROJECT_ROOT", __DIR__);

require_once "./env.php";
require_once "./src/lib/Router.php";
require_once "./src/lib/Helper.php";
require_once "./src/lib/Database.php";

$router = new Router();

$router->get("/", function () {
    Helper::successResponse("Working");
});


$router->post("/add/anime", [$animeController, "addAnime"]);
$router->get("/list/anime", [$animeController, "getAnimes"]);
$router->get("/anime/{anime_id}", [$animeController, "getAnimeById"]);
$router->post("/anime/{anime_id}/add/season", [$animeController, "addSeasonToAnime"]);

$router->get("/season/{season_id}", [$animeController, 'getSeasonById']);
$router->post("/season/{season_id}/add/episode", [$animeController, "addEpisodeToSeason"]);

$router->resolve();