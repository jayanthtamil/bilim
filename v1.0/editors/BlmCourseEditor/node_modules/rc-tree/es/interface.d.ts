import * as React from "react";
import { TreeNodeProps, InternalTreeNodeProps } from "./TreeNode";
export interface DataNode {
    key: string;
    title: string;
    disabled?: boolean;
    selectable?: boolean;
    children?: DataNode[];
}
export declare type IconType = React.ReactNode | ((props: TreeNodeProps) => React.ReactNode);
export declare type Key = string | number;
export declare type NodeElement<D = any> = React.ReactElement<TreeNodeProps<D>> & {
    selectHandle: HTMLSpanElement;
    type: {
        isTreeNode: boolean;
    };
};
export declare type NodeInstance<D = any> = React.Component<InternalTreeNodeProps<D>> & {
    selectHandle?: HTMLSpanElement;
};
export interface Entity<N = NodeElement> {
    node: N;
    index: number;
    key: Key;
    pos: string | number;
    parent?: Entity<N>;
    children?: Entity<N>[];
}
export { TreeNodeProps, InternalTreeNodeProps };
