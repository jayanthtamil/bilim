import {
  CourseStyle,
  StyleCSSFiles,
  CMSFile,
  StyleConfig,
  StylePropertiesConfig,
  StyleMetadataConfig,
  StyleList,
  StyleListItems,
  StyleListItem,
  StyleListCategory,
  SimpleObject,
  StyleListConfig,
  StyleListMap,
  ColorList,
  ColorListItem,
  FontList,
  FontListItem,
} from "types";
import { ColorListTypes, FontListTypes, StyleListTypes } from "editor-constants";
import { findObject, toNumber } from "utils";
import { CourseStyleResponse, StyleFileResponse } from "../types";

export const convertToStyleModel = (response: CourseStyleResponse) => {
  const result = new CourseStyle(response.id, response.name);
  result.children = getFiles(response.styles);
  result.config = getConfig(result);
  result.cssFiles = getCSSFiles(result);
  result.styles = getStyleList(result);
  result.colors = getColorList(result);
  result.fonts = getFontList(result);

  return result;
};

const getFiles = (files: StyleFileResponse[]) => {
  const arr = [];

  if (files) {
    for (let file of files) {
      const { name, isFolder, path, content, children } = file;
      const item = new CMSFile(name, path);

      item.isFolder = isFolder;
      item.content = content;

      if (isFolder && children) {
        item.children = getFiles(children);
      }

      arr.push(item);
    }
  }

  return arr;
};

const getConfig = (style: CourseStyle) => {
  const config = new StyleConfig();

  if (style.children) {
    const file = findObject(style.children, "blmconfig.json", "name");
    const obj = JSON.parse(file?.content || "{}");

    if (obj) {
      const { name, framework, display, properties, metadatas, navigation } = obj;
      config.name = name;
      config.framework = framework;
      config.display = display;
      config.navigation = navigation;

      if (properties) {
        const props = new StylePropertiesConfig();

        for (let key in properties) {
          props[key] = properties[key];
        }

        config.properties = props;
      }

      if (metadatas) {
        const metadata = new StyleMetadataConfig();

        for (let key in metadatas) {
          metadata[key] = metadatas[key];
        }

        config.metadatas = metadata;
      }
    }
  }

  return config;
};

const getCSSFiles = (style: CourseStyle) => {
  const files = new StyleCSSFiles();

  if (style.children) {
    const folder = findObject(style.children, "css", "name");

    if (folder && folder.children) {
      files.fonts = findObject(folder.children, "fontfaces.css", "name")?.path;
      files.template = findObject(folder.children, "templates.css", "name")?.path;
      files.bootstrap = findObject(folder.children, "custom-bootstrap.css", "name")?.path;
    }
  }

  return files;
};

const getStyleList = (style: CourseStyle) => {
  const styles = new StyleList();
  const types = Object.values(StyleListTypes);

  if (style.children) {
    const folder = findObject(style.children, "css", "name");
    const thumbnail = findObject(folder?.children || [], "thumbnail", "name");

    if (folder && folder.children) {
      const file = findObject(folder.children, "componentstyles.json", "name");
      const obj = JSON.parse(file?.content || "{}");

      for (const prop in obj) {
        if (types.includes(prop as StyleListTypes)) {
          styles[prop as StyleListTypes] = createStyleListConfig(obj[prop], thumbnail);
        }
      }
    }
  }

  return styles;
};

const createStyleListConfig = (obj: SimpleObject, folder?: CMSFile) => {
  const config = new StyleListConfig();
  const items = createStyleListItems(obj, folder);
  const { map, classNames } = createStyleListMap(items);

  config.items = items;
  config.map = map;
  config.classNames = classNames;

  return config;
};

const createStyleListItems = (obj: SimpleObject, folder?: CMSFile) => {
  const items = [];
  const files = folder?.children || [];

  for (const prop in obj) {
    const val = obj[prop];

    if (typeof val === "string") {
      const item = new StyleListItem();
      item.name = prop;
      item.className = val;
      item.url = findObject(files, val + ".png", "name")?.path;
      item.overUrl = findObject(files, val + "_over.png", "name")?.path;

      items.push(item);
    } else {
      const category = new StyleListCategory();
      category.name = prop;
      category.items = createStyleListItems(val, folder) as StyleListItem[];

      items.push(category);
    }
  }

  return items as StyleListItems;
};

const createStyleListMap = (items: StyleListItems) => {
  const result = { map: new StyleListMap(), classNames: [] as string[] };
  const reducer = (init: typeof result, item: StyleListCategory | StyleListItem) => {
    const { map, classNames } = init;

    if (item instanceof StyleListCategory) {
      item.items.reduce(reducer, init);
    } else {
      const { className } = item;

      map[className] = item;
      classNames.push(className);
    }

    return init;
  };

  return (items as StyleListCategory[]).reduce(reducer, result);
};

const getColorList = (style: CourseStyle) => {
  const colors = new ColorList();
  const types = Object.values(ColorListTypes);

  if (style.children) {
    const folder = findObject(style.children, "css", "name");

    if (folder && folder.children) {
      const file = findObject(folder.children, "componentstyles.json", "name");
      const obj = JSON.parse(file?.content || "{}");

      for (const prop in obj.colors) {
        if (types.includes(prop as ColorListTypes)) {
          colors[prop as ColorListTypes] = createColorListItems(obj.colors[prop]);
        }
      }
    }
  }

  return colors;
};

const createColorListItems = (obj: SimpleObject) => {
  const items = [];

  for (const prop in obj) {
    const val = obj[prop];

    if (Array.isArray(val) && val.length > 1) {
      const item = new ColorListItem();
      item.name = prop;
      item.color = val[0];
      item.alpha = toNumber(val[1]) ?? 100;

      items.push(item);
    }
  }

  return items;
};

const getFontList = (style: CourseStyle) => {
  const fonts = new FontList();
  const types = Object.values(FontListTypes);

  if (style.children) {
    const folder = findObject(style.children, "css", "name");

    if (folder && folder.children) {
      const file = findObject(folder.children, "componentstyles.json", "name");
      const obj = JSON.parse(file?.content || "{}");

      for (const prop in obj.font) {
        if (types.includes(prop as FontListTypes)) {
          fonts[prop as FontListTypes] = createFontListItems(obj.font[prop]);
        }
      }
    }
  }

  return fonts;
};

const createFontListItems = (obj: SimpleObject) => {
  const items = [];

  for (const prop in obj) {
    const val = obj[prop];
    const item = new FontListItem();
    item.name = prop;
    item.fontFamily = val;

    items.push(item);
  }

  return items;
};
