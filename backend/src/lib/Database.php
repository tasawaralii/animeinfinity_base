<?php
class Database
{
    /** @var Database|null */
    private static $instance = null;
    /** @var PDO */
    private $pdo;

    private function __construct()
    {
        $server = $_ENV['DBSERVER'];
        $host = $_ENV['DBHOST'];
        $db = $_ENV['DBNAME'];
        $user = $_ENV['DBUSER'];
        $pass = $_ENV['DBPASS'];

        $dsn = "{$server}:host={$host};dbname={$db};";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
            // $this->pdo->exec("SET NAMES '{$charset}'");
        } catch (PDOException $e) {
            throw new RuntimeException('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Get singleton instance
     * @return Database
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Get raw PDO connection
     * @return PDO
     */
    public function getConnection()
    {
        return $this->pdo;
    }

    /**
     * Convenience wrapper for prepared queries
     * @param string $sql
     * @param array $params
     * @return PDOStatement
     */
    public function query($sql, $params = [])
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function __clone()
    {
        throw new \Exception("Cloning Database is not allowed.");
    }

    public function __wakeup()
    {
        throw new \Exception("Unserializing Database is not allowed.");
    }

}