import {
  createContext,
  useContext,
  MouseEvent as ReactMouseEvent,
  Dispatch,
  SetStateAction,
} from "react";

import { DragGeometry, HandleRoles, IConstraint, Point, Matrix } from "./types";

type SetDataState = Dispatch<SetStateAction<DragGeometry | undefined>>;
type OnChange = (data: DragGeometry) => void;

export class TransformService {
  private data = new DragGeometry();
  private constraints?: Array<IConstraint>;
  private setData?: SetDataState;
  private onChange?: OnChange;
  private temp = new Point();
  private tempMatrix = new Matrix();

  private dragging = false;
  private translation = new DragGeometry();
  private currentDragRole = HandleRoles.NO_ROLE;
  private mouseDownPoint?: Point;
  private originalData = new DragGeometry();

  constructor() {
    this.handleDocumentMouseMove = this.handleDocumentMouseMove.bind(this);
    this.handleDocumentMouseUp = this.handleDocumentMouseUp.bind(this);
  }

  startDrag(
    event: ReactMouseEvent,
    role: number,
    data: DragGeometry,
    setData: SetDataState,
    constraints?: IConstraint[],
    onChange?: OnChange
  ) {
    event.stopPropagation();
    event.preventDefault();

    this.data = data;
    this.constraints = constraints;
    this.setData = setData;
    this.onChange = onChange;

    this.dragging = true;
    this.currentDragRole = role;
    this.mouseDownPoint = new Point(event.pageX, event.pageY);
    this.originalData = { ...this.data };

    this.addDocumentListeners();
  }

  private addDocumentListeners() {
    document.addEventListener("mousemove", this.handleDocumentMouseMove);
    document.addEventListener("mouseup", this.handleDocumentMouseUp);
    document.addEventListener("mouseleave", this.handleDocumentMouseUp);
  }

  private removeDocumentListeners() {
    document.removeEventListener("mousemove", this.handleDocumentMouseMove);
    document.removeEventListener("mouseup", this.handleDocumentMouseUp);
    document.removeEventListener("mouseleave", this.handleDocumentMouseUp);
  }

  private handleDocumentMouseMove(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }

    this.translation.x = 0;
    this.translation.y = 0;
    this.translation.height = 0;
    this.translation.width = 0;

    if (HandleRoles.isMove(this.currentDragRole)) {
      this.applyMovement(event, this.translation);
      this.applyConstraints(this.translation, this.currentDragRole);
    }

    if (HandleRoles.isResizeLeft(this.currentDragRole)) {
      this.applyResizeLeft(event, this.translation);
    }
    if (HandleRoles.isResizeUp(this.currentDragRole)) {
      this.applyResizeUp(event, this.translation);
    }
    if (HandleRoles.isResizeRight(this.currentDragRole)) {
      this.applyResizeRight(event, this.translation);
    }
    if (HandleRoles.isResizeDown(this.currentDragRole)) {
      this.applyResizeDown(event, this.translation);
    }

    this.applyConstraints(this.translation, this.currentDragRole);
    this.applyAnchorPoint(this.originalData, this.translation, this.currentDragRole);
    this.applyTranslation(this.translation);

