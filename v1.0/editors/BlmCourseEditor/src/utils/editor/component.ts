import {
  BaseComponent,
  ButtonComponent,
  StyleListCategory,
  StyleListItems,
  MediaComponent,
  RepeaterComponent,
  SoundComponent,
  MediaRepeaterComponent,
  ButtonRepeaterComponent,
  SoundRepeaterComponent,
  ComponentAction,
  ComponentActionValues,
  MediaHotspot,
  StandardVideo,
} from "types";
import { ComponentActionTypes, ComponentTypes, MediaVariants } from "editor-constants";
import { toNumber } from "utils";

export function compareComponent<T>(a: BaseComponent<T>, b: BaseComponent<T>) {
  if (a.id && b.id) {
    return toNumber(a.id) - toNumber(b.id);
  }
  return 0;
}

export function getRepeaterComponents<T>(repeaters?: RepeaterComponent<T>[]) {
  return repeaters
    ? repeaters.reduce((arr, repeater) => [...arr, ...(repeater.value ?? [])], [] as T[])
    : [];
}

export function isMediaComponent(component: BaseComponent<any>): component is MediaComponent {
  return component.type === ComponentTypes.Media;
}

export function isButtonComponent(component: BaseComponent<any>): component is ButtonComponent {
  return component.type === ComponentTypes.Button;
}

export function isSoundComponent(component: BaseComponent<any>): component is SoundComponent {
  return component.type === ComponentTypes.Sound;
}

export function isVideoMediaComponent(component: MediaComponent): component is MediaComponent & { value?: StandardVideo } {
  return component.variant === MediaVariants.VideoStandard
}

export function isRepeaterComponent(component: BaseComponent<any>): component is RepeaterComponent {
  return component.type === ComponentTypes.Repeater;
}

export function isMediaRepeater(repeater: RepeaterComponent): repeater is MediaRepeaterComponent {
  return repeater.allowComponent === ComponentTypes.Media;
}

export function isButtonRepeater(repeater: RepeaterComponent): repeater is ButtonRepeaterComponent {
  return repeater.allowComponent === ComponentTypes.Button;
}

export function isSoundRepeater(repeater: RepeaterComponent): repeater is SoundRepeaterComponent {
  return repeater.allowComponent === ComponentTypes.Sound;
}

export function isStyleCategories(arr: StyleListItems): arr is StyleListCategory[] {
  return arr.length > 0 && arr[0] instanceof StyleListCategory;
}

export function getHotspotActions<T extends ComponentActionValues>(
  hotspot: MediaHotspot,
  type: ComponentActionTypes
) {
  type ReturnType = ComponentAction & { value: T };

  if (hotspot) {
    const { items } = hotspot;

    return items.reduce((arr, item) => {
      [item.clickAction, item.overAction].forEach((action) => {
        if (action.action === type && action.value) {
          arr.push(action as ReturnType);
        }
      });

      return arr;
    }, [] as ReturnType[]);
  }

  return [];
}
