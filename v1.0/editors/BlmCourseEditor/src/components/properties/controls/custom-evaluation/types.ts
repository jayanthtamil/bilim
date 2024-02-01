import { CustomEvaluationProps, KeysOfType } from "types";

type EvaluationKeys = KeysOfType<CustomEvaluationProps, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: EvaluationKeys; key: string };
}
