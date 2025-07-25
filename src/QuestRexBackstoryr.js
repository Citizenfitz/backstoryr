import React from "react";
import CharacterForm from "./components/CharacterForm";
import "./styles/style.scss";

const QuestRexBackstoryr = ({ containerId }) => {
  return (
    <div id="questrex-backstoryr-root">
      <main className="main" id="main">
        <div id="backstoryr-app" className="backstoryr-app-container">
          <CharacterForm />
        </div>
      </main>
    </div>
  );
};

export default QuestRexBackstoryr;
