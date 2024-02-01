import {
  Action,
  ActionFromReducersMapObject,
  Dispatch,
  MiddlewareAPI,
  StateFromReducersMapObject,
} from "redux";
import { InternalError, RequestError, ApiError, RSAAResultAction } from "redux-api-middleware";

import { reducers } from "./rootReducer";
import store from "./store";

export type RootState = StateFromReducersMapObject<typeof reducers>;
export type RootActions = ActionFromReducersMapObject<typeof reducers>;

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;

export type ApiReturnType = Promise<RSAAResultAction<any, any>>;

export type AppThunkStore = MiddlewareAPI<AppThunkDispatch, RootState>;

export interface AppThunkDispatch extends Dispatch {
  <ActionType extends Action>(action: ActionType): ActionType;
  <ReturnType>(action: AppThunkAction<ReturnType>): ReturnType;
}

export type AppThunkAction<ReturnType> = {
  (dispatch: AppThunkDispatch, getState: () => RootState): ReturnType;
};

export type RSAAThunkAction = AppThunkAction<ApiReturnType>;
export type ApiThunkAction = AppThunkAction<ApiReturnType | undefined | null>;

export type ApiResultError = {
  status: boolean;
  payload: InternalError | RequestError | ApiError;
};

export type ApiResultAction<Type> = {
  type: Type;
  payload: any;
  meta?: any;
  error: boolean;
};
