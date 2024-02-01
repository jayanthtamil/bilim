import { PageEvaluationProps, KeysOfType } from "types";

type EvaluationKeys = KeysOfType<PageEvaluationProps, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: EvaluationKeys; key: string };
}
