import React, { ReactNode, Component, createRef, RefObject } from "react";
import clsx from "clsx";
import { ImagePanorama, Viewer } from "panolens";
import { Scene } from "three";
import { CSS3DRenderer, CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import { CustomChangeEvent, MediaConfigOptions, MediaHotspot, MediaHotspotItem } from "types";
import { StyleListTypes } from "editor-constants";
import { createShortUUID, findIndex } from "utils";
import { withBlmTemplateFrame } from "components/frames";
import { getDefaultComponentStyle } from "components/content-editor/reducers";
import { getViewerPosition } from "./utils";
import { DragControls } from "./drag-controls";
import { with360PreviewStyles, H360PreviewStyleProps } from "./styles";
import { ContainerProps } from "./container";

export type HotspotChangeEvent = CustomChangeEvent<MediaHotspotItem>;

export interface HotspotPanoramaProps extends H360PreviewStyleProps, ContainerProps {
  data: MediaHotspot;
  selectedItem?: MediaHotspotItem;
  onChange?: (event: HotspotChangeEvent) => void;
  options2?: MediaConfigOptions;
}

interface HotspotPanoramaState {
  url?: string;
  items: MediaHotspotItem[];
  selectedItem?: MediaHotspotItem;
}

class Blm360Preview extends Component<HotspotPanoramaProps, HotspotPanoramaState> {
  containerRef: RefObject<HTMLDivElement>;
  styleType = StyleListTypes.MediaHotspotItem360;
  itemMap = new Map<string, MediaHotspotItem>();
  objMap = new Map<string, any>();
  deleteMap = new Map<string, HTMLDivElement>();
  options2?: MediaConfigOptions;
  viewer: any;
  panorama: any;
  scene2: any;
  renderer2: any;
  controls: any;

  constructor(props: HotspotPanoramaProps) {
    super(props);

    this.state = { items: [] };
    this.containerRef = createRef();
    this.viewer = null;
    this.panorama = null;
    this.scene2 = null;
    this.renderer2 = null;
    this.controls = null;
    this.options2 = props.options2;
    this.animate = this.animate.bind(this);
    this.handleViewerResize = this.handleViewerResize.bind(this);
    this.handlePanoramaClick = this.handlePanoramaClick.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  updateChange(name: string, value: MediaHotspotItem) {
    const { onChange } = this.props;

    if (onChange) {
      onChange({ target: { name, value } });
    }
  }

  animate() {
    if (this.viewer && this.scene2) {
      requestAnimationFrame(this.animate);
      this.renderer2.render(this.scene2, this.viewer.camera);
    }
  }

  addItem(item: MediaHotspotItem) {
    const {
      id,
      x,
      y,
      z,
      callToAction,
      hasDark,
      name,
      style = getDefaultComponentStyle(this.styleType),
    } = item;
    const { selectedItem, classes } = this.props;
    const root = document.createElement("div");
    const mediaWrapper = document.createElement("div");
    const deleteWrapper = document.createElement("div");
    const lblWrapper = document.createElement("div");
    const img = document.createElement("img");
    const deleteBtn = document.createElement("div");
    const lbl = document.createElement("span");

    root.setAttribute("blm-role", "hotspot");
    root.setAttribute("blm-order", "1");
    root.setAttribute("blm-calltoaction", callToAction.toString());
    root.setAttribute("blm-action", "action");
    root.classList.add(
      ...clsx(classes.itemRoot, style, {
        light: !hasDark,
        [classes.selected]: item === selectedItem,
      }).split(" ")
    );

    mediaWrapper.classList.add("mediawrapper");
    lblWrapper.classList.add("hotspotlabel");
    deleteWrapper.classList.add(classes.deleteWrapper);
    deleteBtn.classList.add(classes.deleteBtn);
    lbl.textContent = name;

    mediaWrapper.appendChild(img);
    lblWrapper.appendChild(lbl);
    deleteWrapper.appendChild(deleteBtn);

    root.appendChild(mediaWrapper);
    root.appendChild(lblWrapper);
    root.appendChild(deleteWrapper);

    deleteBtn.addEventListener("click", this.handleDeleteClick);

    const object = new CSS3DSprite(root);
    object.position.set(x, y, z);
    object.rotation.y = Math.PI;
    object.scale.set(1.3, 1.3, 1);

    this.scene2?.add(object);
    this.controls.add(object);
    this.itemMap.set(id, item);
    this.objMap.set(id, object);
    this.deleteMap.set(id, deleteBtn);
  }

  updateItem(item: MediaHotspotItem) {
    const { id } = item;
    const { selectedItem, classes, styleConfig } = this.props;
    const object = this.objMap.get(id);

    if (object) {
      const root = object.element as HTMLDivElement;
      const config = styleConfig ? styleConfig[this.styleType]?.classNames : undefined;

      if (config && item === selectedItem && selectedItem.style) {
        config.forEach(function (item) {
          if (root.classList.contains(item)) {
            root.classList.remove(item);
          }
        });
        root.classList.add(selectedItem.style);
      }

      if (item === selectedItem && !root.classList.contains(classes.selected)) {
        root.classList.add(classes.selected);
      } else if (item !== selectedItem && root.classList.contains(classes.selected)) {
        root.classList.remove(classes.selected);
      }
    }

    this.itemMap.set(id, item);
  }

  removeItem(itemId: string) {
    const object = this.objMap.get(itemId);
    const deleteBtn = this.deleteMap.get(itemId);

    if (object) {
      this.scene2?.remove(object);
      this.controls.remove(object);
    }

    deleteBtn?.removeEventListener("click", this.handleDeleteClick);

    this.itemMap.delete(itemId);
    this.objMap.delete(itemId);
    this.deleteMap.delete(itemId);
  }

  updateItems() {
    const { items } = this.state;

    Array.from(this.itemMap.keys()).forEach((id) => {
      const ind = findIndex(items, id, "id");

      if (ind === -1) {
        this.removeItem(id);
      }
    });

    items.forEach((item) => {
      const oldItem = this.itemMap.get(item.id);

      if (!oldItem) {
        this.addItem(item);
      } else {
        this.updateItem(item);
      }
    });
  }

  static getDerivedStateFromProps(props: HotspotPanoramaProps, state: HotspotPanoramaState) {
    const { data, selectedItem } = props;
    let result = state;

    if (data.media?.url !== state.url) {
      result = { ...result, url: props.data.media?.url };
    }

    if (data.items !== state.items) {
      result = { ...result, items: data.items };
    }

    if (selectedItem !== state.selectedItem) {
      result = { ...result, selectedItem };
    }

    return result;
  }

  componentDidMount(): void {
    const container = this.containerRef.current;

    if (container) {
      this.viewer = new Viewer({
        container,
        controlBar: false,
        autoHideInfospot: false,
      });
      this.panorama = new ImagePanorama(this.state.url);
      this.panorama.animationDuration = 0;
      this.updateViewerSetting(this.options2);

      this.viewer.add(this.panorama);

      this.scene2 = new Scene();
      this.renderer2 = new CSS3DRenderer({ alpha: true });
      this.renderer2.setSize(container.clientWidth, container.clientHeight);
      this.renderer2.domElement.style.pointerEvents = "none";
      this.renderer2.domElement.style.position = "absolute";
      this.renderer2.domElement.style.top = 0;

      this.controls = new DragControls(this.viewer, container);

      container.appendChild(this.renderer2.domElement);

      this.viewer.addEventListener("window-resize", this.handleViewerResize);
      this.panorama.addEventListener("click", this.handlePanoramaClick);
      this.controls.addEventListener("dragend", this.handleDragEnd);
      this.animate();

      this.updateItems();
    }
  }

  private updateViewerSetting(options2?: MediaConfigOptions) {
    if (options2) {
      this.viewer.OrbitControls.minPolarAngle = 0;
      this.viewer.OrbitControls.maxPolarAngle = Math.PI;
      this.viewer.OrbitControls.minAzimuthAngle = -Infinity;
      this.viewer.OrbitControls.maxAzimuthAngle = Infinity;
      this.viewer.OrbitControls.noZoom = false;
      if (!options2.zoom) this.viewer.OrbitControls.noZoom = true;
      if (options2.vertical === "lock") {
        this.viewer.OrbitControls.minPolarAngle = (Math.PI * 2) / 4;
        this.viewer.OrbitControls.maxPolarAngle = (Math.PI * 2) / 4;
      }
      if (options2.vertical === "half") {
        this.viewer.OrbitControls.minPolarAngle = Math.PI / 3;
        this.viewer.OrbitControls.maxPolarAngle = (Math.PI * 2) / 3;
      }
      if (options2.horizontal === "lock") {
        this.viewer.OrbitControls.minAzimuthAngle = 0;
        this.viewer.OrbitControls.maxAzimuthAngle = 0;
      }
      if (options2.horizontal === "half") {
        this.viewer.OrbitControls.minAzimuthAngle = -Math.PI / 3;
        this.viewer.OrbitControls.maxAzimuthAngle = Math.PI / 3;
      }
    }
  }

  componentDidUpdate(
    prevProps: Readonly<HotspotPanoramaProps>,
    prevState: Readonly<HotspotPanoramaState>
  ): void {
    const { url, items, selectedItem } = this.state;
    const { options2 } = this.props;

    if (url !== prevState.url && this.panorama) {
      this.panorama.material.opacity = 0;
      this.panorama.material.map?.dispose();
      this.panorama.updateTexture(null);
      this.panorama.load(url);
    }

    if (items !== prevState.items || selectedItem !== prevState.selectedItem) {
      this.updateItems();
    }

    if (options2 !== prevProps.options2) {
      this.updateViewerSetting(options2);
    }
  }

  componentWillUnmount() {
    const container = this.containerRef.current;

    while (container?.lastChild) container.removeChild(container.lastChild);

    this.viewer.removeEventListener("window-resize", this.handleViewerResize);
    this.panorama.removeEventListener("click", this.handlePanoramaClick);
    this.viewer.dispose();
    this.controls!.dispose();
    this.viewer = null;
    this.panorama = null;
    this.scene2 = null;
    this.renderer2 = null;
    this.controls = null;
  }

  handleViewerResize(event: any) {
    const { width, height } = event;

    this.renderer2?.setSize(width, height);
  }

  handlePanoramaClick(event: any) {
    if (event.intersects.length || event.mouseEvent.button !== 0) {
      return;
    }

    const { data } = this.props;
    const { items, style } = data;

    if (this.viewer) {
      const position = getViewerPosition(this.viewer);

      if (position) {
        const item = new MediaHotspotItem();

        item.id = createShortUUID();
        item.name = `Hotspot ${(items?.length ?? 0) + 1}`;
        item.x = position.x;
        item.y = position.y;
        item.z = position.z;
        item.style = style ?? getDefaultComponentStyle(this.styleType);

        this.updateChange("add", item);
      }
    }
  }

  handleDragEnd(event: any) {
    const object = event.object;

    if (object) {
      this.objMap.forEach((value, key) => {
        if (object === value) {
          const item = this.itemMap.get(key);

          if (item) {
            item.x = object.position.x;
            item.y = object.position.y;
            item.z = object.position.z;
            this.updateChange("move", item);
          }
        }
      });
    }
  }

  handleDeleteClick(event: MouseEvent) {
    const target = event.target;

    this.deleteMap.forEach((value, id) => {
      if (target === value) {
        const item = this.itemMap.get(id);

        if (item) {
          this.updateChange("delete", item);
        }
      }
    });
  }

  render(): ReactNode {
    return <div ref={this.containerRef} className={this.props.classes.root} />;
  }
}

export default withBlmTemplateFrame(with360PreviewStyles(Blm360Preview));
