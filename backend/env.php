<?php

$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    return;
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') {
        continue;
    }

    if (strpos($line, '=') === false) {
        continue;
    }

    list($name, $value) = array_map('trim', explode('=', $line, 2));

    // remove surrounding quotes
    if (strlen($value) > 1 && (($value[0] === '"' && substr($value, -1) === '"') || ($value[0] === "'" && substr($value, -1) === "'"))) {
        $value = substr($value, 1, -1);
    }

    $_ENV[$name] = $value;
    $_SERVER[$name] = $value;
}
