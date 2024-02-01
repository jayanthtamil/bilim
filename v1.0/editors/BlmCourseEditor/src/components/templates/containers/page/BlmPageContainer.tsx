import React, { useState, MouseEvent, useCallback, useContext, useRef, useEffect } from "react";

import { CourseElement, TemplatePanelOptions, CourseElementTemplate } from "types";
import { ElementType, PageMenuTypes } from "editor-constants";
import { findIndex, getChildElement, createHTMLElement } from "utils";
import { BlmAddPartPage, BlmPageMenu } from "../../controls";
import { withBlmTemplateBoard, BlmTemplateBoardContext } from "../../hoc";
import BlmPartPageContainer, { PartPageContainer } from "../part-page";
import {
  setHotspotClass,
  RemoveHotspotClass,
  CheckHotspotContainClass,
  checkPrev,
} from "template-builders";
import { usePageContainerStyle } from "./styles";
import { usePrevious } from "hooks";

interface CompProps {
  element: CourseElement;
  templates?: CourseElementTemplate[];
  child?: CourseElement;
}

interface AddMenu {
  anchorEl: HTMLElement | null;
  templateIndex: number;
  addIndex: number;
}

const initAddMenu: AddMenu = {
  anchorEl: null,
  templateIndex: -1,
  addIndex: -1,
};

function BlmPageContainer(props: CompProps) {
  const { element, child, templates } = props;
  const [addMenu, setAddMenu] = useState(initAddMenu);
  const [focus, setFocus] = useState<CourseElement>();
  const itemsRef = useRef<(PartPageContainer | null)[]>([]);
  const templateRef = useRef<HTMLDivElement | null>(null);
  const { onShowTemplates, onLoadPartPageHotspot } = useContext(BlmTemplateBoardContext);
  const classes = usePageContainerStyle();
  const prevData = usePrevious(props.templates);
  const prevElement = usePrevious(element);
  const [size, setSize] = useState(window.innerWidth);
  let timeout: any;

  useEffect(() => {
    if (child) {
      setFocus(child);
    }
  }, [child]);

  const checkVal = useCallback(
    (val = false) => {
      if (val || !checkPrev(templates, prevData) || !CheckHotspotContainClass(templates)) {
        if (templates && templates?.length !== 0) {
          var newData: any = [...templates];
          setTimeout(() => {
            if (templateRef.current) {
              var allName = templateRef.current.getElementsByClassName("outercontainer");
              if (allName) {
                for (let i = 0; i < allName.length; i++) {
                  let refParent = Array.from(allName[i].classList).find((cls) =>
                    cls.startsWith("rt-etr-")
                  );
                  let refHotspot = allName[i]?.querySelectorAll(
                    `div[blm-component=media][blm-media^=hotspot]`
                  );
                  newData?.map((temp: CourseElementTemplate, ind: number) => {
                    var templateHtml = createHTMLElement(temp.html);
                    if (templateHtml?.classList) {
                      var templateHotspot = Array.from(templateHtml?.classList).find((cls) =>
                        cls.startsWith("rt-etr-")
                      );
                      if (templateHotspot === refParent) {
                        refHotspot?.forEach((val, i) => {
                          if (val.classList.contains("contain")) {
                            var componentRatio =
                              val.getBoundingClientRect().width /
                              val.getBoundingClientRect().height;

                            var imageVal = val
                              ?.querySelector(".imagewrapper")
                              ?.getElementsByTagName("img")[0];

                            var imageRatio =
                              (imageVal?.naturalWidth ? imageVal?.naturalWidth : 0) /
                              (imageVal?.naturalHeight ? imageVal?.naturalHeight : 0);

                            var id = val?.getAttribute("blm-id");
                            var newHtml = setHotspotClass(
                              temp,
                              `[blm-id='${id}']`,
                              componentRatio,
                              imageRatio
                            );
                            if (newHtml) {
                              newData[ind].html = newHtml;
                            }
                          } else {
                            var blmId = val?.getAttribute("blm-id");
                            var newHtmlVal = RemoveHotspotClass(temp, `[blm-id='${blmId}']`);
                            if (newHtmlVal) {
                              newData[ind].html = newHtmlVal;
                            }
                          }
                        });
                      }
                    }
                  });
                }
                if (onLoadPartPageHotspot) {
                  onLoadPartPageHotspot(element.id, newData);
                }
              }
            }
          }, 1000);
        }
      }
    },
    [element.id, onLoadPartPageHotspot, prevData, templates]
  );

  useEffect(() => {
    if (templates && templates?.length > 0) {
      checkVal();
    }
    if (templates && focus) {
      const ind = findIndex(templates, focus.id, "id");
      const item = itemsRef.current[ind];

      if (item) {
        item.focus();
        setFocus(undefined);
      }
    }
  }, [templates, focus, prevElement, checkVal]);

  useEffect(() => {
    var ok_to_resize = true;
    var handleResize = () => {
      if (size !== window.innerWidth) {
        clearTimeout(timeout);
        if (ok_to_resize) {
          ok_to_resize = false;
          setTimeout(function () {
            ok_to_resize = true;
            setSize(window.innerWidth);

            checkVal(true);
          }, 500);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [templates, focus, checkVal, size, timeout]);

  const showTemplates = (type: PageMenuTypes, position: number) => {
    if (onShowTemplates) {
      let templateType: ElementType;

      if (type === PageMenuTypes.Question) {
        templateType = ElementType.Question;
      } else {
        templateType =
          element.type === ElementType.Page ? ElementType.PartPage : ElementType.SimplePartPage;
      }

      const options = new TemplatePanelOptions(templateType);
      options.position = position;
      options.isSummary = type === PageMenuTypes.Summary;

      onShowTemplates(options);
    }
  };

  const handleAddClick = (
    event: MouseEvent<HTMLElement>,
    templateIndex: number,
    addIndex: number
  ) => {
    setAddMenu({
      anchorEl: event.currentTarget,
      templateIndex: templateIndex,
      addIndex: addIndex,
    });
  };

  const handleMenuClose = () => {
    setAddMenu({
      anchorEl: null,
      templateIndex: -1,
      addIndex: -1,
    });
  };

  const handleMenuItemClick = (type: PageMenuTypes) => {
    showTemplates(type, addMenu.addIndex);
    handleMenuClose();
  };

  const renderTemplates = () => {
    if (templates) {
      const len = templates.length;

      if (len === 0) {
        return <BlmAddPartPage key="addBtn0" value={0} onClick={(e) => handleAddClick(e, 0, 0)} />;
      } else {
        return templates.map((template, index) => {
          const chElement = getChildElement(element, template.id);

          if (chElement) {
            return (
              <BlmPartPageContainer
                ref={(el) => (itemsRef.current[index] = el)}
                key={template.id}
                index={index}
                total={len}
                element={chElement}
                template={template}
                showControls={addMenu.templateIndex === index}
                onAddClick={handleAddClick}
              />
            );
          }

          return undefined;
        });
      }
    }
  };

  return (
    <div className={classes.root} ref={templateRef}>
      {renderTemplates()}
      <BlmPageMenu
        anchorEl={addMenu.anchorEl}
        showSummary={element.isSummary}
        onClose={handleMenuClose}
        onItemClick={handleMenuItemClick}
      />
    </div>
  );
}

export default withBlmTemplateBoard(BlmPageContainer);