    this.updateModel({ ...this.data });
  }

  private handleDocumentMouseUp() {
    this.removeDocumentListeners();
    this.dragging = false;

    this.updateModel(undefined);

    if (this.onChange) {
      this.onChange(this.data);
    }
  }

  private updateModel(data?: DragGeometry) {
    if (this.setData) {
      this.setData(data);
    }
  }

  // For Move, Resize and Rotate actions
  private applyConstraints(translation: DragGeometry, currentDragRole: number) {
    if (this.constraints) {
      this.constraints.forEach((constraint) =>
        constraint.applyConstraint(this.originalData, translation, currentDragRole)
      );
    }
  }

  private applyAnchorPoint(
    original: DragGeometry,
    translation: DragGeometry,
    currentDragRole: number
  ) {
    if (HandleRoles.isRotate(currentDragRole)) {
      let mid = new Point(original.width / 2, original.height / 2);

      this.tempMatrix.identity();
      this.tempMatrix.rotate(original.rotation);
      this.temp = this.tempMatrix.transformPoint(mid);

      this.tempMatrix.identity();
      this.tempMatrix.rotate(original.rotation + translation.rotation);

      mid = this.tempMatrix.transformPoint(mid);

      translation.x = this.temp.x - mid.x;
      translation.y = this.temp.y - mid.y;
    }

    if (HandleRoles.isResize(currentDragRole)) {
      const proportion = this.getAnchorProportion(currentDragRole);

      this.tempMatrix.identity();
      this.tempMatrix.rotate(original.rotation);

      this.temp.x =
        proportion.x * (translation.width + this.originalData.width) -
        proportion.x * this.originalData.width;
      this.temp.y =
        proportion.y * (translation.height + this.originalData.height) -
        proportion.y * this.originalData.height;

      this.temp = this.tempMatrix.transformPoint(this.temp);

      translation.x += this.temp.x;
      translation.y += this.temp.y;
    }
  }

  private getAnchorProportion(resizeHandleRole: number) {
    const anchorPoint = new Point();

    if (HandleRoles.isResizeUp(resizeHandleRole)) {
      if (HandleRoles.isResizeLeft(resizeHandleRole)) {
        // Upper left handle being used, so the lower right corner should not move.
        anchorPoint.x = -1;
        anchorPoint.y = -1;
      } else if (HandleRoles.isResizeRight(resizeHandleRole)) {
        // Upper right handle
        anchorPoint.x = 0;
        anchorPoint.y = -1;
      } else {
        anchorPoint.x = -0.5;
        anchorPoint.y = -1;
      }
    } else if (HandleRoles.isResizeDown(resizeHandleRole)) {
      if (HandleRoles.isResizeLeft(resizeHandleRole)) {
        // lower left handle
        anchorPoint.x = -1;
        anchorPoint.y = 0;
      } else if (HandleRoles.isResizeRight(resizeHandleRole)) {
        // lower right handle
        anchorPoint.x = 0;
        anchorPoint.y = 0;
      } else {
        // middle bottom handle
        anchorPoint.x = -0.5;
        anchorPoint.y = 0;
      }
    } else if (HandleRoles.isResizeLeft(resizeHandleRole)) {
      // left middle handle
      anchorPoint.x = -1;
      anchorPoint.y = -0.5;
    } else {
      // right middle
      anchorPoint.x = 0;
      anchorPoint.y = -0.5;
    }
    return anchorPoint;
  }

  private applyTranslation(translation: DragGeometry) {
    if (this.data.hasOwnProperty("x")) {
      this.data.x = translation.x + this.originalData.x;
    }
    if (this.data.hasOwnProperty("y")) {
      this.data.y = translation.y + this.originalData.y;
    }
    if (this.data.hasOwnProperty("width")) {
      this.data.width = translation.width + this.originalData.width;
    }
    if (this.data.hasOwnProperty("height")) {
      this.data.height = translation.height + this.originalData.height;
    }
    if (this.data.hasOwnProperty("rotation")) {
      this.data.rotation = translation.rotation + this.originalData.rotation;
    }
  }

  private applyMovement(event: MouseEvent, translation: DragGeometry) {
    if (!this.mouseDownPoint) {
      return;
    }

    this.temp.x = event.pageX;
    this.temp.y = event.pageY;

    const deltaX = this.temp.x - this.mouseDownPoint.x;
    const deltaY = this.temp.y - this.mouseDownPoint.y;

    translation.x = deltaX;
    translation.y = deltaY;
  }

  private applyResizeRight(event: MouseEvent, translation: DragGeometry) {
    if (!this.mouseDownPoint) {
      return;
    }

    this.temp.x = event.pageX;
    this.temp.y = event.pageY;

    this.tempMatrix.identity();
    this.tempMatrix.rotate(this.originalData.rotation);

    const invMatrix = this.tempMatrix.clone();
    invMatrix.invert();

    const localOriginalMousePoint = invMatrix.transformPoint(this.mouseDownPoint);
    const localMousePoint = invMatrix.transformPoint(this.temp);

    const resizeDistance = localMousePoint.x - localOriginalMousePoint.x;

    translation.width += resizeDistance;
  }

  private applyResizeDown(event: MouseEvent, translation: DragGeometry) {
    if (!this.mouseDownPoint) {
      return;
    }

    this.temp.x = event.pageX;
    this.temp.y = event.pageY;

    this.tempMatrix.identity();
    this.tempMatrix.rotate(this.originalData.rotation);

    const invMatrix = this.tempMatrix.clone();
    invMatrix.invert();

    const localOriginalMousePoint = invMatrix.transformPoint(this.mouseDownPoint);
    const localMousePoint = invMatrix.transformPoint(this.temp);

    const resizeDistance = localMousePoint.y - localOriginalMousePoint.y;

    translation.height += resizeDistance;
  }

  private applyResizeLeft(event: MouseEvent, translation: DragGeometry) {
    if (!this.mouseDownPoint) {
      return;
    }

    this.temp.x = event.pageX;
    this.temp.y = event.pageY;

    this.tempMatrix.identity();
    this.tempMatrix.rotate(this.originalData.rotation);

    const invMatrix = this.tempMatrix.clone();
    invMatrix.invert();

    const localOriginalMousePoint = invMatrix.transformPoint(this.mouseDownPoint);
    const localMousePoint = invMatrix.transformPoint(this.temp);

    const resizeDistance = localOriginalMousePoint.x - localMousePoint.x;

    translation.width += resizeDistance;
  }

  private applyResizeUp(event: MouseEvent, translation: DragGeometry) {
    if (!this.mouseDownPoint) {
      return;
    }

    this.temp.x = event.pageX;
    this.temp.y = event.pageY;

    this.tempMatrix.identity();
    this.tempMatrix.rotate(this.originalData.rotation);

    const invMatrix = this.tempMatrix.clone();
    invMatrix.invert();

    const localOriginalMousePoint = invMatrix.transformPoint(this.mouseDownPoint);
    const localMousePoint = invMatrix.transformPoint(this.temp);

    const resizeDistance = localOriginalMousePoint.y - localMousePoint.y;

    translation.height += resizeDistance;
  }
}

