<?php

class Router
{
    private array $routes = [];

    public function get(string $path, $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    public function addRoute(string $method, string $path, $handler): void
    {
        // Convert route parameters to regex pattern
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = "#^$pattern$#";

        $this->routes[$method][$pattern] = $handler;
    }

    public function resolve(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $path = explode('?', $path)[0];

        $data = null;

        if ($method == "GET")
            $data = $_GET;
        elseif ($method == "POST")
            $data = $_POST;
        elseif ($method == "PUT" || $method == "DELETE")
            parse_str(file_get_contents("php://input"), $data);

        foreach ($this->routes[$method] ?? [] as $pattern => $handler) {
            if (preg_match($pattern, $path, $matches)) {
                $params = array_filter(
                    $matches,
                    fn($key) => !is_numeric($key),
                    ARRAY_FILTER_USE_KEY
                );

                if (is_callable($handler)) {
                    call_user_func($handler, $params, $data);
                } else {
                    http_response_code(500);
                    echo json_encode(['status' => "error", "message" => "Handler Function Not Found"]);
                }
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['status' => "error", "message" => "Endpoint Not Found"]);
        return;
    }
}

?>