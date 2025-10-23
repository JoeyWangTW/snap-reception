import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

const client = new PipecatClient({
  transport: new SmallWebRTCTransport({
    connectionUrl: "/api/offer",
  }),
});

function RootApp() {
  return (
    <PipecatClientProvider client={client}>
      <App />
    </PipecatClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

