import { ChapterEvaluationProps, KeysOfType } from "types";

type EvaluationKeys = KeysOfType<ChapterEvaluationProps, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: EvaluationKeys; key: string };
}
