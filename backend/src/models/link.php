<?php

class AnimeDB
{

    private $db;
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }
}