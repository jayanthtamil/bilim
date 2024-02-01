import React, { MouseEvent, useMemo } from "react";
import clsx from "clsx";
import Tree, { TreeNode } from "rc-tree";

import { CourseElement, TreeNodeInstance } from "types";
import { ElementType } from "editor-constants";
import { getSiblingElements } from "utils";

export interface CourseTreeProps {
  data: CourseElement;
  treeType: ElementType | "template" | "associated-chapter";
  selectedItem?: CourseElement;
  allowedItems?: ElementType[] | ((item: CourseElement) => boolean);
  className?: string;
  onItemClick?: (item: CourseElement) => void;
}

function BlmCourseTree(props: CourseTreeProps) {
  const { data, treeType, selectedItem, allowedItems, className, onItemClick } = props;
  const selectedIds = selectedItem ? [selectedItem.id] : [];

  const treeData = useMemo(() => {
    if (treeType === "associated-chapter") {
      return [data];
    } else if (
      treeType === "template" &&
      [ElementType.SimpleContent, ElementType.SimplePartPage].includes(data.type)
    ) {
      return getSiblingElements(data.type === ElementType.SimplePartPage ? data.parent! : data);
    } else {
      return data.children;
    }
  }, [data, treeType]);

  const handleClick = (event: MouseEvent, node: TreeNodeInstance) => {
    const item = node.props.data;

    if (item && onItemClick) {
      onItemClick(item);
    }
  };

  const isAlwaysExpanded = (element: CourseElement) => {
    switch (element.type) {
      case ElementType.Root:
        return true;
      default:
        return false;
    }
  };

  const isAllowedItem = (element: CourseElement) => {
    if (
      !allowedItems ||
      (Array.isArray(allowedItems) ? allowedItems.includes(element.type) : allowedItems(element))
    ) {
      return true;
    }
  };

  const renderChildren = (elements: CourseElement[]) => {
    const arr = elements.filter((item) => isAllowedItem(item));

    return arr?.map((item) => {
      const children = renderChildren(item.children);

      return (
        <TreeNode
          key={item.id}
          title={item.name}
          data={item}
          alwaysExpanded={isAlwaysExpanded(item)}
          className={clsx(item.type, {
            "tree-treenode-no-children": children?.length === 0,
          })}
        >
          {children}
        </TreeNode>
      );
    });
  };

  return (
    <div className={clsx("blm-course-tree-container", treeType, className)}>
      <Tree selectedKeys={selectedIds} defaultExpandedKeys={selectedIds} onClick={handleClick}>
        {renderChildren(treeData)}
      </Tree>
    </div>
  );
}

export default BlmCourseTree;
