import React, {
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import clamp from "lodash/clamp";

import { MediaHotspotItem, CustomChangeEvent, MediaHotspot } from "types";
import { StyleListTypes } from "editor-constants";
import { convertToPercentage, createShortUUID, getMouseRelativePos, resize } from "utils";
import { withBlmTemplateFrame } from "components/frames";
import { useContentEditorCtx } from "components/content-editor/core";
import { getDefaultComponentStyle } from "components/content-editor/reducers";
import BlmHotspotItem from "../item";
import { useClassicPreviewStyle } from "./styles";

export type HotspotChangeEvent = CustomChangeEvent<MediaHotspotItem>;

export interface CompProps {
  data: MediaHotspot;
  selectedItem?: MediaHotspotItem;
  onChange?: (event: HotspotChangeEvent) => void;
}

interface DragState {
  status: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  item?: MediaHotspotItem;
}

const initDrag: DragState = { status: false, startX: 0, startY: 0, endX: 0, endY: 0 };

function BlmClassicPreview(props: CompProps) {
  const { data, selectedItem, onChange } = props;
  const { media, groups, items, display, style } = data;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(initDrag);
  const [dragged, setDragged] = useState<DragState>();
  const containerRef = useRef<HTMLDivElement>(null);
  const classes = useClassicPreviewStyle();
  const { element } = useContentEditorCtx();
  const { width, height } = size;
  const styleType = element?.isSummary
    ? StyleListTypes.MediaHotspotItemSummary
    : StyleListTypes.MediaHotspotItem;

  const updateChange = useCallback(
    (name: string, value: MediaHotspotItem) => {
      if (onChange) {
        onChange({ target: { name, value } });
      }
    },
    [onChange]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (container) {
      const { offsetWidth, offsetHeight } = container;

      setContainer((state) => {
        if (offsetWidth !== state.width || offsetHeight !== state.height) {
          return { width: offsetWidth, height: offsetHeight };
        }

        return state;
      });
    }
  });

  useEffect(() => {
    setSize(resize(image.width, image.height, container.width, container.height));
  }, [container, image]);

  useEffect(() => {
    if (dragged) {
      const { status, startX, startY, endX, endY, item: dragItem } = dragged;

      if (status && dragItem) {
        const newItem = { ...dragItem };
        const diffX = convertToPercentage(endX - startX, width);
        const diffY = convertToPercentage(endY - startY, height);

        newItem.x = clamp(newItem.x + diffX, 0, 100);
        newItem.y = clamp(newItem.y + diffY, 0, 100);

        updateChange("move", newItem);

        setDragged(undefined);
      }
    }
  }, [dragged, width, height, updateChange]);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const { x, y } = getMouseRelativePos(event);
    const item = new MediaHotspotItem();

    item.id = createShortUUID();
    item.name = `Hotspot ${(items?.length ?? 0) + 1}`;
    item.x = convertToPercentage(x, width);
    item.y = convertToPercentage(y, height);
    item.style = style ?? getDefaultComponentStyle(styleType);

    updateChange("add", item);
  };

  const handleItemMouseDown = (event: ReactMouseEvent, item: MediaHotspotItem) => {
    const doc = containerRef.current?.ownerDocument;

    if (doc) {
      event.preventDefault();
      event.stopPropagation();

      setDragging({
        status: true,
        startX: event.pageX,
        startY: event.pageY,
        endX: event.pageX,
        endY: event.pageY,
        item,
      });

      doc.addEventListener("mousemove", handleDocumentMouseMove);
      doc.addEventListener("mouseup", handleDocumentMouseUp);
    }
  };

  const handleDocumentMouseMove = useCallback(
    (event: MouseEvent) => {
      const { pageX, pageY } = event;

      setDragging((state) => ({
        ...state,
        endX: pageX,
        endY: pageY,
      }));
    },
    [setDragging]
  );

  const handleDocumentMouseUp = useCallback(
    (event: MouseEvent) => {
      const doc = containerRef.current?.ownerDocument;

      if (doc) {
        setDragging((state) => {
          setDragged(state);

          return { ...initDrag };
        });

        doc.removeEventListener("mousemove", handleDocumentMouseMove);
        doc.removeEventListener("mouseup", handleDocumentMouseUp);
      }
    },
    [setDragging, setDragged, handleDocumentMouseMove]
  );

  const handleItemDelete = (deleted: MediaHotspotItem) => {
    updateChange("delete", deleted);
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.target as HTMLImageElement;

    setImage({ width: naturalWidth, height: naturalHeight });
  };

  const renderItems = () => {
    if (items) {
      const { status, startX, startY, endX, endY, item: dragItem } = dragging;

      return items.map((item) => {
        let translationX = 0;
        let translationY = 0;

        if (status && item.id === dragItem?.id) {
          translationX = convertToPercentage(endX - startX, width);
          translationY = convertToPercentage(endY - startY, height);
        }

        return (
          <BlmHotspotItem
            key={item.id}
            data={item}
            groups={groups}
            styleType={styleType}
            selected={item === selectedItem}
            translationX={translationX}
            translationY={translationY}
            onMouseDown={(event) => handleItemMouseDown(event, item)}
            onDelete={handleItemDelete}
          />
        );
      });
    }
  };

  return (
    <div ref={containerRef} className={classes.root}>
      <div
        style={{ width: width + "px", height: height + "px" }}
        className={classes.container}
        onMouseDown={handleMouseDown}
      >
        <div
          blm-id="1"
          blm-component="media"
          blm-media="hotspot"
          style={{ width: "100%", height: "100%" }}
          className={clsx("mainmedia", "hotspot", display.type)}
        >
          <div className="mediawrapper" style={{ width: "100%", height: "100%" }}>
            <div className="imagewrapper" style={{ width: "100%", height: "100%" }}>
              <img
                src={media?.url}
                alt="hotspot"
                style={{ width: "100%", height: "100%" }}
                className={classes.img}
                onLoad={handleLoad}
              />
              {renderItems()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withBlmTemplateFrame(BlmClassicPreview);
