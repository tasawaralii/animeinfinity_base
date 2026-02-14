import { useEffect, useState } from "react";
import Card from "./Card";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";
import api from "../services/anime";

const defaultEpisodeFormData = {
  episode_id: null,
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

const EpisodeForm = ({ data, season_id, onCancel, onSaved }) => {
  if (!data) return null;

  const [formData, setFormData] = useState(defaultEpisodeFormData);

  useEffect(() => {
    if (!data) return;
    setFormData({ ...defaultEpisodeFormData, season_id, ...data });
  }, [data, season_id]);

  const isEdit = Boolean(formData.episode_id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEpisode = async () => {
    try {
      if (isEdit) {
        const res = await api.updateEpisode(formData.episode_id, formData);
        if (res?.episode_id) {
          alert(res.message || "Episode updated");
          if (onSaved) onSaved(res);
        }
        return;
      }

      const res = await api.addEpisode(season_id, formData);
      if (res?.episode_id) {
        alert(res.message || "Episode added");
        if (onSaved) onSaved(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEpisode();
  };

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Episode</h3>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Episode Number"
            name="episode_number"
            type="number"
            value={formData.episode_number ?? ""}
            onChange={handleChange}
            required
          />
          <Input
            label="Episode Runtime"
            name="episode_runtime"
            type="number"
            value={formData.episode_runtime ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Episode Rating"
            name="episode_rating"
            type="number"
            step="0.1"
            value={formData.episode_rating ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Episode Name"
            name="episode_name"
            value={formData.episode_name ?? ""}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="TMDB Episode ID"
            name="episode_tmdb_id"
            value={formData.episode_tmdb_id ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Air Date"
            name="air_date"
            type="date"
            value={formData.air_date ?? ""}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Part"
            name="part"
            value={formData.part ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Image Path"
            name="img"
            value={formData.img ?? ""}
            onChange={handleChange}
          />
        </div>
        <Textarea
          label="Overview"
          name="overview"
          value={formData.overview ?? ""}
          onChange={handleChange}
          rows={4}
        />
        <Textarea
          label="Note"
          name="note"
          value={formData.note ?? ""}
          onChange={handleChange}
          rows={3}
        />
        <div className="flex gap-4">
          <Button type="submit" variant="success">
            {isEdit ? "Update Episode" : "Save Episode"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EpisodeForm;
