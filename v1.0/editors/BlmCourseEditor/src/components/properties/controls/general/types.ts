import { CourseElementProps, KeysOfType } from "types";

type ElementKeys = KeysOfType<CourseElementProps, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: ElementKeys; key: string };
}
