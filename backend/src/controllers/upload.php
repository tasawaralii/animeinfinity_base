<?php

require_once PROJECT_ROOT . "/src/models/link.php";
require_once PROJECT_ROOT . "/src/models/link_server.php";

class UploadController
{
    private $linkdb;
    private $linkServerdb;

    public function __construct()
    {
        $this->linkdb = new LinkDB();
        $this->linkServerdb = new LinkServerDB();
    }
    public function getLink($params, $data)
    {

        if (!isset($params['link_id'])) {
            Helper::errorResponse("No link_id Given");
        }
        $link_id = (int) $params['link_id'];

        $link = $this->linkdb->get_link_db($link_id);

        if ($link) {
            Helper::successResponse($link);
        } else {
            Helper::errorResponse("Link not found", 404);
        }

    }

    public function getLinks($params, $data)
    {

        $filters = [];

        // Filter by content_id
        if (isset($data['content_id'])) {
            $filters['content_id'] = (int) $data['content_id'];
        }

        // Filter by is_live status
        if (isset($data['is_live'])) {
            $filters['is_live'] = (int) $data['is_live'];
        }

        // Filter by quality_id
        if (isset($data['quality_id'])) {
            $filters['quality_id'] = (int) $data['quality_id'];
        }

        // Filter by only_hindi
        if (isset($data['only_hindi'])) {
            $filters['only_hindi'] = (int) $data['only_hindi'];
        }

        // Filter by gdrive_email
        if (isset($data['gdrive_email'])) {
            $filters['gdrive_email'] = $data['gdrive_email'];
        }

        if (isset($data['filename'])) {
            $filters['filename'] = $data['filename'];
        }

        // Pagination
        if (isset($data['limit'])) {
            $filters['limit'] = (int) $data['limit'];
        }

        if (isset($data['offset'])) {
            $filters['offset'] = (int) $data['offset'];
        }

        // Sorting
        if (isset($data['order_by'])) {
            $allowedOrderFields = ['link_id', 'filename', 'content_id', 'size', 'quality_id', 'added_date'];
            if (in_array($data['order_by'], $allowedOrderFields)) {
                $filters['order_by'] = $data['order_by'];
            }
        }

        if (isset($data['order_dir'])) {
            $filters['order_dir'] = $data['order_dir'];
        }

        $links = $this->linkdb->get_all_links_db($filters);
        Helper::successResponse($links);
    }

    public function addServer($params, $data)
    {

        if (empty($params['link_id']) || empty($params['server_sid'])) {
            Helper::errorResponse("link_id and server_sid are required", 400);
        }

        if (!isset($data['slug'])) {
            Helper::errorResponse("No slug Given", 400);
        }

        $link_id = (int) $params['link_id'];
        $server_sid = $params['server_sid'];
        $slug = $data['slug'];

        $server = $this->linkServerdb->getServerBysid($server_sid);

        if (!isset($server['server_id'])) {
            Helper::errorResponse("No server Found with sid $server_sid", 404);
        }

        $server_id = $server['server_id'];

        try {
            $ser_link_id = $this->linkServerdb->insert_link_server_db($link_id, $server_id, $slug);

            if ($ser_link_id) {
                $newLinkServer = $this->linkServerdb->get_link_server_db($ser_link_id);
                Helper::successResponse([
                    'message' => 'Link Server created successfully',
                    'ser_link_id' => $ser_link_id,
                    'link_server' => $newLinkServer
                ]);
            } else {
                Helper::errorResponse("Failed to create link server", 500);
            }
        } catch (Exception $e) {
            Helper::errorResponse("Error creating link server: " . $e->getMessage(), 500);
        }

    }

}