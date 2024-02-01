import React, { Fragment, PropsWithChildren } from "react";

import { MediaComponent } from "types";
import { BlmMediaFormat, MediaFormatChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";

export interface CompProps {
  data: MediaComponent;
}

function BlmMediaDashboard(props: PropsWithChildren<CompProps>) {
  const { data, children } = props;
  const { format, config } = data;
  const { dispatch } = useContentEditorCtx();

  const updateChange = (newData: MediaComponent) => {
    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (event: MediaFormatChangeEvent) => {
    const { name, value } = event.target;
    const newData = { ...data };

    if (name === "format") {
      newData.format = value;
    }

    updateChange(newData);
  };

  return (
    <Fragment>
      <BlmMediaFormat data={format} formats={config?.format} onChange={handleChange} />
      {children}
    </Fragment>
  );
}

export default BlmMediaDashboard;
