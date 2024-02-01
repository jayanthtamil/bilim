import React, { MouseEvent } from "react";
import clsx from "clsx";

import { BaseComponent, ButtonComponent, MediaComponent, SoundComponent } from "types";
import { ComponentTypes } from "editor-constants";
import { isButtonComponent, isMediaComponent, isSoundComponent } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import BlmTextCard from "../text-card";
import BlmMediaCard from "../media-card";
import BlmButtonCard from "../button-card";
import BlmSoundCard from "../sound-card";
import { StyleListTypes } from "editor-constants";
import { useComponentListStyle } from "./styles";

export interface CompProps {
  type: ComponentTypes;
  data: BaseComponent<any>[];
  onClick?: (event: MouseEvent) => void;
}

function BlmComponentList(props: CompProps) {
  const { type, data, onClick } = props;
  const { component, selectComponent } = useContentEditorCtx();
  const classes = useComponentListStyle();

  const handleClick = (data: MediaComponent | ButtonComponent | SoundComponent) => {
    if (selectComponent) {
      selectComponent(data);
    }
  };

  return (
    <div className={clsx(classes.root, type)} onClick={onClick}>
      {data.map((item, ind) => {
        const isSelected = component === item;

        if (item.type === ComponentTypes.Text) {
          return <BlmTextCard key={item.id} data={item} />;
        } else if (isMediaComponent(item)) {
          return (
            <BlmMediaCard
              key={item.id}
              data={item}
              order={ind + 1}
              isSelected={isSelected}
              onClick={handleClick}
            />
          );
        } else if (isButtonComponent(item)) {
          return (
            <BlmButtonCard
              key={item.id}
              data={item}
              isSelected={isSelected}
              onClick={handleClick}
              type={StyleListTypes.Button}
            />
          );
        } else if (isSoundComponent(item)) {
          return (
            <BlmSoundCard key={item.id} data={item} isSelected={isSelected} onClick={handleClick} />
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

export default BlmComponentList;