export class MovementConstraint implements IConstraint {
  constructor(
    public minX: number = NaN,
    public minY: number = NaN,
    public maxX: number = NaN,
    public maxY: number = NaN
  ) {}

  applyConstraint(original: DragGeometry, translation: DragGeometry, resizeHandleRole: number) {
    if (!isNaN(this.maxX)) {
      if (original.x + translation.x + original.width + translation.width > this.maxX) {
        if (HandleRoles.isMove(resizeHandleRole)) {
          translation.x = this.maxX - (original.x + original.width);
        } else if (HandleRoles.isResizeRight(resizeHandleRole)) {
          translation.width = this.maxX - (original.x + translation.x + original.width);
        }
      }
    }
    if (!isNaN(this.maxY)) {
      if (original.y + translation.y + original.height + translation.height > this.maxY) {
        if (HandleRoles.isMove(resizeHandleRole)) {
          translation.y = this.maxY - (original.y + original.height);
        } else if (HandleRoles.isResizeDown(resizeHandleRole)) {
          translation.height = this.maxY - (original.y + translation.y + original.height);
        }
      }
    }
    if (!isNaN(this.minX)) {
      if (original.x + translation.x < this.minX) {
        translation.x = this.minX - original.x;
      }
      if (
        HandleRoles.isResizeLeft(resizeHandleRole) &&
        original.x - translation.width < this.minX
      ) {
        translation.width = -this.minX + original.x;
      }
    }
    if (!isNaN(this.minY)) {
      if (original.y + translation.y < this.minY) {
        translation.y = this.minY - original.y;
      }
      if (HandleRoles.isResizeUp(resizeHandleRole) && original.y - translation.height < this.minY) {
        translation.height = -this.minY + original.y;
      }
    }
  }
}

export class SizeConstraint implements IConstraint {
  constructor(
    public minWidth: number = NaN,
    public minHeight: number = NaN,
    public maxWidth: number = NaN,
    public maxHeight: number = NaN
  ) {}

  public applyConstraint(
    original: DragGeometry,
    translation: DragGeometry,
    resizeHandleRole: number
  ) {
    if (!isNaN(this.maxWidth)) {
      if (original.width + translation.width > this.maxWidth) {
        translation.width = this.maxWidth - original.width;
      }
    }
    if (!isNaN(this.maxHeight)) {
      if (original.height + translation.height > this.maxHeight) {
        translation.height = this.maxHeight - original.height;
      }
    }
    if (!isNaN(this.minWidth)) {
      if (original.width + translation.width < this.minWidth) {
        translation.width = this.minWidth - original.width;
      }
    }
    if (!isNaN(this.minHeight)) {
      if (original.height + translation.height < this.minHeight) {
        translation.height = this.minHeight - original.height;
      }
    }
  }
}

export const TransformContext = createContext(new TransformService());

export const useTransformContext = () => {
  return useContext(TransformContext);
};
