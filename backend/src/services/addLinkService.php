<?php

require_once PROJECT_ROOT . "/src/models/link.php";

class AddLinkService
{

    private $linkdb;
    public function __construct()
    {
        $this->linkdb = new LinkDB();
    }

    public function addLink($content_id, $gdrive_id, $data)
    {
        $metadata = Helper::fetchGdriveFile($gdrive_id);

        $linkData = [
            'filename' => $metadata['name'],
            'content_id' => $content_id,
            'is_live' => 1,
            'gdrive_email' => $metadata['owners'][0]['emailAddress'],
            'gdriveId' => $gdrive_id,
            'size' => $metadata['size'],
            'quality_id' => Helper::findQuality($metadata['name']),
            'type' => pathinfo($metadata['name'], PATHINFO_EXTENSION),
            'mimetype' => $metadata['mimeType'] ?? "Unknown",
            'duration' => $metadata['videoMediaMetadata']['durationMillis'] ?? 0,
            'note' => $data['note'] ?? "",
            'only_hindi' => isset($data['only_hindi']) ? (int) $data['only_hindi'] : 0,
        ];

        $link_id = $this->linkdb->insert_link_db($linkData);

        if ($link_id) {
            $newLink = $this->linkdb->get_link_db($link_id);
            return [
                'link_id' => $link_id,
                'link' => $newLink
            ];
        } else {
            throw new Exception("Failed To Create Link");
        }
    }
}