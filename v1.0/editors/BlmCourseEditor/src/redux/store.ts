import { createStore, applyMiddleware } from "redux";

import rootReducer from "./rootReducer";
import middlewares from "./middlewares";

const initState = {};

const store = createStore(rootReducer, initState, applyMiddleware(...middlewares));

export default store;
