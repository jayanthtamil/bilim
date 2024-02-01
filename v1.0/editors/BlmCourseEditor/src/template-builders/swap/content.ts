import {
  RepeaterComponent,
  MediaComponent,
  TextComponent,
  CourseElementTemplate,
  ButtonComponent,
  SoundComponent,
  MediaRepeaterComponent,
  BaseComponent,
  ButtonRepeaterComponent,
  SoundRepeaterComponent,
} from "types";
import {
  findObject,
  isButtonComponent,
  isButtonRepeater,
  isMediaComponent,
  isMediaRepeater,
  isRepeaterComponent,
  isSoundComponent,
  isSoundRepeater,
} from "utils";
import { createButtonComponent, createMediaComponent, createSoundComponent } from "../core";
import { getContentTemplateModel } from "../model";
import { setContentTemplateHTML } from "../html";
import { copyDeletableComponent } from "./common";

type SearchKeys = "id" | "mapping";

export function copyContentTemplate(
  source: CourseElementTemplate,
  destination: CourseElementTemplate,
  isRelative = true
) {
  const key = isRelative ? "id" : "mapping";

  if (source && destination) {
    const content = getContentTemplateModel(source);
    const newContent = getContentTemplateModel(destination);
    const { texts, medias, buttons, sounds, repeater } = content;
    const {
      texts: newTexts,
      medias: newMedias,
      buttons: newButtons,
      sounds: newSounds,
      repeater: newRepeater,
    } = newContent;

    copyTextComponents(texts, newTexts, key);
    copyMediaComponents(medias, [...newMedias, ...(newRepeater.medias || [])], key);
    copyButtonComponents(buttons, [...newButtons, ...(newRepeater.buttons || [])], key);
    copySoundComponents(sounds, [...newSounds, ...(newRepeater.sounds || [])], key);
    copyRepeaterComponents(repeater.medias, newRepeater.medias, newMedias, key);
    copyRepeaterComponents(repeater.buttons, newRepeater.buttons, newButtons, key);
    copyRepeaterComponents(repeater.sounds, newRepeater.sounds, newSounds, key);

    return setContentTemplateHTML(destination, newContent);
  }
  return source.html;
}

function copyTextComponents(
  sources: TextComponent[],
  destinations: TextComponent[],
  key: SearchKeys
) {
  if (sources && destinations) {
    sources.forEach((source) => {
      const destination = findComponent(destinations, key, source[key]);

      if (destination) {
        copyTextComponent(source, destination);
      }
    });
  }
}

function copyMediaComponents(
  sources: MediaComponent[],
  destinations: (MediaComponent | MediaRepeaterComponent)[],
  key: SearchKeys
) {
  if (sources && destinations) {
    sources.forEach((source) => {
      const destination = findComponent(destinations, key, source[key]);

      if (destination) {
        if (isMediaComponent(destination)) {
          copyMediaComponent(source, destination, key);
        } else {
          copyToRepeaterComponent(source, destination, key);
        }
      }
    });
  }
}

function copyButtonComponents(
  sources: ButtonComponent[],
  destinations: (ButtonComponent | ButtonRepeaterComponent)[],
  key: SearchKeys
) {
  if (sources && destinations) {
    sources.forEach((source) => {
      const destination = findComponent(destinations, key, source[key]);

      if (destination) {
        if (isButtonComponent(destination)) {
          copyButtonComponent(source, destination);
        } else {
          copyToRepeaterComponent(source, destination, key);
        }
      }
    });
  }
}

function copySoundComponents(
  sources: SoundComponent[],
  destinations: (SoundComponent | SoundRepeaterComponent)[],
  key: SearchKeys
) {
  if (sources && destinations) {
    sources.forEach((source) => {
      const destination = findComponent(destinations, key, source[key]);

      if (destination) {
        if (isSoundComponent(destination)) {
          copySoundComponent(source, destination);
        } else {
          copyToRepeaterComponent(source, destination, key);
        }
      }
    });
  }
}

function copyRepeaterComponents(
  sources: RepeaterComponent[] | undefined,
  destinations: RepeaterComponent[] | undefined = [],
  components: (MediaComponent | ButtonComponent | SoundComponent)[],
  key: SearchKeys
) {
  if (sources) {
    sources.forEach((source, ind) => {
      if (key === "id") {
        const destination = destinations[ind];

        if (destination) {
          copyRepeaterComponent(source, destination, key);
        }
      } else {
        const arr = findComponents([...destinations, ...components], source[key]);

        if (arr) {
          for (let i = 0; i < arr?.length; i++) {
            const destination = arr[i];

            if (isRepeaterComponent(destination)) {
              copyRepeaterComponent(source, destination, key);
              break;
            } else {
              copyFromRepeaterComponent(source, destination, key, i);
            }
          }
        }
      }
    });
  }
}

function copyTextComponent(source: TextComponent, destination: TextComponent) {
  if (source && destination) {
    destination.value = source.value;
    destination.isEdited = true;

    copyDeletableComponent(source, destination);
  }
}

