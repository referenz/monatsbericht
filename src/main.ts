//import bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
