import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/anime";
import Card from "../components/Card";
import tmdb from "../services/tmdb";
import Button from "../components/Button";
import SeasonForm from "../components/SeasonForm";
import EpisodeForm from "../components/EpisodeForm";
import Input from "../components/Input";

const defaultEpisodeFormData = {
  season_id: null,
  episode_tmdb_id: null,
  episode_name: null,
  note: null,
  episode_number: null,
  episode_runtime: null,
  episode_rating: null,
  part: null,
  img: null,
  air_date: null,
  overview: null,
  content_id: null,
};

const defaultPackFormData = {
  pack_name: "",
  start_ep: "",
  end_ep: "",
};

const defaultDefaultEpisodeFormData = {
  default_start_ep: "",
  default_end_ep: "",
};

const buildEpisodeFormData = (overrides = {}) => ({
  ...defaultEpisodeFormData,
  ...overrides,
});

const TmdbEpisode = ({
  data,
  season_id,
  setTempEpisodeFormData,
  season_tmdb_id,
  isSelected,
  onToggleSelect,
}) => {
  const addTmdbEpisode = () => {
    const episodeData = buildEpisodeFormData({
      season_id,
      episode_tmdb_id: `${season_tmdb_id}-E${data.episode_number}`,
      episode_name: data.name ?? null,
      episode_number: data.ordered_number ?? data.episode_number,
      episode_runtime: data.runtime ?? null,
      episode_rating: data.vote_average ?? null,
      air_date: data.air_date ?? null,
      overview: data.overview ?? null,
      img: data.still_path ?? null,
    });

    setTempEpisodeFormData(episodeData);
  };

  return (
    <div className="flex items-center justify-between mt-2 p-2 rounded hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(data.id)}
          className="w-4 h-4 cursor-pointer"
        />
        <div>
          <div className="font-medium text-gray-800">
            {data.ordered_number ?? data.episode_number}. {data.name}
          </div>
          <div className="text-sm text-gray-500">{data.air_date}</div>
        </div>
      </div>
      <Button onClick={addTmdbEpisode} variant="success" className="text-xs">
        Add
      </Button>
    </div>
  );
};

