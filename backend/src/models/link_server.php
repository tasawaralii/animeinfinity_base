<?php

class LinkServerDB
{

    // Table Name: link_servers
    // Columns : ser_link_id , link_id (References links.link_id), server_id (References server_info.server_id), slug 

    private $db;
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function insert_link_server_db($link_id, $server_id, $slug)
    {
        $stmt = $this->db->prepare("
            INSERT INTO link_servers (link_id, server_id, is_uploaded, slug) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                slug = VALUES(slug)
        ");

        $stmt->execute([
            $link_id,
            $server_id,
            1,
            $slug
        ]);

        return $this->db->lastInsertId();
    }

    public function mark_uploaded($link_id, $server_id)
    {
        $stmt = $this->db->prepare("
        INSERT INTO link_servers (link_id, server_id, is_uploaded, slug) 
        VALUES (?, ?, ?, ?)
    ");

        $stmt->execute([
            $link_id,
            $server_id,
            1,
            ''
        ]);

        return $this->db->lastInsertId();
    }
    public function update_link_server_db($ser_link_id, $data)
    {
        $fields = [];
        $values = [];

        $allowedFields = ['link_id', 'server_id', 'slug'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $ser_link_id;

        $stmt = $this->db->prepare("
            UPDATE link_servers SET " . implode(', ', $fields) . " WHERE ser_link_id = ?
        ");

        $stmt->execute($values);

        return $this->get_link_server_db($ser_link_id);
    }

    public function delete_link_server_db($ser_link_id)
    {
        $stmt = $this->db->prepare("DELETE FROM link_servers WHERE ser_link_id = ?");
        $stmt->execute([$ser_link_id]);
    }

    public function get_link_server_db($ser_link_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM link_servers WHERE ser_link_id = ?");
        $stmt->execute([$ser_link_id]);
        $res = $stmt->fetch();
        return $res;
    }

    public function get_all_link_servers_db($filters = [])
    {
        $whereConditions = [];
        $whereParams = [];

        if (isset($filters['link_id'])) {
            $whereConditions[] = "link_id = ?";
            $whereParams[] = $filters['link_id'];
        }

        if (isset($filters['server_id'])) {
            $whereConditions[] = "server_id = ?";
            $whereParams[] = $filters['server_id'];
        }

        if (isset($filters['slug'])) {
            $whereConditions[] = "slug = ?";
            $whereParams[] = $filters['slug'];
        }

        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

        $limit = isset($filters['limit']) ? (int) $filters['limit'] : 100;
        $offset = isset($filters['offset']) ? (int) $filters['offset'] : 0;

        $orderBy = isset($filters['order_by']) ? $filters['order_by'] : 'ser_link_id';
        $orderDir = isset($filters['order_dir']) && strtoupper($filters['order_dir']) === 'ASC' ? 'ASC' : 'DESC';

        $stmt = $this->db->prepare("
            SELECT * FROM link_servers 
            $whereClause 
            ORDER BY $orderBy $orderDir 
            LIMIT $limit OFFSET $offset
        ");

        $stmt->execute($whereParams);
        return $stmt->fetchAll();
    }

    public function get_link_servers_by_link_db($link_id)
    {
        $stmt = $this->db->prepare("
            SELECT * 
            FROM link_servers ls
            JOIN server_info si ON si.server_id = ls.server_id
            WHERE ls.link_id = ? 
            ORDER BY ser_link_id DESC
        ");
        $stmt->execute([$link_id]);
        return $stmt->fetchAll();
    }

    public function get_link_servers_by_server_db($server_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM link_servers WHERE server_id = ? ORDER BY ser_link_id DESC");
        $stmt->execute([$server_id]);
        return $stmt->fetchAll();
    }

    public function getServerBysid($server_sid)
    {
        $stmt = $this->db->prepare("SELECT * FROM server_info WHERE server_sid = ?");
        $stmt->execute([$server_sid]);
        return $stmt->fetch();
    }
}