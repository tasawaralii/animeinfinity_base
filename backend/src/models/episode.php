<?php

class EpisodeDB
{
    // Table Name: episodes
    // Columns: episode_id, season_id, episode_name, note, episode_number, part ,	img, air_date, overview, content_id
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getEpisode($episode_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM episodes WHERE episode_id = ?");
        $stmt->execute([$episode_id]);
        return $stmt->fetch();
    }

    public function insertEpisode($season_id, $data)
    {
        try {

            $stmt = $this->db->prepare("INSERT INTO content (content_type) VALUES ('episode')");
            $stmt->execute();

            $content_id = $this->db->lastInsertId();

            $stmt = $this->db->prepare("
                INSERT INTO episodes (
                    season_id,
                    episode_name,
                    note,
                    episode_number,
                    episode_runtime,
                    episode_rating,
                    part,
                    img,
                    air_date,
                    overview,
                    content_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $season_id,
                $data['episode_name'] ?? null,
                $data['note'] ?? null,
                $data['episode_number'] ?? null,
                $data['episode_runtime'] ?? null,
                $data['episode_rating'] ?? null,
                $data['part'] ?? null,
                $data['img'] ?? null,
                $data['air_date'] ?? null,
                $data['overview'] ?? null,
                $content_id
            ]);

            $episode_id = $this->db->lastInsertId();

            $stmt = $this->db->prepare("UPDATE content SET respective_id = ? WHERE id = ?");
            $stmt->execute([$episode_id, $content_id]);

            return $episode_id;
        } catch (Throwable $e) {
            throw $e;
        }

    }

    public function updateEpisode($episode_id, $data)
    {
        $fields = [];
        $values = [];

        $allowedFields = [
            'season_id',
            'episode_name',
            'note',
            'episode_number',
            'episode_runtime',
            'episode_rating',
            'part',
            'img',
            'air_date',
            'overview',
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

        $values[] = $episode_id;

        $stmt = $this->db->prepare("
            UPDATE episodes SET " . implode(', ', $fields) . " WHERE episode_id = ?
        ");

        $stmt->execute($values);

        return $stmt->rowCount() > 0;

    }

    public function deleteEpisode($episode_id)
    {
        $stmt = $this->db->prepare("SELECT content_id FROM episodes WHERE episode_id = ?");
        $stmt->execute([$episode_id]);
        $res = $stmt->fetch();

        $content_id = $res['content_id'];

        $stmt = $this->db->prepare("DELETE FROM episodes WHERE episode_id = ?");
        $stmt->execute([$episode_id]);

        $stmt = $this->db->prepare("DELETE FROM content WHERE id = ?");
        $stmt->execute([$content_id]);

    }
}