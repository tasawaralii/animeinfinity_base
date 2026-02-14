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
                total_episodes,
                season_overview,
                poster_img,
                rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $anime_id,
            $data['season_number'] ?? null,
            $data['season_name'] ?? null,
            $data['season_tmdb_id'] ?? null,
            $data['season_rel_date'] ?? null,
            $data['total_episodes'] ?? 0,
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
            'total_episodes',
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


    public function getOttIdBySid($ott_sid)
    {
        $stmt = $this->db->prepare("SELECT ott_id FROM ott_platforms WHERE ott_sid = ?");
        $stmt->execute([$ott_sid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['ott_id'] : null;
    }

    public function getLanguageIdBySid($language_sid)
    {
        $stmt = $this->db->prepare("SELECT language_id FROM languages WHERE language_sid = ?");
        $stmt->execute([$language_sid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['language_id'] : null;
    }

    public function replaceSeasonDubs($season_id, $dubs)
    {
        $stmt = $this->db->prepare("DELETE FROM season_dubs WHERE season_id = ?");
        $stmt->execute([$season_id]);

        if (!is_array($dubs) || count($dubs) === 0) {
            return true;
        }

        $placeholders = [];
        $values = [];

        foreach ($dubs as $dub) {
            $ott_sid = $dub['ott'] ?? ($dub['ott_sid'] ?? null);
            $language_sid = $dub['language'] ?? ($dub['language_sid'] ?? null);

            if (!$ott_sid || !$language_sid) {
                continue;
            }

            $ott_id = $this->getOttIdBySid($ott_sid);
            $language_id = $this->getLanguageIdBySid($language_sid);

            if (!$ott_id || !$language_id) {
                continue;
            }

            $placeholders[] = "(?, ?, ?)";
            $values[] = $season_id;
            $values[] = $ott_id;
            $values[] = $language_id;
        }

        if (empty($placeholders)) {
            return true;
        }

        $sql = "INSERT INTO season_dubs (season_id, ott_id, language_id) VALUES " . implode(",", $placeholders);
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function get_season_dubs($season_id)
    {
        $stmt = $this->db->prepare("SELECT ott.ott_sid, lang.language_sid 
        FROM season_dubs sd
        JOIN ott_platforms ott ON ott.ott_id = sd.ott_id
        JOIN languages lang ON lang.language_id = sd.language_id
        WHERE sd.season_id = ?");

        $stmt->execute([$season_id]);

        return $stmt->fetchAll();
    }

    public function get_season_packs($season_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM packs WHERE season_id = ?");
        $stmt->execute([$season_id]);
        return $stmt->fetchAll();
    }
}