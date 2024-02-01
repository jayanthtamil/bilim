import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Tree, { arrAdd, calcDropPosition, Key, TreeNode } from "rc-tree";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CourseElement, TreeInstance, TreeNodeInstance } from "types";
import { ElementType, TreeActionTypes } from "editor-constants";
import { createUUID, getChildElement, hasAutoSummary, getElementType } from "utils";
import { TreeCompProps, TreeDragHandler } from "./types";
import {
  createOptions,
  createTree,
  createVirtualElement,
  hasEmptyTemplate,
  isDroppable,
  isDroppableAt,
  pushElement,
  updateDrop,
} from "./utils";

function BlmCourseTree(props: TreeCompProps) {
  const {
    treeType,
    data,
    ctxItem,
    selectedItem,
    action,
    courseProps,
    elementProps,
    selectedElement,
    noClick,
    courseIdCopyFrom,
    onTreeOptionsClick,
    createElement,
    renameElement,
    positionElement,
    updateAutoSummary,
    selectTreeItem,
    setTreeAction,
    getCoursePreview,
    duplicateElement,
  } = props;
  const treeRef = useRef<TreeInstance | null>(null);
  const [treeData, setTreeData] = useState(data);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [title, setTitle] = useState<string>();
  const selectedIds = selectedItem ? [selectedItem.id] : [];
  let expandTimeout: NodeJS.Timeout | undefined;
  let clickTimeout: NodeJS.Timeout | undefined;
  const { t } = useTranslation("structures");

  useEffect(() => {
    if (data) {
      const newTree = createTree(data, { action, courseProps, elementProps });

      setTreeData(newTree);
    }
  }, [data, action, courseProps, elementProps]);

  useEffect(() => {
    if (action) {
      const { type, element } = action;

      if (type === TreeActionTypes.AddItem) {
        setExpandedKeys((keys) => {
          if (!keys.includes(element.id)) {
            keys = arrAdd(keys, element.id);
          }

          return keys;
        });
      }
    }
  }, [action]);

  useEffect(() => {
    if (selectedItem && action?.type === TreeActionTypes.CopyFrom) {
      setExpandedKeys([selectedItem?.id]);
      setTreeAction();
    }
  }, [selectedItem, action, setTreeAction]);

  const handleInputRef = useCallback((element: HTMLInputElement | null) => {
    if (element) {
      setTimeout(() => {
        element.focus();
      }, 500);
    }
  }, []);

  const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    input.select();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!action) {
      return;
    }

    if (action.type === TreeActionTypes.AddItem) {
      doAdd();
    } else if (action.type === TreeActionTypes.RenameItem) {
      doRename();
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (!action) {
      return;
    }

    if (action.type === TreeActionTypes.AddItem) {
      if (event.keyCode === 13) {
        doAdd();
      } else if (event.keyCode === 27) {
        cancelAction();
      }
    } else if (action.type === TreeActionTypes.RenameItem) {
      if (event.keyCode === 13) {
        doRename();
      } else if (event.keyCode === 27) {
        cancelAction();
      }
    }
  };

  const doAdd = () => {
    if (action) {
      const { element, elementType } = action;
      const newElement = createVirtualElement(
        element,
        createUUID(),
        title || `${t("title.new")}` + t(`${getElementType(elementType)}`),
        elementType!
      );

      element.children = pushElement(element.children, newElement);

      createElement(element, newElement);
      cancelAction();
    }
  };

  const doRename = () => {
    if (action) {
      const { element } = action;

      if (title && element.name !== title) {
        element.name = title;
        renameElement(element, title);
      }

      cancelAction();
    }
  };

  const cancelAction = () => {
    setTitle(undefined);
    setTreeAction();
  };

  //To use both onClick and onDoubleClick in the same tag, we have to use timeout.. else it will call both onclick and ondoubleclick functions..
  //Note : https://stackoverflow.com/questions/35491425/double-click-and-click-on-reactjs-component
  const handleClick = (event: MouseEvent, node: TreeNodeInstance) => {
    if (!noClick) {
      event.preventDefault();

      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }

      if (event.detail === 1) {
        clickTimeout = setTimeout(() => {
          doSingleClick(node);
          clickTimeout = undefined;
        }, 250);
      } else if (event.detail === 2) {
        doDoubleClick(node);
      }
    }
  };

  const doSingleClick = (node: TreeNodeInstance) => {
    const item = node.props.data;
    const isSummary = item?.type === ElementType.Summary;

    if (item && !action && (!item.isVirtual || isSummary)) {
      const element = isSummary ? item : getChildElement(data, item?.id);
      const htmlNode = node.selectHandle?.parentNode?.parentNode as HTMLElement;

      if (element && htmlNode) {
        selectTreeItem(element, htmlNode);
      }
    }
  };

  const doDoubleClick = (node: TreeNodeInstance) => {
    const item = node.props.data;

    if (item && !item.isVirtual && !action) {
      const element = getChildElement(data, item?.id);

      if (element) {
        setTreeAction({ type: TreeActionTypes.RenameItem, element });
      }
    }
  };

  const handleOptionsClick = (info: { event: MouseEvent<HTMLElement>; node: TreeNodeInstance }) => {
    const item = info.node.props.data;

    if (item && (!item?.isVirtual || item.type === ElementType.Summary)) {
      const element = getChildElement(data, item.id);
      if (onTreeOptionsClick) {
        onTreeOptionsClick(info.event?.currentTarget, element ?? item);
      }
    }
  };

  const handleExpand = (keys: Key[]) => {
    setExpandedKeys(keys);
  };

  const handleDragEnter: TreeDragHandler = ({
    dragNode,
    node,
    dropPosition,
    expandedKeys: newExpandexKeys,
  }) => {
    validateNodeExpand(dragNode, node, dropPosition, newExpandexKeys);
  };

  const handleDragOver: TreeDragHandler = ({ dragNode, node, dropPosition }) => {
    validateNodeExpand(dragNode, node, dropPosition);
  };

  const getDropEffect = (event: MouseEvent, node: TreeNodeInstance) => {
    const tree = treeRef.current!;
    const dragNode = tree.dragNode;
    const dropPosition = calcDropPosition(event, node);

    if (isNodeDroppable(dragNode, node, dropPosition)) {
      return "move";
    }

    return "none";
  };

  const handleDrop: TreeDragHandler = ({ dragNode, node, dropPosition }) => {
    const posArr = node.props.pos!.split("-");
    const newDropPosition = dropPosition - Number(posArr[posArr.length - 1]);

    if (isNodeDroppable(dragNode, node, newDropPosition)) {
      doDrop(dragNode, node, newDropPosition);
    }
  };

  const isNodeDroppable = (
    dragNode: TreeNodeInstance,
    dropNode: TreeNodeInstance,
    dropPosition: number
  ) => {
    const tree = treeRef.current!;
    const { dragNodesKeys = [] } = tree.state;
    const children = (dropNode.props.children ?? []) as [];
    const isExpanded = isNodeExpanded(dropNode);
    const dragData = dragNode?.props.data; //dragNode is null if drag node from one tree to another
    const dropData = dropNode?.props.data;
    let dropParentData;

    //check drag itself drop over node
    if (!dragData || !dropData || dragNodesKeys.indexOf(dropNode.props.eventKey) !== -1) {
      return false;
      //BIL-214 React - Drag and drop is not working properly
    } else if (isExpanded && children.length ? dropPosition === -1 : dropPosition !== 0) {
      const { parent } = dropData;

      if (parent) {
        dropParentData = parent;
      }
    }

    return (
      isDroppable(treeData, dragData, dropParentData ?? dropData, courseProps) &&
      isDroppableAt(dropData, dropPosition, isExpanded)
    );
  };

  const isNodeExpanded = (node: TreeNodeInstance) => {
    const { eventKey } = node.props;

    return expandedKeys.indexOf(eventKey!) !== -1;
  };

  const validateNodeExpand = (
    dragNode: TreeNodeInstance,
    dropNode: TreeNodeInstance,
    dropPos: number,
    newExpandedKeys?: Key[]
  ) => {
    const tree = treeRef.current!;

    if (
      dropPos === 0 &&
      !isNodeExpanded(dropNode) &&
      isNodeDroppable(dragNode, dropNode, dropPos)
    ) {
      if (expandTimeout) {
        clearTimeout(expandTimeout);
        expandTimeout = undefined;
      }

      expandTimeout = setTimeout(() => {
        const { eventKey } = dropNode.props;
        const { dragOverNodeKey, dropPosition, expandedKeys: keys } = tree.state;

        if (!newExpandedKeys) {
          newExpandedKeys = arrAdd(keys, eventKey!);
        }

        if (
          expandedKeys.indexOf(eventKey!) === -1 &&
          dropPosition === 0 &&
          dragOverNodeKey === eventKey
        ) {
          setExpandedKeys(newExpandedKeys);
        }

        expandTimeout = undefined;
      }, 2000);
    }
  };

  const doDrop = (dragNode: TreeNodeInstance, dropNode: TreeNodeInstance, dropPosition: number) => {
    const dragData = dragNode.props.data!;
    const dropData = dropNode.props.data!;
    const isExpanded = dropNode.props.expanded ?? false;
    const element = getChildElement(data, dragData.id);

    updateDrop(treeData, dragData, dropData, dropPosition, isExpanded);

    if (element) {
      const oldParent = element?.parent;
      const oldPosition = element && oldParent?.children.indexOf(element);

      if (dropData.type === ElementType.Summary && dropData.parent) {
        updateDrop(data, dragData, dropData.parent, 0, isExpanded);
      } else {
        updateDrop(data, dragData, dropData, dropPosition, isExpanded);
      }

      const newParent = element.parent;
      const newPosition = element.parent?.children.indexOf(element);

      if (
        oldParent &&
        newParent &&
        oldPosition !== undefined &&
        oldPosition !== -1 &&
        newPosition !== undefined &&
        newPosition !== -1 &&
        (newParent.id !== oldParent.id || newPosition !== oldPosition)
      ) {
        positionElement(element, oldParent, newParent, newPosition);

        if (element.isSummary && hasAutoSummary(newParent, Infinity)) {
          updateAutoSummary(newParent, false);
        }

        setTreeData({ ...treeData });
      }
    }
  };

  const renderTitle = (item: CourseElement) => {
    if (action) {
      if (action.type === TreeActionTypes.AddItem && item.id === "newElement") {
        return (
          <input
            ref={handleInputRef}
            type="text"
            value={title ?? item.name}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onChange={handleInputChange}
          />
        );
      } else if (action.type === TreeActionTypes.RenameItem && item.id === action.element.id) {
        return (
          <input
            type="text"
            autoFocus
            value={title ?? item.name}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onChange={handleInputChange}
          />
        );
      }
    }

    return <span>{item.name}</span>;
  };

  const previewCopyFrom = (elementId: string, event: MouseEvent) => {
    if (courseIdCopyFrom) {
      getCoursePreview(courseIdCopyFrom, elementId, event.ctrlKey).then((result) => {
        if (!result.error) {
          const { file_uri } = result.payload;

          if (file_uri) {
            window.open(file_uri);
          }
        }
      });
    }
  };

  const addCopyFrom = (element: CourseElement, oldParentId: any) => {
    const urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get("courseId");
    duplicateElement(element, "CopyFrom", selectedElement?.id, courseId);
  };

  function renderOptions(item: CourseElement) {
    const options = createOptions(item, treeType, elementProps);

    return (
      <React.Fragment>
        {options.map((option, index) => (
          <span key={index} className={option} />
        ))}
        {treeType === "CopyFrom" &&
          (item.type === ElementType.Chapter ||
            item.type === ElementType.Page ||
            item.type === ElementType.Screen ||
            item.type === ElementType.Question ||
            item.type === ElementType.Evaluation ||
            item.type === ElementType.Custom) && (
            <>
              {(item.type === ElementType.Page ||
                item.type === ElementType.Screen ||
                item.type === ElementType.Question) && (
                <div
                  className="copy-from-preview"
                  onClick={(event) => previewCopyFrom(item.id, event)}
                />
              )}
              <div
                className="copy-from-add"
                onClick={(event) => addCopyFrom(item, item?.parent?.id)}
              />
            </>
          )}
      </React.Fragment>
    );
  }

  const renderChildren = (item?: CourseElement) => {
    if (item?.type !== ElementType.SimpleContent && item?.type !== ElementType.SimplePage) {
      return item?.children?.map((item) => {
        const { id, type, isVirtual } = item;
        const children = renderChildren(item);

        return (
          <TreeNode
            title={renderTitle(item)}
            key={id}
            data={item}
            showOptionsIcon={
              type === ElementType.Summary || (!isVirtual && type !== ElementType.AssociateContent)
            }
            className={clsx(item.type, {
              "tree-treenode-ctx-selected": item.id === ctxItem?.id,
              "tree-treenode-no-children": children?.length === 0,
              "tree-treenode-empty-template": hasEmptyTemplate(item),
              "tree-treenode-outdated-tempalte": item.isOutdated,
            })}
            optionsIcon={renderOptions(item)}
          >
            {children}
          </TreeNode>
        );
      });
    } else {
      return [];
    }
  };

  return (
    <div
      className={clsx("blm-tree-container", treeType, {
        "empty-tree": treeData?.children.length === 0,
      })}
    >
      <Tree
        ref={treeRef}
        draggable={!Boolean(action)}
        showOptionsIcon={true}
        expandedKeys={expandedKeys}
        selectedKeys={selectedIds}
        onExpand={handleExpand}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onOptionsClick={handleOptionsClick}
        onClick={handleClick}
        getNodeDropEffect={getDropEffect}
      >
        {renderChildren(treeData)}
      </Tree>
    </div>
  );
}

export default BlmCourseTree;
