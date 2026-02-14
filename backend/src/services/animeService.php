<?php

require_once PROJECT_ROOT . "/src/models/anime.php";
class AnimeService
{
    private $animedb;

    public function __construct()
    {
        $this->animedb = new AnimeDB();
    }
    public function getAnimeAjax($filters)
    {
        $res = $this->animedb->get_animes($filters);
        return $res;
    }

    public function getAnimeSeasonsAjax($anime_id)
    {
        $res = $this->animedb->get_anime_seasons($anime_id);
        return $res;
    }
}