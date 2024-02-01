import React, { useMemo } from "react";
import clsx from "clsx";
import { Tabs } from "shared/material-ui";

import { ContentTemplateAction, MediaComponent } from "types";
import { MediaVariants } from "editor-constants";
import { getMediaVariant } from "utils";
import {
  BlmMediaImage,
  BlmMediaButton,
  BlmMediaCustom,
  BlmMediaSlideshow,
  BlmMediaTarget,
  BlmMediaVideo,
  BlmMediaHotspot,
  BlmMediaFlipCard,
  BlmSynchroVideo,
} from "components/content-editor/components";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import "./styles.scss";

interface CompProps {
  data: MediaComponent;
  temp?: ContentTemplateAction | undefined;
}

function BlmContentMedia(props: CompProps) {
  const { data, temp } = props;
  const { config, variant, isDeactivated } = data;
  const { dispatch } = useContentEditorCtx();

  const variants = useMemo(() => {
    const arr = config?.variant ?? [];

    const result = arr.reduce((result, item) => {
      if (item === MediaVariants.Button) {
        result.push(MediaVariants.Button, MediaVariants.FlipCard);
      } else {
        result.push(item);
      }

      return result;
    }, [] as MediaVariants[]);

    if (variant && !result.includes(variant)) {
      result.push(variant);
    }

    return result;
  }, [config, variant]);

  const currentIndex = useMemo(() => {
    if (variant) {
      const name = getMediaVariant(variant);
      const ind = variants.indexOf(name);

      if (ind !== -1) {
        return ind;
      }
    }
  }, [variants, variant]);

  const handleActivateClick = () => {
    const newData: MediaComponent = { ...data, isDeactivated: false };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const renderVariant = (variant: MediaVariants) => {
    switch (variant) {
      case MediaVariants.Image:
        return <BlmMediaImage key={variant} label={variant} data={data} />;
      case MediaVariants.Slideshow:
        return <BlmMediaSlideshow key={variant} label={variant} data={data} />;
      case MediaVariants.Button:
        return <BlmMediaButton key={variant} label={variant} data={data} temp={temp} />;
      case MediaVariants.FlipCard:
        return <BlmMediaFlipCard key={variant} label={variant} data={data} temp={temp} />;
      case MediaVariants.Custom:
        return <BlmMediaCustom key={variant} label={variant} data={data} />;
      case MediaVariants.Video:
        return <BlmMediaVideo key={variant} label={variant} data={data} />;
      case MediaVariants.SynchroVideo:
        return <BlmSynchroVideo key={variant} label="Synchro Video" data={data} />;
      case MediaVariants.Target:
        return <BlmMediaTarget key={variant} label={variant} data={data} />;
      case MediaVariants.Hotspot:
        return <BlmMediaHotspot key={variant} label={variant} data={data} />;
    }
    return false;
  };

  return (
    <div className={clsx("content-media-wrapper", { deactivated: isDeactivated })}>
      {variants.length && (
        <Tabs selectedIndex={currentIndex}>{variants.map((item) => renderVariant(item))}</Tabs>
      )}
      {isDeactivated && (
        <div className="content-media-activate-btn" onClick={handleActivateClick}>
          Reactivate Media
        </div>
      )}
    </div>
  );
}

export default BlmContentMedia;
