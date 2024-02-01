import { MediaHotspot, KeysOfType } from "types";

type HotspotKeys = KeysOfType<MediaHotspot, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: HotspotKeys; key: string };
}

export const changeKeyMap: ChangeKeyMap = {
  groups_chk: { obj: "groups", key: "enabled" },
  display_type: { obj: "display", key: "type" },
};
