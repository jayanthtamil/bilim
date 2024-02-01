import React, { Suspense } from "react";
import ReactDOM from "react-dom";

import "./index.scss";

import App from "components/app";
import * as serviceWorker from "./serviceWorker";
import "./i18n";
/**
There are some warning abound using findDomNode used by material-ui transition component when opening properties panel for chapter. 
So I commented out strict mode. In future material ui warning is fixed, we can use strict mode.
https://github.com/mui-org/material-ui/issues/20561
https://github.com/mui-org/material-ui/issues/13394

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
*/

ReactDOM.render(
  <Suspense fallback={"Loading..."}>
    <App />
  </Suspense>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