const Season = () => {
  const [season, setSeason] = useState(null);
  const [tmdbEpisodes, setTmdbEpisodes] = useState([]);
  const [episodeGroups, setEpisodeGroups] = useState([]);
  const [selectedEpisodeGroup, setSelectedEpisodeGroup] = useState(null);
  const [tempEpisodeFormData, setTempEpisodeFormData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEpisodeIds, setSelectedEpisodeIds] = useState(new Set());

  const [showPackForm, setShowPackForm] = useState(false);
  const [packFormData, setPackFormData] = useState(defaultPackFormData);

  const [showDefaultEpisodeForm, setShowDefaultEpisodeForm] = useState(false);
  const [defaultEpisodeFormData, setDefaultEpisodeFormData] = useState(
    defaultDefaultEpisodeFormData,
  );

  const { season_id } = useParams();

  useEffect(() => {
    fetchSeason();
  }, [season_id]);

  const fetchSeason = async () => {
    const res = await api.getSeasonById(season_id);
    setSeason(res?.data ?? res);
  };

  const fetchTmdbEpisodes = async (season_tmdb_id) => {
    const res = await tmdb.getTMDBSeasonDetails(season_tmdb_id);
    setTmdbEpisodes(res.episodes || []);
  };

  const fetchEpisodeGroups = async (season_tmdb_id) => {
    const tmdb_id = season_tmdb_id.split("-S")[0];
    const res = await tmdb.getEpisodeGroups(tmdb_id);
    setTmdbEpisodes([]);
    setEpisodeGroups(res);
  };

  const fetchGroup = async (tv_episode_group_id) => {
    const res = await tmdb.getGroup(tv_episode_group_id);
    setSelectedEpisodeGroup(res);
  };

  const setGroupTmdbEpisodes = (episodes) => {
    const orderedEpisodes = episodes.map((e, _) => {
      return {
        ...e,
        ordered_number: _ + 1,
      };
    });

    setTmdbEpisodes(orderedEpisodes);
    setSelectedEpisodeIds(new Set());
  };

  const toggleEpisodeSelection = (episodeId) => {
    const newSelected = new Set(selectedEpisodeIds);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodeIds(newSelected);
  };

  const toggleAllEpisodes = () => {
    if (selectedEpisodeIds.size === tmdbEpisodes.length) {
      setSelectedEpisodeIds(new Set());
    } else {
      const allIds = new Set(tmdbEpisodes.map((e) => e.id));
      setSelectedEpisodeIds(allIds);
    }
  };

  const addSelectedEpisodes = async () => {
    const selectedEpisodes = tmdbEpisodes.filter((te) =>
      selectedEpisodeIds.has(te.id),
    );

    const allData = selectedEpisodes.map((te) => {
      return buildEpisodeFormData({
        season_id,
        episode_tmdb_id: `${season.season_tmdb_id}-E${te.episode_number}`,
        episode_name: te.name ?? null,
        episode_number: te.ordered_number ?? te.episode_number,
        episode_runtime: te.runtime ?? null,
        episode_rating: te.vote_average ?? null,
        air_date: te.air_date ?? null,
        overview: te.overview ?? null,
        img: te.still_path ?? null,
      });
    });

    try {
      const res = await api.addEpisodes(season_id, { episodes: allData });
      if (res.status == "success") {
        alert(`${selectedEpisodes.length} Episode(s) Added`);
      }
      setSelectedEpisodeIds(new Set());
      setEpisodeGroups([]);
      setGroupTmdbEpisodes([]);
      setSelectedEpisodeGroup([]);
      await fetchSeason();
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const handlePackChange = (event) => {
    const { name, value } = event.target;
    setPackFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDefaultEpisodeChange = (event) => {
    const { name, value } = event.target;
    setDefaultEpisodeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeDefaultEpisodeForm = () => {
    setShowDefaultEpisodeForm(false);
    setDefaultEpisodeFormData(defaultDefaultEpisodeFormData);
  };

  const addPack = async () => {
    if (!packFormData.start_ep || !packFormData.end_ep) {
      alert("Start and end episodes are required");
      return;
    }

    const payload = {
      pack_name: packFormData.pack_name,
      start_ep: Number(packFormData.start_ep),
      end_ep: Number(packFormData.end_ep),
    };

    try {
      const res = await api.addPack(season_id, payload);
      if (res?.status === "success") {
        alert("Pack Added");
      }
      setPackFormData(defaultPackFormData);
      setShowPackForm(false);
      await fetchSeason();
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const addDefaultEpisodes = async () => {
    const start = Number(defaultEpisodeFormData.default_start_ep);
    const end = Number(defaultEpisodeFormData.default_end_ep);

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      alert("Start and end episodes are required");
      return;
    }

    if (start <= 0 || end <= 0) {
      alert("Start and end episodes must be greater than 0");
      return;
    }

    if (end < start) {
      alert("End episode must be greater than or equal to start episode");
      return;
    }

    const episodes = Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    );

    try {
      const res = await api.addDefaultEpisodes(season_id, { episodes });
      if (res?.status === "success") {
        alert(`${episodes.length} Episode(s) Added`);
      }
      closeDefaultEpisodeForm();
      await fetchSeason();
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  if (!season) return <div>Loading Season</div>;

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Season</div>
              <div className="text-base font-semibold text-gray-800">
                {season.season_name || `Season ${season.season_number}`}
              </div>
              <div className="text-xs text-gray-500">
                Season ID: {season_id}
              </div>
            </div>
            {season.poster_img && (
              <img
                src={tmdb.getTMDBImageUrl(season.poster_img, "poster", "small")}
                alt={season.season_name || `Season ${season.season_number}`}
                className="w-20 h-28 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-xs">
              <div className="text-gray-500">Season Number</div>
              <div className="text-gray-800">{season.season_number ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">TMDB Season ID</div>
              <div className="text-gray-800">
                {season.season_tmdb_id ?? "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Release Date</div>
              <div className="text-gray-800">
                {season.season_rel_date ?? "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Total Episodes</div>
              <div className="text-gray-800">
                {season.total_episodes ?? "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Rating</div>
              <div className="text-gray-800">{season.rating ?? "-"}</div>
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Overview</div>
            <div className="text-gray-700 leading-relaxed">
              {season.season_overview ?? "-"}
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Dubs</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {(season.dubs ?? []).length > 0 ? (
                season.dubs.map((d, index) => (
                  <span
                    key={`${d.language_sid}-${d.ott_sid}-${index}`}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs"
                  >
                    {d.language_sid} | {d.ott_sid}
                  </span>
                ))
              ) : (
                <span className="text-gray-700">-</span>
              )}
            </div>
          </div>
        </div>
        <Button
          className="m-2"
          variant="secondary"
          onClick={() => setShowEditForm(true)}
        >
          Edit Season
        </Button>
      </Card>
      {showEditForm && (
        <SeasonForm
          data={season}
          onCancel={() => setShowEditForm(false)}
          onSaved={async () => {
            await fetchSeason();
            setShowEditForm(false);
          }}
        />
      )}
      <Card className="mt-4">
        <p className="text-center">
          <button
            className="bg-blue-600 text-white p-2"
            onClick={() =>
              setTempEpisodeFormData(buildEpisodeFormData({ season_id }))
            }
          >
            + Add Episode
          </button>
          <button
            className="ml-4 bg-amber-300"
            onClick={() => setShowDefaultEpisodeForm(true)}
          >
            + Add Episode range
          </button>
        </p>
        {showDefaultEpisodeForm && (
          <Card className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Start Episode"
                name="default_start_ep"
                type="number"
                value={defaultEpisodeFormData.default_start_ep}
                onChange={handleDefaultEpisodeChange}
                required
              />
              <Input
                label="End Episode"
                name="default_end_ep"
                type="number"
                value={defaultEpisodeFormData.default_end_ep}
                onChange={handleDefaultEpisodeChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="success" onClick={addDefaultEpisodes}>
                Add Episodes
              </Button>
              <Button variant="secondary" onClick={closeDefaultEpisodeForm}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </Card>
      <Card className="mt-4">
        <p className="text-center">
          <button
            className="bg-blue-600 text-white p-2"
            onClick={() => setShowPackForm(true)}
          >
            + Add Pack
          </button>
        </p>
        {showPackForm && (
          <Card className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Pack Name"
                name="pack_name"
                value={packFormData.pack_name}
                onChange={handlePackChange}
                placeholder="Optional"
              />
              <Input
                label="Start Episode"
                name="start_ep"
                type="number"
                value={packFormData.start_ep}
                onChange={handlePackChange}
                required
              />
              <Input
                label="End Episode"
                name="end_ep"
                type="number"
                value={packFormData.end_ep}
                onChange={handlePackChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="success" onClick={addPack}>
                Save Pack
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPackForm(false);
                  setPackFormData(defaultPackFormData);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
        {(season.packs ?? []).length > 0 ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {season.packs.map((p) => (
              <Card key={p.pack_id} className="text-xs">
                <div className="font-medium text-gray-800">
                  {p.pack_name || `Pack ${p.pack_id}`}
                </div>
                <div className="text-gray-600">
                  Episodes: {p.start_ep ?? "-"} - {p.end_ep ?? "-"}
                </div>
                <div className="text-gray-500">Pack ID: {p.pack_id}</div>
                <div className="text-gray-500">Content ID: {p.content_id}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-xs text-gray-500">No packs.</div>
        )}
      </Card>

      <EpisodeForm
        data={tempEpisodeFormData}
        season_id={season_id}
        onCancel={() => setTempEpisodeFormData(null)}
        onSaved={async () => {
          await fetchSeason();
          setTempEpisodeFormData(null);
        }}
      />
      {season.season_tmdb_id && (
        <Card className="mt-4">
          <p className="text-center space-x-2">
            {season.season_tmdb_id.includes("-S") && (
              <>
                <button
                  className="bg-blue-600 text-white p-2"
                  onClick={() => fetchTmdbEpisodes(season.season_tmdb_id)}
                >
                  Fetch Episodes From TMDB
                </button>
              </>
            )}
            <button
              className="bg-green-600 text-white p-2"
              onClick={() => fetchEpisodeGroups(season.season_tmdb_id)}
            >
              Fetch Episode Groups
            </button>
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {episodeGroups.map((eg) => (
              <Card
                key={eg.id}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => fetchGroup(eg.id)}
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{eg.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {eg.description && (
                      <div className="mb-2">{eg.description}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div>
                      <span className="text-gray-500">Episodes: </span>
                      <span className="text-gray-800">{eg.episode_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Groups: </span>
                      <span className="text-gray-800">{eg.group_count}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {selectedEpisodeGroup &&
            selectedEpisodeGroup.map((eg) => (
              <Card>
                Name: {eg.name}{" "}
                <button onClick={() => setGroupTmdbEpisodes(eg.episodes)}>
                  Show Episodes
                </button>
              </Card>
            ))}
          {tmdbEpisodes.length > 0 && (
            <Card className="mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedEpisodeIds.size === tmdbEpisodes.length &&
                      tmdbEpisodes.length > 0
                    }
                    onChange={toggleAllEpisodes}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All
                  </span>
                </div>
                {selectedEpisodeIds.size > 0 && (
                  <Button
                    onClick={addSelectedEpisodes}
                    variant="success"
                    className="text-sm"
                  >
                    Add {selectedEpisodeIds.size} Episode
                    {selectedEpisodeIds.size !== 1 ? "s" : ""}
                  </Button>
                )}
              </div>
            </Card>
          )}
          {tmdbEpisodes.map((te) => (
            <TmdbEpisode
              key={te.id}
              data={te}
              season_id={season_id}
              season_tmdb_id={season.season_tmdb_id}
              setTempEpisodeFormData={setTempEpisodeFormData}
              isSelected={selectedEpisodeIds.has(te.id)}
              onToggleSelect={toggleEpisodeSelection}
            />
          ))}
        </Card>
      )}
      <Card className="mt-4">
        <div>
          <p className="text-sm font-medium text-gray-800">Episodes</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(season.episodes ?? []).map((e) => (
              <Card key={e.episode_id} className="shadow">
                <Link
                  to={`/episode/${e.episode_id}`}
                  className="flex gap-3 text-sm"
                >
                  {e.img && (
                    <img
                      src={tmdb.getTMDBImageUrl(e.img, "still", "small")}
                      alt={e.episode_name}
                      className="w-20 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      Episode {e.episode_number}
                    </div>
                    <div className="text-gray-800 font-medium">
                      {e.episode_name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Air: {e.air_date ?? "-"} | Runtime:{" "}
                      {e.episode_runtime ?? "-"} min | Rating:{" "}
                      {e.episode_rating ?? "-"}
                    </div>
                  </div>
                </Link>
                <div className="text-xs text-gray-700 mt-2">
                  {e.overview ?? "-"}
                </div>
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setTempEpisodeFormData(buildEpisodeFormData(e))
                    }
                  >
                    Edit Episode
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
};

export default Season;
