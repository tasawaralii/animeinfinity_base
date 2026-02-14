import { useEffect, useState } from "react";
import Input from "./Input";
import Textarea from "./Textarea";
import Select from "./Select";
import Button from "./Button";
import api from "../services/anime";

const allAges = [
  { value: "1", label: "All Ages" },
  { value: "2", label: "Children" },
  { value: "3", label: "Teens 13 or older" },
  { value: "4", label: "17+ (violence & profanity)" },
  { value: "5", label: "Mild Nudity" },
];

const allGenres = [
  "action",
  "adventure",
  "comedy",
  "drama",
  "fantasy",
  "slice-of-life",
  "supernatural",
  "romance",
  "sci-fi",
  "horror",
  "mystery",
  "thriller",
  "sports",
  "music",
  "historical",
  "mecha",
  "military",
  "psychological",
  "school",
  "seinen",
  "shoujo",
  "shounen",
  "josei",
  "kids",
  "ecchi",
  "harem",
  "martial-arts",
  "parody",
  "samurai",
  "super-power",
  "vampire",
];

const defaultFormData = {
  slug: "",
  anime_tmdb_id: null,
  anime_name: "",
  backdrop_source: "",
  backdrop_img: "",
  poster_source: "",
  poster_img: "",
  age_id: "1",
  overview: "",
  duration: "",
  rating: "",
  type: "tv",
  anime_rel_date: "",
  genres: [],
};

const AnimeForm = ({ data, onCancel, onSaved }) => {
  if (!data) return null;

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (!data) return;
    setFormData({ ...defaultFormData, ...data });
  }, [data]);

  const isEdit = Boolean(formData.anime_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveAnime();
  };

  const saveAnime = async () => {
    try {
      const res = isEdit
        ? await api.updateAnime(formData.anime_id, formData)
        : await api.addAnime(formData);

      if (res?.anime_id) {
        alert(res.message || "Anime saved");
        if (onSaved) onSaved(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const input_name = e.target.name;
    const input_value = e.target.value;
    setFormData((prev) => ({ ...prev, [input_name]: input_value }));
  };

  const handleAddGenre = (genre) => {
    if (!formData.genres.includes(genre)) {
      setFormData((prev) => ({ ...prev, genres: [...prev.genres, genre] }));
    }
  };

  const handleRemoveGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Anime Name"
          name="anime_name"
          value={formData.anime_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Leave empty to auto-generate"
        />
      </div>

      <Textarea
        label="Overview"
        name="overview"
        value={formData.overview}
        onChange={handleChange}
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
        />
        <Input
          label="Rating"
          name="rating"
          type="number"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
        />
        <Input
          label="Release Date"
          name="anime_rel_date"
          type="date"
          value={formData.anime_rel_date}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={[
            { value: "tv", label: "TV Show" },
            { value: "movie", label: "Movie" },
          ]}
        />
        <Select
          label="Age Rating"
          name="age_id"
          value={formData.age_id}
          onChange={handleChange}
          options={allAges}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Poster URL"
          name="poster_img"
          value={formData.poster_img}
          onChange={handleChange}
        />
        <Select
          label="Poster Source"
          name="poster_source"
          value={formData.poster_source}
          onChange={handleChange}
          options={[
            { value: "tmdb", label: "TMDB" },
            { value: "local", label: "Local" },
          ]}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Genres</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.genres.map((genre) => (
            <span
              key={genre}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1 text-sm cursor-pointer hover:bg-blue-200"
              onClick={() => handleRemoveGenre(genre)}
              title="Remove genre"
            >
              {genre} <span className="ml-1">&times;</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {allGenres
            .filter((g) => !formData.genres.includes(g))
            .map((genre) => (
              <button
                type="button"
                key={genre}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-300"
                onClick={() => handleAddGenre(genre)}
              >
                {genre}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Backdrop URL"
          name="backdrop_img"
          value={formData.backdrop_img}
          onChange={handleChange}
        />
        <Select
          label="Backdrop Source"
          name="backdrop_source"
          value={formData.backdrop_source}
          onChange={handleChange}
          options={[
            { value: "tmdb", label: "TMDB" },
            { value: "local", label: "Local" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="External ID (TMDB)"
          name="anime_tmdb_id"
          value={formData.anime_tmdb_id}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button type="submit" variant="success">
          {isEdit ? "Update Anime" : "Add Anime"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AnimeForm;