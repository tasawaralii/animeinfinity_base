import React, { useEffect, useState } from "react";
import api from "../services/addlink";
import Card from "../components/Card";

function extractDriveId(url) {
  if (!url) return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // file/d/ID
    /\/folders\/([a-zA-Z0-9_-]+)/, // folders/ID
    /[?&]id=([a-zA-Z0-9_-]+)/, // open?id=ID or uc?id=ID
    /\/d\/([a-zA-Z0-9_-]+)/, // fallback
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

const ShowEpisode = ({ episode, selectedContent, selectContent }) => {
  return (
    <>
      <button
        className={`m-1 ${episode.content_id == selectedContent?.content_id ? "bg-amber-200" : ""}`}
        onClick={() => selectContent(episode)}
      >
        {episode.name}
      </button>
    </>
  );
};

const episodeNumberExtractModes = [
  { mode: 1, formate: "S01E01" },
  { mode: 2, formate: "001/E001" },
  { mode: 3, formate: "Part 01" },
];

const ShowPack = ({ pack, selectContent, selectedContent }) => {
  return <button onClick={() => selectContent(pack)}>{pack.name}</button>;
};

const ShowSeason = ({ season, selectedContent, selectContent }) => {
  const [episodes, setEpisodes] = useState([]);
  const [packs, setPacks] = useState([]);

  async function loadEpisodes() {
    const res = await api.getEpisodesOfSeason(season.season_id);
    console.log(res);
    setEpisodes(res);
  }

  async function loadPacks() {
    const res = await api.getPacksOfSeason(season.season_id);
    console.log(res);
    setPacks(res);
  }

  return (
    <Card className="mt-1">
      <button
        className={`${season.season_id == selectedContent?.season_id ? "bg-amber-200" : ""}`}
        onClick={() => selectContent({ ...season, content_id: "null" })}
      >
        Select {season.name} | season ID: {season.season_id}
      </button>
      <button onClick={() => loadEpisodes()}>Load Episodes</button>
      <button onClick={() => loadPacks()}>Load Packs</button>

      <div className="m-2">
        {episodes.map((e) => (
          <ShowEpisode
            key={e.episode_id}
            episode={e}
            selectedContent={selectedContent}
            selectContent={selectContent}
          />
        ))}
      </div>
      <div className="m-2">
        {packs.map((p) => (
          <ShowPack
            key={p.pack_id}
            pack={p}
            selectContent={selectContent}
            selectedContent={selectedContent}
          />
        ))}
      </div>
    </Card>
  );
};

const ShowSingleAnime = ({ anime, selectContent, selectedContent }) => {
  const [seasons, setSeasons] = useState([]);

  async function loadSeasons() {
    const res = await api.getSeasonsOfAnime(anime.anime_id);
    console.log(res);
    setSeasons(res);
  }

  return (
    <Card className="mt-4">
      {anime.name} {anime.content_id} {anime.type}
      {anime.type == "tv" ? (
        <div>
          <button className="ml-4" onClick={() => loadSeasons(anime.anime_id)}>
            Show Seasons
          </button>
          {seasons.length > 0 &&
            seasons.map((s) => (
              <ShowSeason
                key={s.season_id}
                season={s}
                selectContent={selectContent}
                selectedContent={selectedContent}
              />
            ))}
        </div>
      ) : (
        <button className="ml-4" onClick={() => selectContent(anime)}>
          Select Movie
        </button>
      )}
    </Card>
  );
};

const ShowAnimes = ({ selectedContent, selectContent }) => {
  const [allAnimes, setAllAnimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadAnime() {
    setAllAnimes([]);
    selectContent(null);
    const res = await api.getAllAnimes({ anime_name: searchTerm.trim() });
    setAllAnimes(res);
  }

  return (
    <>
      <div>
        <input
          name="search"
          placeholder="Type anime name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="ml-2" onClick={loadAnime}>
          Search
        </button>
      </div>

      {allAnimes.length > 0 &&
        allAnimes.map((a) => (
          <ShowSingleAnime
            key={a.anime_id}
            anime={a}
            selectContent={selectContent}
            selectedContent={selectedContent}
          />
        ))}
    </>
  );
};

const LinksBox = ({ selectedContent }) => {
  const [folderLink, setFolderLink] = useState("");
  const [folderInputDisabled, setFolderInputDisabled] = useState(false);

  const [singleLinks, setSingleLinks] = useState("");
  const [singleLinksInputDisabled, setSingleLinksInputDisabled] =
    useState(false);

  const [extractMode, setExtractMode] = useState(1);

  const [isUploading, setUploading] = useState(false);
  const [uploadLinksArray, setUploadLinksArray] = useState([]);

  useEffect(() => {
    setFolderLink("");
    setFolderInputDisabled(false);

    setSingleLinks("");
    setSingleLinksInputDisabled(false);

    setUploading(false);
    setUploadLinksArray([]);
  }, [selectedContent]);

  const folderInput = (e) => {
    const value = e.target.value;
    setFolderLink(value);
  };

  const linksInput = (e) => {
    const value = e.target.value;
    setSingleLinks(value);
  };

  const fetchFolder = async () => {
    setSingleLinks("");

    if (!folderLink.trim()) {
      alert("No Link Given");
      return;
    }

    const folder_id = extractDriveId(folderLink.trim());

    const res = await api.fetchFilesFromFolder(folder_id);
    console.log(res);
    setSingleLinks(res.join("\n"));
  };

  const upload = async () => {
    const linksArray = singleLinks
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (linksArray.length === 0) return;

    setSingleLinksInputDisabled(true);
    setFolderInputDisabled(true);
    setUploading(true);
    setUploadLinksArray(linksArray);
  };

  const onUploadComplete = () => {
    setUploading(false);
    setSingleLinksInputDisabled(false);
    setFolderInputDisabled(false);
  };

  return (
    <>
      <div className="mt-4">
        {selectedContent != null && (
          <div>
            <div>
              <label className="mr-4">Folder Link</label>
              <input
                placeholder="Enter Folder Link"
                value={folderLink}
                onChange={folderInput}
                disabled={folderInputDisabled}
              />
              <button className="ml-4" onClick={fetchFolder}>
                Fetch Folder
              </button>
            </div>
            <div className="mt-4">
              <label className="mr-4">Enter Single Links</label>
              <textarea
                cols={70}
                rows={6}
                value={singleLinks}
                onChange={linksInput}
                disabled={singleLinksInputDisabled}
              ></textarea>
              {selectedContent.type == "season" && (
                <select
                  onChange={(e) => setExtractMode(Number(e.target.value))}
                >
                  {episodeNumberExtractModes.map((m) => (
                    <option key={m.mode} value={m.mode} label={m.formate} />
                  ))}
                </select>
              )}
              <button className="ml-4" onClick={upload} disabled={isUploading}>
                Share Links
              </button>
            </div>
          </div>
        )}
      </div>
      {uploadLinksArray.length > 0 && selectedContent && (
        <MainUpload
          extractMode={extractMode}
          selectedContent={selectedContent}
          linksArray={uploadLinksArray}
          onComplete={onUploadComplete}
        />
      )}
    </>
  );
};

const SingleLinkUpload = ({ item }) => {
  return (
    <div className="border p-2 mt-2 rounded">
      <div>
        <b>ID:</b> {item.gdrive_id}
      </div>

      {item.status === "pending" && <span>⏳ Waiting</span>}
      {item.status === "uploading" && <span>⬆️ Uploading...</span>}

      {item.status === "success" && (
        <div className="text-green-600">
          ✅ Uploaded: {item.response.filename}
        </div>
      )}

      {item.status === "error" && (
        <div className="text-red-600">❌ Failed: {item.error}</div>
      )}
    </div>
  );
};

const MainUpload = ({
  selectedContent,
  linksArray,
  onComplete,
  extractMode = -1,
}) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const parsed = linksArray
      .map((l) => extractDriveId(l))
      .filter(Boolean)
      .map((id) => ({
        gdrive_id: id,
        status: "pending",
        response: null,
        error: null,
      }));

    setItems(parsed);
  }, [linksArray]);

  useEffect(() => {
    if (items.length > 0) {
      startUpload();
    }
  }, [items.length]);

  useEffect(() => {
    if (
      items.length > 0 &&
      items.every(
        (item) => item.status !== "pending" && item.status !== "uploading",
      )
    ) {
      onComplete();
    }
  }, [items, onComplete]);

  const startUpload = async () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // mark uploading
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: "uploading" } : it,
        ),
      );

      try {
        let res;

        if (selectedContent.type == "episode") {
          res = await api.addLinkToEpisode(
            selectedContent.content_id,
            item.gdrive_id,
          );
        } else if (selectedContent.type == "season") {
          res = await api.addLinkToSeason(
            selectedContent.season_id,
            item.gdrive_id,
            extractMode,
          );
        } else if (selectedContent.type == "movie") {
          res = await api.addLinkToMovie(
            selectedContent.content_id,
            item.gdrive_id,
          );
        } else if (selectedContent.type == "pack") {
          res = await api.addLinkToPack(
            selectedContent.content_id,
            item.gdrive_id,
          );
        }

        // mark success
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "success", response: res } : it,
          ),
        );
      } catch (err) {
        // mark error
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "error", error: err.message } : it,
          ),
        );
      }
    }
  };

  return (
    <div>
      {items.map((item) => (
        <SingleLinkUpload key={item.gdrive_id} item={item} />
      ))}
    </div>
  );
};

const AddLink = () => {
  const [selectedContent, setContent] = useState(null);

  const selectContent = (t) => {
    setContent(t);
  };

  return (
    <>
      <ShowAnimes
        selectedContent={selectedContent}
        selectContent={selectContent}
      />

      {selectedContent != null && (
        <div className="m-4 border p-2 rounded-md bg-amber-200 text-center">
          <p> Name : {selectedContent.name}</p>
          <p>Type: {selectedContent.type}</p>
          <p>Content ID: {selectedContent.content_id}</p>
          <button className="bg-red-400" onClick={() => setContent(null)}>
            Unselect Content
          </button>
        </div>
      )}

      <LinksBox selectedContent={selectedContent} />
    </>
  );
};

export default AddLink;
