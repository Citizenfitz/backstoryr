import React from "react";
import { createRoot } from "react-dom/client";
import QuestRexBackstoryr from "./QuestRexBackstoryr";

const container = document.getElementById("questrex-root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QuestRexBackstoryr containerId="questrex-root" />
    </React.StrictMode>
  );
}