function copyMediaComponent(source: MediaComponent, destination: MediaComponent, key: SearchKeys) {
  if (source && destination) {
    destination.variant = source.variant;
    destination.value = source.value;
    destination.isEdited = Boolean(source.variant || source.value); //While switch between templates, default image size is changed for non-edited media

    if (key === "id") {
      destination.format = source.format;
    }

    copyDeletableComponent(source, destination);
  }
}

function copyButtonComponent(source: ButtonComponent, destination: ButtonComponent) {
  if (source && destination) {
    destination.value = source.value;
    destination.isEdited = true;

    copyDeletableComponent(source, destination);
  }
}

function copySoundComponent(source: SoundComponent, destination: SoundComponent) {
  if (source && destination) {
    destination.value = source.value;
    destination.isEdited = true;

    copyDeletableComponent(source, destination);
  }
}

function copyRepeaterComponent(
  source: RepeaterComponent,
  destination: RepeaterComponent,
  key: SearchKeys
) {
  if (
    isMediaRepeater(source) &&
    isMediaRepeater(destination) &&
    source.value &&
    destination.value
  ) {
    destination.value = source.value.map((item) => {
      const newItem = { ...item };

      copyMediaComponent(item, newItem, key);

      return newItem;
    });
    destination.isEdited = true;
  } else if (
    isButtonRepeater(source) &&
    isButtonRepeater(destination) &&
    source.value &&
    destination.value
  ) {
    destination.value = source.value.map((item) => {
      const newItem = { ...item };

      copyButtonComponent(item, newItem);

      return newItem;
    });
    destination.isEdited = true;
  } else if (
    isSoundRepeater(source) &&
    isSoundRepeater(destination) &&
    source.value &&
    destination.value
  ) {
    destination.value = source.value.map((item) => {
      const newItem = { ...item };

      copySoundComponent(item, newItem);

      return newItem;
    });
    destination.isEdited = true;
  }

  if (destination.isEdited && (destination.value?.length ?? 0) > destination.maximum) {
    destination.value?.slice(0, destination.maximum);
  }
}

function copyToRepeaterComponent(
  source: MediaComponent | ButtonComponent | SoundComponent,
  destination: RepeaterComponent,
  key: SearchKeys
) {
  let component: MediaComponent | ButtonComponent | SoundComponent | undefined;

  if (!destination.isEdited) {
    destination.value = [];
    destination.isEdited = true;
  }

  if ((destination.value?.length ?? 0) > destination.maximum) {
    return;
  }

  if (isMediaComponent(source) && isMediaRepeater(destination)) {
    component = createMediaComponent(destination);

    copyMediaComponent(source, component, key);
  } else if (isButtonComponent(source)) {
    component = createButtonComponent(destination);

    copyButtonComponent(source, component);
  } else if (isSoundComponent(source)) {
    component = createSoundComponent(destination);

    copySoundComponent(source, component);
  }

  if (component) {
    destination.value?.push(component);
  }
}

function copyFromRepeaterComponent(
  source: RepeaterComponent,
  destination: MediaComponent | ButtonComponent | SoundComponent,
  key: SearchKeys,
  ind: number
) {
  if (source.value?.length && ind < source.value?.length) {
    if (isMediaRepeater(source) && isMediaComponent(destination)) {
      const component = source.value[ind];

      copyMediaComponent(component, destination, key);
    } else if (isButtonRepeater(source) && isButtonComponent(destination)) {
      const component = source.value[ind];

      copyButtonComponent(component, destination);
    } else if (isSoundRepeater(source) && isSoundComponent(destination)) {
      const component = source.value[ind];

      copySoundComponent(component, destination);
    }
  }
}

function findComponent<T extends BaseComponent<any>>(
  components: T[],
  key: SearchKeys,
  value?: string
) {
  if (!value) {
    return undefined;
  } else if (key === "id") {
    return findObject(components, value, key);
  } else {
    const arr = value.split(" ");

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < arr.length; j++) {
        const regex = createRegex(arr[j]);
        if (regex) {
          const component = components.find((comp) => checkComponent(comp, regex));

          if (component) {
            return component;
          }
        }
      }
    }
  }
}

function findComponents<T extends BaseComponent<any>>(components: T[], value?: string) {
  if (!value) {
    return undefined;
  } else {
    const arr = value.split(" ");

    for (let i = 0; i < arr.length; i++) {
      const regex = createRegex(arr[i]);

      if (regex) {
        const result = components.filter((comp) => checkComponent(comp, regex));

        if (result.length) {
          return result;
        }
      }
    }
  }
}

function createRegex(str: string, isStatic = true) {
  const pattern = isStatic ? str : str.replace(/(\d+|x)$/g, "(\\d+|x)");

  return isStatic || str !== pattern ? new RegExp(`^${pattern}$`, "g") : undefined;
}

function checkComponent(component: BaseComponent<any>, regex: RegExp) {
  const maps = component.mapping?.split(" ");

  if (maps) {
    for (let i = 0; i < maps.length; i++) {
      if (regex.test(maps[i])) {
        return true;
      }
    }
  }

  return false;
}
