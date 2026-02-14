<?php

class PackDB
{
    private $db;
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function addPack($season_id, $pack_name, $start_ep, $end_ep)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("INSERT INTO content (content_type) VALUES ('pack')");
            $stmt->execute();
            $content_id = $this->db->lastInsertId();

            $stmt = $this->db->prepare("INSERT INTO packs (season_id, pack_name, start_ep, end_ep, content_id) VALUES (?, ?, ?, ?, ?)");

            $stmt->execute([$season_id, $pack_name, $start_ep, $end_ep, $content_id]);
            $pack_id = $this->db->lastInsertId();

            $stmt = $this->db->prepare("UPDATE content SET respective_id = ? WHERE id = ?");
            $stmt->execute([$pack_id, $content_id]);

            $this->db->commit();

            return $pack_id;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}