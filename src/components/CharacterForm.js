import React, { useState, useEffect } from "react";
import { appearanceData } from "../data/appearance";
import { personalityData } from "../data/personality";
import { historyData } from "../data/historyData";
import { raceData, classData, alignmentData } from "../data/character";
import { sexData } from "../data/sex";
import { generateBackstory } from "../services/grokApi";
import ErrorAlert from "./ErrorAlert";
import LoadingOverlay from "./LoadingOverlay";

function CharacterForm() {
  const [sex, setSex] = useState(sexData.find((s) => s.isDefault)?.value || "");
  const [race, setRace] = useState(
    raceData.find((r) => r.isDefault)?.value || ""
  );
  const [characterClass, setCharacterClass] = useState(
    classData.find((c) => c.isDefault)?.value || ""
  );
  const [alignment, setAlignment] = useState(
    alignmentData.find((a) => a.isDefault)?.value || ""
  );
  const [appearance, setAppearance] = useState([]);
  const [personality, setPersonality] = useState([]);
  const [history, setHistory] = useState({ verb: "", entry: "" });
  const [prompt, setPrompt] = useState("");
  const [backstory, setBackstory] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(100);

  const getRandomItem = (array, exclude = []) => {
    const available = array.filter((item) => !exclude.includes(item.value));
    return available[Math.floor(Math.random() * available.length)].value;
  };

  const generateTraits = () => {
    const newAppearance = [];
    for (let i = 0; i < 3; i++) {
      newAppearance.push(getRandomItem(appearanceData, newAppearance));
    }
    setAppearance(newAppearance);

    const newPersonality = [];
    for (let i = 0; i < 3; i++) {
      newPersonality.push(getRandomItem(personalityData, newPersonality));
    }
    setPersonality(newPersonality);

    const newEntry = getRandomItem(historyData);
    setHistory({ verb: "", entry: newEntry });
  };

  const regenerateAppearance = (index) => {
    const newAppearance = [...appearance];
    newAppearance[index] = getRandomItem(appearanceData, newAppearance);
    setAppearance(newAppearance);
  };

  const regeneratePersonality = (index) => {
    const newPersonality = [...personality];
    newPersonality[index] = getRandomItem(personalityData, newPersonality);
    setPersonality(newPersonality);
  };

  const regenerateHistory = () => {
    const newEntry = getRandomItem(historyData);
    setHistory({ verb: "", entry: newEntry });
  };

  const generatePrompt = () => {
    const promptText = `Craft a concise backstory paragraph (60–80 words) for a fantasy RPG character based on:
sex: ${sex}
race: ${race}
class: ${characterClass}
alignment: ${alignment}
appearance: (${appearance.join(", ")})
personality: (${personality.join(", ")})
history: ${history.entry})

Center the narrative on the history, dynamically selecting an appropriate verb (e.g., "fled," "sought," "defied," "haunted by," "bound to," "betrayed," "guarded") to define the character's relationship or conflict with the place, rephrasing "a [object], [modifier]", "a [modifier] [object]", or "a [object]" naturally (e.g., "a swamp, dismal" becomes "escaped shadowed marshes"). Subtly reflect alignment through traits, without naming it: Good characters show altruism and kindness, delighting in others' happiness; Evil characters show greed and cruelty, delighting in suffering; Lawful characters value order and collectivism; Chaotic characters value freedom and individuality; True Neutral characters balance these aspects. Clearly explain why the character is an adventurer, driven by their history, personality, or motivations, rather than living a quiet life. Include 1–2 subtle mannerisms (e.g., stroking a beard, cackling, muttering prayers) tied to personality or history to inspire roleplaying. Use generic fantasy terms (e.g., "bandits," "ancient ruins") to ensure compatibility with any fantasy setting. Write in an elevated, literary style with mature, evocative prose, avoiding casual slang or archaic flourishes. Ensure a cohesive, purposeful tone like a modern fantasy novel.`;

    return promptText;
  };

  const handleGenerateBackstory = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const generatedPrompt = generatePrompt();
      setPrompt(generatedPrompt);
      const result = await generateBackstory(generatedPrompt);
      setBackstory(result.backstory);
      setRemainingRequests(result.remaining);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTraits();
  }, []);

  return (
    <div className="backstoryr-container">
      {isLoading && <LoadingOverlay />}
      <h1 className="h1">
        QuestRex <span className="h1__sub">Backstoryr</span> v1.0
      </h1>
      <p className="backstoryr-introduction">
        Who the heck is your character? Tweak the options below for an
        AI-generated backstory.
      </p>
      <div className="backstoryr-content">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="group-selects">
          <div className="group-selects__form">
            <label className="label" htmlFor="sex">
              Sex
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="">Select Sex</option>
              {sexData.map((item) => (
                <option key={item.id} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="group-selects__form">
            <label className="label" htmlFor="race">
              Race
            </label>
            <select
              id="race"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            >
              <option value="">Select Race</option>
              {raceData.map((item) => (
                <option key={item.id} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="group-selects__form">
            <label className="label" htmlFor="class">
              Class
            </label>
            <select
              id="class"
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classData.map((item) => (
                <option key={item.id} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="group-selects__form">
            <label className="label" htmlFor="alignment">
              Alignment
            </label>
            <select
              id="alignment"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
            >
              <option value="">Select Alignment</option>
              {alignmentData.map((item) => (
                <option key={item.id} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="group-inputs">
          <div className="group-inputs__form">
            <h2 className="h2">3 Appearance Traits</h2>
            <div className="group-inputs__grid">
              {appearance.map((trait, index) => (
                <div key={index} className="group-inputs__form-item">
                  <span
                    className="editable-text"
                    contentEditable
                    onBlur={(e) => {
                      const newAppearance = [...appearance];
                      newAppearance[index] = e.target.textContent;
                      setAppearance(newAppearance);
                    }}
                    suppressContentEditableWarning={true}
                  >
                    {trait}
                  </span>
                  <button
                    className="btn btn__regenerate"
                    onClick={() => regenerateAppearance(index)}
                  >
                    <i className="fa fa-rotate"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="group-inputs__form">
            <h2 className="h2">3 Personality Traits</h2>
            <div className="group-inputs__grid">
              {personality.map((trait, index) => (
                <div key={index} className="group-inputs__form-item">
                  <span
                    className="editable-text"
                    contentEditable
                    onBlur={(e) => {
                      const newPersonality = [...personality];
                      newPersonality[index] = e.target.textContent;
                      setPersonality(newPersonality);
                    }}
                    suppressContentEditableWarning={true}
                  >
                    {trait}
                  </span>
                  <button
                    className="btn btn__regenerate"
                    onClick={() => regeneratePersonality(index)}
                  >
                    <i className="fa fa-rotate"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="group-inputs__form">
            <h2 className="h2">Has history with a</h2>
            <div className="group-inputs__form-item">
              <span
                className="editable-text"
                contentEditable
                onBlur={(e) => {
                  setHistory({
                    verb: "",
                    entry: e.target.textContent,
                  });
                }}
                suppressContentEditableWarning={true}
              >
                {history.entry}
              </span>
              <button
                className="btn btn__regenerate"
                onClick={regenerateHistory}
              >
                <i className="fa fa-rotate"></i>
              </button>
            </div>
          </div>

          <div className="group-inputs__form group-inputs__form--generate">
            <button
              id="generate-btn"
              className="btn btn__generate"
              onClick={handleGenerateBackstory}
              disabled={isLoading}
            >
              Generating Backstory
            </button>
          </div>

          <div className="generated-backstory">
            <div
              className={`generated-backstory__content ${
                backstory ? "generated-backstory__content--populated" : ""
              }`}
            >
              {backstory || (
                <div className="generated-backstory__placeholder-text">
                  Backstory appears after generation...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterForm;
