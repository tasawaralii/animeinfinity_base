<?php
class Helper
{
    public static function fetchContent(
        string $url,
        string $method = 'GET',
        array|string|null $data = null,
        array $headers = []
    ): string {
        $ch = curl_init($url);

        $method = strtoupper($method);

        $curlOptions = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_CUSTOMREQUEST => $method,
        ];

        // Handle POST / PUT / PATCH body
        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            if (is_array($data)) {
                $data = http_build_query($data);
            }

            $curlOptions[CURLOPT_POSTFIELDS] = $data;
        }

        // Headers
        if (!empty($headers)) {
            $curlOptions[CURLOPT_HTTPHEADER] = $headers;
        }

        curl_setopt_array($ch, $curlOptions);

        $response = curl_exec($ch);

        // Network error
        if ($response === false) {
            $error = curl_error($ch);
            $errno = curl_errno($ch);
            curl_close($ch);

            throw new RuntimeException("cURL error ({$errno}): {$error}");
        }

        // HTTP status check (axios rejects non-2xx)
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300) {
            throw new RuntimeException("HTTP {$httpCode} returned from {$url}");
        }

        return $response;
    }

    public static function slugify($string)
    {
        // Convert the string to lowercase
        $slug = strtolower($string);

        // Replace non-alphanumeric characters with hyphens
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);

        // Remove leading and trailing hyphens
        $slug = trim($slug, '-');

        // Remove consecutive hyphens
        $slug = preg_replace('/-+/', '-', $slug);

        return $slug;
    }
    public static function formatSize($size)
    {
        $bytes = (float) $size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];

    }

    public static function successResponse($data)
    {
        header("content-type: application/json");
        echo json_encode(
            [
                'status' => "success",
                'data' => $data

            ]
        );
        exit;
    }
    public static function errorResponse($message, $status_code = 500)
    {
        header("content-type: application/json");
        http_response_code($status_code);
        echo json_encode(
            [
                'status' => "error",
                'data' => $message
            ]
        );
        exit;
    }

    public static function extractFolderId($url)
    {
        $pattern = '/\/drive\/folders\/([a-zA-Z0-9-_]+)\?/';
        preg_match($pattern, $url, $matches);

        return isset($matches[1]) ? $matches[1] : null;
    }

    public static function extractFileId($url)
    {
        $pattern = '/\/d\/(.*?)(\/|$)/';
        preg_match($pattern, $url, $matches);

        return isset($matches[1]) ? $matches[1] : null;
    }

    public static function findQuality(string $name): int|null
    {
        if (!preg_match('/\b(360p|480p|512p|576p|720p|1080p)\b/i', $name, $m)) {
            return null;
        }

        $resolution = $m[1];

        $isX265 = preg_match('/x265|hevc|10bit/i', $name);
        $isHQ = preg_match('/\bHQ\b/i', $name);

        $quality = $resolution;

        $quality .= $isX265 ? ' x265' : ' x264';

        if ($isHQ) {
            $quality .= ' HQ';
        }

        $orderMap = [
            '480p x264' => 1,
            '720p x265' => 2,
            '720p x264' => 3,
            '1080p x265' => 4,
            '1080p x264' => 5,
            '1080p x265 HQ' => 6,
            '1080p x264 HQ' => 7
        ];

        if (!$orderMap[$quality])
            return null;

        $order = $orderMap[$quality];
        return $order;
    }

    public static function findEpisode($name, $mode)
    {
        $episode = null;
        if ($mode == 1) {

            if (preg_match('/s\d{1,2}e(\d{2,3})/i', $name, $matches)) {
                $episode = $matches[1];
            }

        } else if ($mode == 2) {

            if (preg_match('/ \((\d{3})\) /', $name, $matches)) {
                $episode = $matches[1];
            } elseif (preg_match('/ E(\d{3}) /', $name, $matches)) {
                $episode = $matches[1];
            }

        } else if ($mode == 3) {
            if (preg_match('/Part (\d{1,2})/', $name, $matches)) {
                $episode = $matches[1];
            }
        }
        return $episode;
    }
    public static function fetchGdriveFile($gdrive_id)
    {
        $fields = "id,name,size,mimeType,owners(emailAddress),videoMediaMetadata(durationMillis)";
        $gurl = 'https://www.googleapis.com/drive/v3/files/' . $gdrive_id . '?fields=' . $fields . '&key=' . $_ENV['GOOGLE_API_KEY'];
        $gfile = self::fetchContent($gurl);
        if ($gfile == null)
            return false;
        return json_decode($gfile, true);
    }

    public static function getFolderFiles($gdrive_folder_id)
    {
        $folurl = 'https://www.googleapis.com/drive/v3/files?q=%27' . $gdrive_folder_id . '%27+in+parents&key=' . $_ENV['GOOGLE_API_KEY'] . '&orderBy=name';
        $fjson = self::fetchContent($folurl);
        $fdjson = json_decode($fjson, true);
        return $fdjson['files'];
    }

}