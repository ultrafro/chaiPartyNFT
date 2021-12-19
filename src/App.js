//bismillah
import React from "react";
import logo from "./logo.svg";
import "./App.css";
import ThreeCanvas from "./ThreeCanvas.tsx";
import {
  BrowserRouter,
  Router,
  Switch,
  Route,
  Link,
  hashHistory,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header"></header> */}
      <BrowserRouter>
        <Route path="*" component={ThreeCanvas}></Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
