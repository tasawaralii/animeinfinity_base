<?php

class AnimeDB
{
    // tablename = animes
    // columns = slug, anime_tmdb_id , anime_name ,backdrop_source, backdrop_img, poster_source, poster_img, age_id , overview, duration, rating, type, anime_rel_date, links_update, content_id
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }
    public function get_animes($filters, $limit = 20)
    {
        $whereClause = [];
        $whereParams = [];

        if (isset($filters['anime_name'])) {
            $whereClause[] = "a.anime_name LIKE ?";
            $whereParams[] = "%{$filters['anime_name']}%";
        }

        $whereCondition = count($whereClause) > 0 ? " WHERE " . implode(" AND ", $whereClause) : "";

        $stmt = $this->db->prepare("SELECT a.anime_id, a.anime_name as name, a.content_id, a.type FROM animes a {$whereCondition} LIMIT $limit");

        $stmt->execute($whereParams);

        $res = $stmt->fetchAll();
        return $res;

    }
    public function get_anime_seasons($anime_id)
    {
        $stmt = $this->db->prepare("SELECT s.season_id, s.season_name, s.season_number FROM seasons s WHERE s.anime_id = ?");
        $stmt->execute([$anime_id]);
        $res = $stmt->fetchAll();
        return $res;
    }

    public function addAnime($data)
    {
        try {

            if (empty($data['anime_name'])) {
                throw new InvalidArgumentException('Anime name is required');
            }

            $this->db->beginTransaction();

            $stmt = $this->db->prepare(
                "INSERT INTO content (content_type) VALUES ('movie')"
            );
            $stmt->execute();

            $content_id = $this->db->lastInsertId();

            $slug = !empty($data['slug']) ? $data['slug'] : null;

            if ($slug === null && !empty($data['anime_name'])) {
                $slug = Helper::slugify($data['anime_name']);
            }

            $duration = !empty($data['duration'])
                ? (int) $data['duration']
                : 0;

            $stmt = $this->db->prepare("
            INSERT INTO animes (
                slug,
                anime_tmdb_id,
                anime_name,
                backdrop_source,
                backdrop_img,
                poster_source,
                poster_img,
                age_id,
                overview,
                duration,
                rating,
                type,
                anime_rel_date,
                links_update,
                content_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

            $stmt->execute([
                $slug,
                $data['anime_tmdb_id'] ?? null,
                $data['anime_name'] ?? null,
                $data['backdrop_source'] ?? null,
                $data['backdrop_img'] ?? null,
                $data['poster_source'] ?? null,
                $data['poster_img'] ?? null,
                $data['age_id'] ?? null,
                $data['overview'] ?? null,
                $duration,
                $data['rating'] ?? null,
                $data['type'] ?? null,
                $data['anime_rel_date'] ?? null,
                $data['links_update'] ?? null,
                $content_id
            ]);

            $anime_id = $this->db->lastInsertId();

            $stmt = $this->db->prepare(
                "UPDATE content SET respective_id = ? WHERE id = ?"
            );
            $stmt->execute([$anime_id, $content_id]);

            $this->db->commit();

            return $anime_id;

        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }


    public function updateAnime($anime_id, $data)
    {

        if (!isset($data['slug']) && isset($data['anime_name'])) {
            $data['slug'] = Helper::slugify($data['anime_name']);
        }

        $fields = [];
        $values = [];

        $allowedFields = [
            'slug',
            'anime_tmdb_id',
            'anime_name',
            'backdrop_source',
            'backdrop_img',
            'poster_source',
            'poster_img',
            'age_id',
            'overview',
            'duration',
            'rating',
            'type',
            'anime_rel_date',
            'links_update',
            'content_id'
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

        $values[] = $anime_id;

        $stmt = $this->db->prepare("
            UPDATE animes SET " . implode(', ', $fields) . " WHERE anime_id = ?
        ");

        $stmt->execute($values);

        return $stmt->rowCount() > 0;
    }

    public function deleteAnime($anime_id)
    {
        $stmt = $this->db->prepare("DELETE FROM animes WHERE anime_id = ?");
        $stmt->execute($anime_id);
    }

    public function getAnimeById($anime_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM animes WHERE anime_id = ?");
        $stmt->execute([$anime_id]);
        $res = $stmt->fetch();
        return $res;
    }

    public function addGenresToAnime($anime_id, $genres)
    {
        $genre_ids = [];

        foreach ($genres as $g) {
            $genre_id = $this->getGenreIdBySid($g);
            if ($genre_id) {
                $genre_ids[] = $genre_id;
            }
        }

        if (empty($genre_ids)) {
            return false;
        }

        $genre_ids = array_unique($genre_ids);

        $placeholders = [];
        $values = [];

        foreach ($genre_ids as $gid) {
            $placeholders[] = "(?, ?)";
            $values[] = $anime_id;
            $values[] = $gid;
        }

        $sql = "INSERT INTO anime_genres (anime_id, genre_id) VALUES " . implode(",", $placeholders);

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }


    public function getGenreIdBySid($genre_sid)
    {
        $sql = "SELECT genre_id FROM genres WHERE genre_sid = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$genre_sid]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $row['genre_id'] : null;
    }

    public function getGenresOfAnime($anime_id)
    {
        $stmt = $this->db->prepare(
            "SELECT g.genre_sid 
         FROM anime_genres ag 
         JOIN genres g ON g.genre_id = ag.genre_id
         WHERE ag.anime_id = ?"
        );

        $stmt->execute([$anime_id]);

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function replaceGenresForAnime($anime_id, $genres)
    {
        $stmt = $this->db->prepare("DELETE FROM anime_genres WHERE anime_id = ?");
        $stmt->execute([$anime_id]);

        if (!is_array($genres) || count($genres) === 0) {
            return true;
        }

        return $this->addGenresToAnime($anime_id, $genres);
    }

}