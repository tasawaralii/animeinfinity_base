<?php

class LinkDB
{

    // Table Name = links
    // Columns = link_id , filename, content_id, is_live, gdrive_email, gdriveId, size, quality_id , type, mimetype, duration, note, only_hindi, added_date
    private $db;
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }
    public function insert_link_db($data)
    {
        $stmt = $this->db->prepare("
        INSERT INTO links (
            filename,
            content_id,
            is_live,
            gdrive_email,
            gdriveId,
            size,
            quality_id,
            type,
            mimetype,
            duration,
            note,
            only_hindi,
            added_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
        )
        ON DUPLICATE KEY UPDATE
            link_id = LAST_INSERT_ID(link_id),
            filename      = VALUES(filename),
            content_id    = VALUES(content_id),
            is_live        = VALUES(is_live),
            gdrive_email  = VALUES(gdrive_email),
            size           = VALUES(size),
            quality_id     = VALUES(quality_id),
            type           = VALUES(type),
            mimetype       = VALUES(mimetype),
            duration       = VALUES(duration),
            note           = VALUES(note),
            only_hindi     = VALUES(only_hindi),
            updated_date = NOW()
    ");


        $stmt->execute([
            $data['filename'] ?? null,
            $data['content_id'] ?? null,
            $data['is_live'] ?? 1,
            $data['gdrive_email'] ?? null,
            $data['gdriveId'] ?? null,
            $data['size'] ?? null,
            $data['quality_id'] ?? null,
            $data['type'] ?? null,
            $data['mimetype'] ?? null,
            $data['duration'] ?? null,
            $data['note'] ?? null,
            $data['only_hindi'] ?? 0
        ]);

        return $this->db->lastInsertId();
    }

    public function update_link_db($link_id, $data)
    {
        $fields = [];
        $values = [];

        $allowedFields = ['filename', 'content_id', 'is_live', 'gdrive_email', 'gdriveId', 'size', 'quality_id', 'type', 'mimetype', 'duration', 'note', 'only_hindi'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $link_id;

        $stmt = $this->db->prepare("
            UPDATE links SET " . implode(', ', $fields) . " WHERE link_id = ?
        ");

        $stmt->execute($values);

        return $this->get_link_db($link_id);
    }

    public function delete_link_db($link_id)
    {
        $stmt = $this->db->prepare("DELETE FROM links WHERE link_id = ?");
        $stmt->execute([$link_id]);
    }

    public function get_link_db($link_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM links WHERE link_id = ?");
        $stmt->execute([$link_id]);
        $res = $stmt->fetch();
        return $res;
    }

    public function get_all_links_db($filters = [])
    {
        $whereConditions = [];
        $whereParams = [];

        if (isset($filters['content_id'])) {
            $whereConditions[] = "content_id = ?";
            $whereParams[] = $filters['content_id'];
        }

        if (isset($filters['filename'])) {
            $whereConditions[] = "filename LIKE ?";
            $whereParams[] = "%{$filters['filename']}%";
        }

        if (isset($filters['is_live'])) {
            $whereConditions[] = "is_live = ?";
            $whereParams[] = $filters['is_live'];
        }

        if (isset($filters['quality_id'])) {
            $whereConditions[] = "quality_id = ?";
            $whereParams[] = $filters['quality_id'];
        }

        if (isset($filters['only_hindi'])) {
            $whereConditions[] = "only_hindi = ?";
            $whereParams[] = $filters['only_hindi'];
        }

        if (isset($filters['gdrive_email'])) {
            $whereConditions[] = "gdrive_email = ?";
            $whereParams[] = $filters['gdrive_email'];
        }

        $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

        $limit = isset($filters['limit']) ? (int) $filters['limit'] : 20;
        $offset = isset($filters['offset']) ? (int) $filters['offset'] : 0;

        $orderBy = isset($filters['order_by']) ? $filters['order_by'] : 'added_date';
        $orderDir = isset($filters['order_dir']) && strtoupper($filters['order_dir']) === 'ASC' ? 'ASC' : 'DESC';

        $stmt = $this->db->prepare("
            SELECT * FROM links 
            $whereClause 
            ORDER BY $orderBy $orderDir 
            LIMIT $limit OFFSET $offset
        ");

        $stmt->execute($whereParams);
        return $stmt->fetchAll();
    }
    public function get_queue_server($server_sid, $limit = 1, $max_size = null)
    {
        $sql = "
            SELECT l.*
            FROM links l
            WHERE l.updated_date >= '2026-02-05'
            AND NOT EXISTS (
                SELECT 1
                FROM link_servers ls
                JOIN server_info si ON si.server_id = ls.server_id
                WHERE ls.link_id = l.link_id
                AND si.server_sid = ?
            )
        ";

        $params = [$server_sid];

        if ($max_size !== null) {
            $sql .= " AND l.size <= ? ";
            $params[] = $max_size * 1024 * 1024;
        }

        $sql .= " ORDER BY l.link_id DESC ";

        if ($limit !== null) {
            $limit = (int) $limit;
            $sql .= " LIMIT $limit ";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $links = $stmt->fetchAll();

        if ($links && $limit == 1) {
            return $links[0];
        }

        return $links;
    }


    public function get_pending_status($server_sid, $limit = 1)
    {
        $stmt = $this->db->prepare(
            "SELECT l.*
            FROM links l 
            JOIN link_servers ls ON ls.link_id = l.link_id
            JOIN server_info si ON si.server_id = ls.server_id
            WHERE ls.is_uploaded = 1 AND ls.slug = ''
            AND si.server_sid = ?
            ORDER BY ls.ser_link_id ASC
            LIMIT $limit
            "
        );

        $stmt->execute([$server_sid]);
        $links = $stmt->fetchAll();
        if ($links && $limit == 1) {
            return $links[0];
        }

        return $links;
    }

    public function getLinksOfContent($content_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM links WHERE content_id = ?");
        $stmt->execute([$content_id]);
        return $stmt->fetchAll();
    }
}