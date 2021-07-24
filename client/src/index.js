import App from "./App.js";
import { BrowserRouter } from "react-router-dom";

var React = require("react");
var ReactDom = require("react-dom");

ReactDom.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
