import React from "react";

const BlmLink = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return <a href={url}>{props.children}</a>;
};

export default BlmLink;
