<?php

require_once PROJECT_ROOT . "/src/models/link_server.php";
require_once PROJECT_ROOT . "/src/models/link.php";

class CronController
{
    // private $db;
    private $linkServerdb;
    private $linkdb;


    public function __construct()
    {
        // $this->db = Database::getInstance()->getConnection();
        $this->linkServerdb = new LinkServerDB();
        $this->linkdb = new LinkDB();

    }

    public function uploadDeaddrive($gdrive_id) {

    }
    
}