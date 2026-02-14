import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/anime";
import tmdbApi from "../services/tmdb";
import Card from "../components/Card";
import Button from "../components/Button";
import AnimeForm from "../components/AnimeForm";
import SeasonForm from "../components/SeasonForm";

const defaultFormData = {
  anime_id: null,
  season_number: null,
  season_name: null,
  season_tmdb_id: null,
  season_rel_date: null,
  total_episodes: 0,
  season_overview: null,
  poster_img: null,
  rating: 0.0,
  dubs: [],
};

const buildSeasonFormData = (overrides = {}) => ({
  ...defaultFormData,
  ...overrides,
});

const TmdbSeason = ({ data, setTempFormData, anime_id, anime_tmdb_id }) => {
  const addTmdbSeason = () => {
    const seasonData = buildSeasonFormData({
      anime_id,
      season_number: data.season_number ?? null,
      season_name: data.name ?? null,
      season_tmdb_id: `${anime_tmdb_id}-S${data.season_number}`,
      season_rel_date: data.air_date ?? null,
      season_overview: data.overview ?? null,
      total_episodes: data.episode_count,
      poster_img: data.poster_path ?? null,
      rating: data.vote_average ?? 0.0,
      dubs: [],
    });

    setTempFormData(seasonData);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-gray-800">
            Season {data.season_number}
          </div>
          <div className="text-sm text-gray-500">{data.name}</div>
        </div>
        <Button onClick={addTmdbSeason} variant="success">
          Add Season
        </Button>
      </div>
    </>
  );
};

const Anime = () => {
  const [anime, setAnime] = useState(null);
  const [tmdbSeasons, setTmdbSeasons] = useState([]);
  const [tempFormData, setTempFormData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const { anime_id } = useParams();

  useEffect(() => {
    fetchAnime();
  }, [anime_id]);

  const fetchTmdbSeason = async (tmdb_id) => {
    const res = await tmdbApi.getTMDBDetails(tmdb_id, "tv");
    setTmdbSeasons(res.seasons || []);
  };

  const fetchAnime = async () => {
    const res = await api.getAnimeById(anime_id);
    setAnime(res?.data ?? res);
  };
  if (!anime) return <div>Loading Anime</div>;
  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Anime</div>
              <div className="text-base font-semibold text-gray-800">
                {anime.anime_name}
              </div>
              <div className="text-xs text-gray-500">Slug: {anime.slug}</div>
            </div>
            {anime.poster_img && (
              <img
                src={tmdbApi.getTMDBImageUrl(
                  anime.poster_img,
                  "poster",
                  "small",
                )}
                alt={anime.anime_name}
                className="w-20 h-28 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-xs">
              <div className="text-gray-500">TMDB ID</div>
              <div className="text-gray-800">{anime.anime_tmdb_id ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Type</div>
              <div className="text-gray-800">{anime.type ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Release Date</div>
              <div className="text-gray-800">{anime.anime_rel_date ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Rating</div>
              <div className="text-gray-800">{anime.rating ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Duration</div>
              <div className="text-gray-800">
                {anime.duration ? `${anime.duration} min` : "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Age</div>
              <div className="text-gray-800">{anime.age_id ?? "-"}</div>
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Overview</div>
            <div className="text-gray-700 leading-relaxed">
              {anime.overview ?? "-"}
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Genres</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {(anime.genres ?? []).length > 0 ? (
                anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs"
                  >
                    {g}
                  </span>
                ))
              ) : (
                <span className="text-gray-700">-</span>
              )}
            </div>
          </div>
        </div>

        {anime.anime_tmdb_id && (
          <Button
            className="m-2"
            onClick={() => fetchTmdbSeason(anime.anime_tmdb_id)}
          >
            Fetch Seasons From TMDB
          </Button>
        )}
        <Button
          className="m-2"
          variant="secondary"
          onClick={() => setShowEditForm(true)}
        >
          Edit Anime
        </Button>
        {tmdbSeasons.map((ts) => (
          <TmdbSeason
            key={ts.id}
            data={ts}
            setTempFormData={setTempFormData}
            anime_id={anime_id}
            anime_tmdb_id={anime.anime_tmdb_id}
          />
        ))}
      </Card>
      {showEditForm && (
        <Card className="mt-4">
          <AnimeForm
            data={anime}
            onCancel={() => setShowEditForm(false)}
            onSaved={async () => {
              await fetchAnime();
              setShowEditForm(false);
            }}
          />
        </Card>
      )}
      <Card className="mt-4">
        <p className="text-sm font-medium text-gray-800">Seasons</p>
        <button
          onClick={() => setTempFormData(buildSeasonFormData({ anime_id }))}
        >
          + Add Season
        </button>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(anime.seasons ?? []).map((s) => (
            <Link
              key={s.season_id}
              to={`/season/${s.season_id}`}
              className="p-3 border rounded hover:bg-gray-50 text-sm"
            >
              <div className="text-xs text-gray-500">
                Season {s.season_number}
              </div>
              <div className="text-gray-800 font-medium">
                {s.season_name || `Season ${s.season_number}`}
              </div>
            </Link>
          ))}
        </div>
      </Card>
      <SeasonForm
        data={tempFormData}
        anime_id={anime_id}
        onCancel={() => setTempFormData(null)}
        onSaved={async () => {
          await fetchAnime();
          setTempFormData(null);
        }}
      />
    </>
  );
};

export default Anime;