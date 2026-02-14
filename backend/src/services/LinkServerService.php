<?php

require_once PROJECT_ROOT . "/src/models/link_server.php";

class LinkServerService
{
    private static $model;

    public static function init()
    {
        if (!self::$model) {
            self::$model = new LinkServerDB();
        }
    }

    public static function getAll($params = [])
    {
        self::init();

        try {
            // Handle single link server query
            if (isset($params['ser_link_id'])) {
                $ser_link_id = (int) $params['ser_link_id'];
                $linkServer = self::$model->get_link_server_db($ser_link_id);

                if ($linkServer) {
                    Helper::successResponse($linkServer);
                } else {
                    Helper::errorResponse("Link Server not found", 404);
                }
                return;
            }

            // Get by link_id
            if (isset($params['link_id'])) {
                $link_id = (int) $params['link_id'];
                $linkServers = self::$model->get_link_servers_by_link_db($link_id);
                Helper::successResponse($linkServers);
                return;
            }

            // Get by server_id
            if (isset($params['server_id'])) {
                $server_id = (int) $params['server_id'];
                $linkServers = self::$model->get_link_servers_by_server_db($server_id);
                Helper::successResponse($linkServers);
                return;
            }

            // Build filters
            $filters = [];

            if (isset($params['slug'])) {
                $filters['slug'] = $params['slug'];
            }
            if (isset($params['limit'])) {
                $filters['limit'] = (int) $params['limit'];
            }
            if (isset($params['offset'])) {
                $filters['offset'] = (int) $params['offset'];
            }
            if (isset($params['order_by'])) {
                $allowedFields = ['ser_link_id', 'link_id', 'server_id', 'slug'];
                if (in_array($params['order_by'], $allowedFields)) {
                    $filters['order_by'] = $params['order_by'];
                }
            }
            if (isset($params['order_dir'])) {
                $filters['order_dir'] = $params['order_dir'];
            }

            $linkServers = self::$model->get_all_link_servers_db($filters);
            Helper::successResponse($linkServers);

        } catch (Exception $e) {
            Helper::errorResponse("Error fetching link servers: " . $e->getMessage(), 500);
        }
    }

    public static function create($data)
    {
        self::init();

        try {
            if (empty($data['link_id']) || empty($data['server_id'])) {
                Helper::errorResponse("link_id and server_id are required", 400);
                return;
            }

            $linkServerData = [
                'link_id' => (int) $data['link_id'],
                'server_id' => (int) $data['server_id'],
                'slug' => $data['slug'] ?? null,
            ];

            $ser_link_id = self::$model->insert_link_server_db($linkServerData);

            if ($ser_link_id) {
                $newLinkServer = self::$model->get_link_server_db($ser_link_id);
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

    public static function update($data)
    {
        self::init();

        try {
            if (empty($data['ser_link_id'])) {
                Helper::errorResponse("ser_link_id is required", 400);
                return;
            }

            $ser_link_id = (int) $data['ser_link_id'];

            // Check if exists
            $existing = self::$model->get_link_server_db($ser_link_id);
            if (!$existing) {
                Helper::errorResponse("Link Server not found", 404);
                return;
            }

            $updateData = [];

            if (isset($data['link_id'])) {
                $updateData['link_id'] = (int) $data['link_id'];
            }
            if (isset($data['server_id'])) {
                $updateData['server_id'] = (int) $data['server_id'];
            }
            if (isset($data['slug'])) {
                $updateData['slug'] = $data['slug'];
            }

            if (empty($updateData)) {
                Helper::errorResponse("No data provided for update", 400);
                return;
            }

            $updated = self::$model->update_link_server_db($ser_link_id, $updateData);

            if ($updated) {
                Helper::successResponse([
                    'message' => 'Link Server updated successfully',
                    'link_server' => $updated
                ]);
            } else {
                Helper::errorResponse("Failed to update link server", 500);
            }
        } catch (Exception $e) {
            Helper::errorResponse("Error updating link server: " . $e->getMessage(), 500);
        }
    }

    public static function delete($data)
    {
        self::init();

        try {
            if (empty($data['ser_link_id'])) {
                Helper::errorResponse("ser_link_id is required", 400);
                return;
            }

            $ser_link_id = (int) $data['ser_link_id'];

            // Check if exists
            $existing = self::$model->get_link_server_db($ser_link_id);
            if (!$existing) {
                Helper::errorResponse("Link Server not found", 404);
                return;
            }

            self::$model->delete_link_server_db($ser_link_id);

            Helper::successResponse([
                'message' => 'Link Server deleted successfully',
                'ser_link_id' => $ser_link_id
            ]);
        } catch (Exception $e) {
            Helper::errorResponse("Error deleting link server: " . $e->getMessage(), 500);
        }
    }
}

?>
