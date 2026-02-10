<?php

class SeasonDB
{

    // Table Name: seasons
    // Column Names: season_id, anime_id, season_number, season_name, season_tmdb_id, season_rel_date, season_overview, poster_img, rating
    private $db;
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getSeason($season_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM seasons s WHERE s.season_id = ?");
        $stmt->execute([$season_id]);
        return $stmt->fetch();
    }

    public function seasonEpisodes($season_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM episodes e WHERE e.season_id = ?");
        $stmt->execute([$season_id]);
        return $stmt->fetchAll();
    }
    public function seasonPacks($season_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM packs p WHERE p.season_id = ?");
        $stmt->execute([$season_id]);
        return $stmt->fetchAll();
    }

    public function getEpisodeBySeasonIdAndNumber($season_id, $episode_number)
    {
        $stmt = $this->db->prepare("SELECT * FROM episodes e WHERE e.season_id = ? AND e.episode_number = ?");
        $stmt->execute([$season_id, $episode_number]);
        return $stmt->fetch();
    }

    public function insertSeason($anime_id, $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO seasons (
                anime_id,
                season_number,
                season_name,
                season_tmdb_id,
                season_rel_date,
                season_overview,
                poster_img,
                rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $anime_id,
            $data['season_number'] ?? null,
            $data['season_name'] ?? null,
            $data['season_tmdb_id'] ?? null,
            $data['season_rel_date'] ?? null,
            $data['season_overview'] ?? null,
            $data['poster_img'] ?? null,
            $data['rating'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function updateSeason($season_id, $data)
    {
        $fields = [];
        $values = [];

        $allowedFields = [
            'anime_id',
            'season_number',
            'season_name',
            'season_tmdb_id',
            'season_rel_date',
            'season_overview',
            'poster_img',
            'rating'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $season_id;

        $stmt = $this->db->prepare("
            UPDATE seasons SET " . implode(', ', $fields) . " WHERE season_id = ?
        ");

        $stmt->execute($values);

        return $stmt->rowCount() > 0;
    }
}