import thunk from "redux-thunk";
import { apiMiddleware } from "redux-api-middleware";

import { editorMiddleware } from "./editor";

const middlewares = [thunk, apiMiddleware, editorMiddleware];

export default middlewares;
