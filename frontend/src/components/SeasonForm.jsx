import { useEffect, useState } from "react";
import Card from "./Card";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";
import api from "../services/anime";

const languages = ["hindi", "english", "japanese", "tamil", "telugu"];
const otts = [
  "crunchyroll",
  "mx-player",
  "amazon-prime",
  "muse-india",
  "netflix",
];

const defaultFormData = {
  season_id: null,
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

const normalizeDubs = (dubs = []) =>
  dubs
    .map((dub) => ({
      language: dub.language ?? dub.language_sid ?? "",
      ott: dub.ott ?? dub.ott_sid ?? "",
    }))
    .filter((dub) => dub.language && dub.ott);

const SeasonForm = ({ data, anime_id, onCancel, onSaved }) => {
  if (!data) return null;

  const [formData, setFormData] = useState(defaultFormData);
  const [showDubForm, setShowDubForm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedOtt, setSelectedOtt] = useState("");

  useEffect(() => {
    if (!data) return;
    const next = { ...defaultFormData, ...data };
    next.dubs = normalizeDubs(data.dubs || []);
    setFormData(next);
  }, [data]);

  const isEdit = Boolean(formData.season_id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveSeason = async () => {
    try {
      if (isEdit) {
        const res = await api.updateSeason(formData.season_id, formData);
        if (res?.season_id) {
          alert(res.message || "Season updated");
          if (onSaved) onSaved(res);
        }
        return;
      }

      const targetAnimeId = formData.anime_id ?? anime_id;
      if (!targetAnimeId) {
        alert("Missing anime_id for season create");
        return;
      }

      const res = await api.addSeason(targetAnimeId, formData);
      if (res?.season_id) {
        alert(res.message || "Season added");
        if (onSaved) onSaved(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSeason();
  };

  const addDub = () => {
    if (!selectedLanguage || !selectedOtt) return;

    const exists = formData.dubs.some(
      (d) => d.language === selectedLanguage && d.ott === selectedOtt,
    );

    if (exists) {
      alert("Dub already exists");
      return;
    }

    const newDubs = [
      ...formData.dubs,
      { language: selectedLanguage, ott: selectedOtt },
    ];

    setFormData((prev) => ({ ...prev, dubs: newDubs }));

    setSelectedLanguage("");
    setSelectedOtt("");
    setShowDubForm(false);
  };

  const removeDub = (language, ott) => {
    const newDubs = formData.dubs.filter(
      (d) => d.language !== language || d.ott !== ott,
    );

    setFormData((prev) => ({ ...prev, dubs: newDubs }));
  };

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Season</h3>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Season Number"
            name="season_number"
            type="number"
            value={formData.season_number ?? ""}
            onChange={handleChange}
            required
          />
          <Input
            label="Season Name"
            name="season_name"
            value={formData.season_name ?? ""}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="TMDB Season ID"
            name="season_tmdb_id"
            value={formData.season_tmdb_id ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Release Date"
            name="season_rel_date"
            type="date"
            value={formData.season_rel_date ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Total Episodes"
            name="total_episodes"
            type="number"
            value={formData.total_episodes ?? 0}
            onChange={handleChange}
          />
        </div>
        <Textarea
          label="Overview"
          name="season_overview"
          value={formData.season_overview ?? ""}
          onChange={handleChange}
          rows={4}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Poster Path"
            name="poster_img"
            value={formData.poster_img ?? ""}
            onChange={handleChange}
          />
          <Input
            label="Rating"
            name="rating"
            type="number"
            step="0.1"
            value={formData.rating ?? 0}
            onChange={handleChange}
          />
          {formData.dubs.map((d, index) => (
            <div key={`${d.language}-${d.ott}-${index}`}>
              {d.language} | {d.ott}{" "}
              <span
                style={{ cursor: "pointer", color: "red" }}
                onClick={() => removeDub(d.language, d.ott)}
              >
                x
              </span>
            </div>
          ))}
        </div>
        {!showDubForm && (
          <button onClick={() => setShowDubForm(true)}>+ Add Dub</button>
        )}

        {showDubForm && (
          <div style={{ marginTop: "10px" }}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            <select
              value={selectedOtt}
              onChange={(e) => setSelectedOtt(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="">Select OTT</option>
              {otts.map((ott) => (
                <option key={ott} value={ott}>
                  {ott}
                </option>
              ))}
            </select>

            <button onClick={addDub} style={{ marginLeft: "10px" }}>
              Save
            </button>

            <button
              onClick={() => setShowDubForm(false)}
              style={{ marginLeft: "5px" }}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" variant="success">
            {isEdit ? "Update Season" : "Save Season"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SeasonForm;
