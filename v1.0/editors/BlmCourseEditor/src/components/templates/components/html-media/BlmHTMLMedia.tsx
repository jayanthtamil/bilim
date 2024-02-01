import React, {
  PropsWithChildren,
  isValidElement,
  useMemo,
  MediaHTMLAttributes,
  createElement,
} from "react";

export interface CompProps extends MediaHTMLAttributes<HTMLVideoElement | HTMLAudioElement> {
  type: string;
}

//BILIM-218: React- [ Video Editor ]- Replace video in media it not displayed properly
//https://stackoverflow.com/questions/41303012/updating-source-url-on-html5-video-with-react
function BlmHTMLMedia(props: PropsWithChildren<CompProps>) {
  const { type, controls, children, autoPlay, loop, ...others } = props;

  const key = useMemo(() => {
    let result: string | undefined;

    React.Children.forEach(children, (item) => {
      if (isValidElement(item) && item.type === "source" && !result && item.props.src) {
        result = item.props.src;
      }
    });

    return result;
  }, [children]);

  return createElement(
    type,
    {
      key,
      controls: controls !== undefined,
      autoPlay: autoPlay !== undefined,
      loop: loop !== undefined,
      ...others,
    },
    children
  );
}

export default BlmHTMLMedia;
