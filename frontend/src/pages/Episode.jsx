import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/anime";
import Card from "../components/Card";
import tmdb from "../services/tmdb";
import Button from "../components/Button";
import EpisodeForm from "../components/EpisodeForm";

const Episode = () => {
  const { episode_id } = useParams();

  const [episode, setEpisode] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchEpisode();
  }, [episode_id]);

  const fetchEpisode = async () => {
    const res = await api.getEpisodeById(episode_id);
    setEpisode(res?.data ?? res);
  };

  if (!episode) return <div>Loading Episode</div>;

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Episode</div>
              <div className="text-base font-semibold text-gray-800">
                {episode.episode_name || "-"}
              </div>
              <div className="text-xs text-gray-500">
                Episode {episode.episode_number ?? "-"} | Season{" "}
                {episode.season_id ?? "-"}
              </div>
            </div>
            {episode.img && (
              <img
                src={tmdb.getTMDBImageUrl(episode.img, "still", "small")}
                alt={episode.episode_name}
                className="w-24 h-14 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-xs">
              <div className="text-gray-500">TMDB Episode ID</div>
              <div className="text-gray-800">
                {episode.episode_tmdb_id ?? "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Air Date</div>
              <div className="text-gray-800">{episode.air_date ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Runtime</div>
              <div className="text-gray-800">
                {episode.episode_runtime
                  ? `${episode.episode_runtime} min`
                  : "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Rating</div>
              <div className="text-gray-800">
                {episode.episode_rating ?? "-"}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Part</div>
              <div className="text-gray-800">{episode.part ?? "-"}</div>
            </div>
            <div className="text-xs">
              <div className="text-gray-500">Content ID</div>
              <div className="text-gray-800">{episode.content_id ?? "-"}</div>
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Overview</div>
            <div className="text-gray-700 leading-relaxed">
              {episode.overview ?? "-"}
            </div>
          </div>

          <div className="text-xs">
            <div className="text-gray-500">Note</div>
            <div className="text-gray-700">{episode.note ?? "-"}</div>
          </div>
        </div>
        <Button
          className="m-2"
          variant="secondary"
          onClick={() => setShowEditForm(true)}
        >
          Edit Episode
        </Button>
      </Card>

      {showEditForm && (
        <EpisodeForm
          data={episode}
          season_id={episode.season_id}
          onCancel={() => setShowEditForm(false)}
          onSaved={async () => {
            await fetchEpisode();
            setShowEditForm(false);
          }}
        />
      )}

      <Card className="mt-4">
        <p className="text-sm font-medium text-gray-800">Links</p>
        <div className="mt-3 grid grid-cols-1">
          {(episode.links ?? []).map((link) => (
            <Card key={link.link_id} className="shadow mt-1">
              <div className="text-sm text-gray-800 font-medium truncate">
                {link.filename}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Quality: {link.quality_id ?? "-"} | Type: {link.type ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                Size: {link.size ?? "-"} | Live: {link.is_live ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                Drive: {link.gdrive_email ?? "-"}
              </div>
              <div className="text-xs text-gray-500">
                Added: {link.added_date ?? "-"} | Updated:{" "}
                {link.updated_date ?? "-"}
              </div>
            </Card>
          ))}
          {(episode.links ?? []).length === 0 && (
            <div className="text-xs text-gray-500">No links found.</div>
          )}
        </div>
      </Card>
    </>
  );
};

export default Episode;