import * as React from "react";
import PropTypes from "prop-types";
import { TreeContextProps } from "./contextTypes";
import { IconType } from "./interface";
export interface TreeNodeProps<D = any> {
    eventKey?: string;
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    onSelect?: React.MouseEventHandler<HTMLSpanElement>;
    expanded?: boolean;
    selected?: boolean;
    checked?: boolean;
    loaded?: boolean;
    loading?: boolean;
    halfChecked?: boolean;
    children?: React.ReactNode;
    title?: React.ReactNode;
    pos?: string;
    dragOver?: boolean;
    dragOverGapTop?: boolean;
    dragOverGapBottom?: boolean;
    isLeaf?: boolean;
    checkable?: boolean;
    selectable?: boolean;
    disabled?: boolean;
    disableCheckbox?: boolean;
    icon?: IconType;
    switcherIcon?: IconType;
    showOptionsIcon?: boolean;
    optionsIcon?: React.ReactNode;
    alwaysExpanded?: boolean;
    expandOnSelectorClick?: boolean;
    data?: D;
}
export interface InternalTreeNodeProps<D = any> extends TreeNodeProps<D> {
    context?: TreeContextProps;
}
export interface TreeNodeState {
    dragNodeHighlight: boolean;
    dropEffect: string;
}
declare class TreeNode extends React.Component<InternalTreeNodeProps, TreeNodeState> {
    static propTypes: {
        eventKey: PropTypes.Requireable<string>;
        prefixCls: PropTypes.Requireable<string>;
        className: PropTypes.Requireable<string>;
        style: PropTypes.Requireable<object>;
        onSelect: PropTypes.Requireable<(...args: any[]) => any>;
        expanded: PropTypes.Requireable<boolean>;
        selected: PropTypes.Requireable<boolean>;
        checked: PropTypes.Requireable<boolean>;
        loaded: PropTypes.Requireable<boolean>;
        loading: PropTypes.Requireable<boolean>;
        halfChecked: PropTypes.Requireable<boolean>;
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        title: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        pos: PropTypes.Requireable<string>;
        dragOver: PropTypes.Requireable<boolean>;
        dragOverGapTop: PropTypes.Requireable<boolean>;
        dragOverGapBottom: PropTypes.Requireable<boolean>;
        isLeaf: PropTypes.Requireable<boolean>;
        checkable: PropTypes.Requireable<boolean>;
        selectable: PropTypes.Requireable<boolean>;
        disabled: PropTypes.Requireable<boolean>;
        disableCheckbox: PropTypes.Requireable<boolean>;
        icon: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        switcherIcon: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        showOptionsIcon: PropTypes.Requireable<boolean>;
        optionsIcon: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        alwaysExpanded: PropTypes.Requireable<boolean>;
        expandOnSelectorClick: PropTypes.Requireable<boolean>;
    };
    state: {
        dragNodeHighlight: boolean;
        dropEffect: string;
    };
    selectHandle: HTMLSpanElement;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    onSelectorClick: (e: any) => void;
    onSelectorDoubleClick: (e: any) => void;
    onSelect: (e: any) => void;
    onCheck: (e: any) => void;
    onMouseEnter: (e: any) => void;
    onMouseLeave: (e: any) => void;
    onContextMenu: (e: any) => void;
    onDragStart: (e: any) => void;
    onDragEnter: (e: any) => void;
    onDragOver: (e: any) => void;
    onDragLeave: (e: any) => void;
    onDragEnd: (e: any) => void;
    onDrop: (e: any) => void;
    onExpand: (e: any) => void;
    onOptionsClick: (e: any) => void;
    setSelectHandle: (node: any) => void;
    getNodeChildren: () => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[];
    getNodeExpanded: () => boolean;
    getNodeState: () => "open" | "close";
    isLeaf: () => boolean;
    isDisabled: () => boolean;
    isCheckable: () => {};
    syncLoadData: (props: any) => void;
    isSelectable(): boolean;
    renderSwitcher: () => JSX.Element;
    renderCheckbox: () => JSX.Element;
    renderIcon: () => JSX.Element;
    renderSelector: () => JSX.Element;
    renderChildren: () => JSX.Element;
    renderOptionsIcon: () => JSX.Element;
    render(): JSX.Element;
}
declare const ContextTreeNode: React.FC<TreeNodeProps>;
export { TreeNode as InternalTreeNode };
export default ContextTreeNode;
