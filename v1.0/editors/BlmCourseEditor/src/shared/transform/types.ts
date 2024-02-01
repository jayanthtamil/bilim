export class DragGeometry {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0,
    public rotation: number = 0
  ) {}
}

export class HandleRoles {
  public static NO_ROLE = 0;
  public static RESIZE_UP = 1;
  public static RESIZE_DOWN = 2;
  public static RESIZE_LEFT = 4;
  public static RESIZE_RIGHT = 8;
  public static ROTATE = 16;
  public static MOVE = 32;

  public static isResize(val: number) {
    return (
      HandleRoles.isResizeDown(val) ||
      HandleRoles.isResizeLeft(val) ||
      HandleRoles.isResizeRight(val) ||
      HandleRoles.isResizeUp(val)
    );
  }

  public static isResizeUp(val: number) {
    return (val & HandleRoles.RESIZE_UP) === HandleRoles.RESIZE_UP;
  }

  public static isResizeDown(val: number) {
    return (val & HandleRoles.RESIZE_DOWN) === HandleRoles.RESIZE_DOWN;
  }

  public static isResizeLeft(val: number) {
    return (val & HandleRoles.RESIZE_LEFT) === HandleRoles.RESIZE_LEFT;
  }

  public static isResizeRight(val: number) {
    return (val & HandleRoles.RESIZE_RIGHT) === HandleRoles.RESIZE_RIGHT;
  }

  public static isRotate(val: number) {
    return (val & HandleRoles.ROTATE) === HandleRoles.ROTATE;
  }

  public static isMove(val: number) {
    return (val & HandleRoles.MOVE) === HandleRoles.MOVE;
  }
}

export class Point {
  public static distance(point1: Point, point2: Point): number {
    const x = point2.x - point1.x;
    const y = point2.y - point1.y;

    return Math.sqrt(x * x + y * y);
  }

  constructor(public x: number = 0, public y: number = 0) {}

  getLength(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  copyFrom(point: Point) {
    this.x = point.x;
    this.y = point.y;
  }

  equals(point: Point): boolean {
    return this === point || (point && this.x === point.x && this.y === point.y);
  }

  normalize(thickness: number = 1) {
    const current = this.getLength(),
      scale = current !== 0 ? thickness / current : 0;

    this.x *= scale;
    this.y *= scale;
  }

  offset(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  subtract(point: Point): Point {
    return new Point(this.x - point.x, this.y - point.y);
  }

  toString(): string {
    return "(x=" + this.x + " , y=" + this.y + ")";
  }
}

export class Matrix {
  constructor(
    public a: number = 1,
    public b: number = 0,
    public c: number = 0,
    public d: number = 1,
    public tx: number = 0,
    public ty: number = 0
  ) {}

  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  equals(matrix: Matrix): boolean {
    return (
      this === matrix ||
      (matrix &&
        this.a === matrix.a &&
        this.b === matrix.b &&
        this.c === matrix.c &&
        this.d === matrix.d &&
        this.tx === matrix.tx &&
        this.ty === matrix.ty)
    );
  }

  identity(): Matrix {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
    return this;
  }

  // Concat with this matrix (cos(q) -sin(q) 0, sin(q) cos(q) 0, 0 0 1)
  rotate(angle: number): Matrix {
    angle *= Math.PI / 180;
    const cos = Math.cos(angle),
      sin = Math.sin(angle),
      a = this.a,
      b = this.b,
      c = this.c,
      d = this.d,
      tx = this.tx,
      ty = this.ty;

    this.a = cos * a + sin * c;
    this.c = -sin * a + cos * c;
    this.b = cos * b + sin * d;
    this.d = -sin * b + cos * d;
    this.tx = tx * cos + ty * -sin;
    this.ty = tx * sin + ty * cos;
    return this;
  }

  // Concat with this matrix (sx 0 0, 0 sy 0, 0 0 1)
  scale(sx: number, sy: number): Matrix {
    this.a *= sx;
    this.c *= sy;
    this.b *= sx;
    this.d *= sy;
    this.tx *= sx;
    this.ty *= sy;

    return this;
  }

  translate(dx: number, dy: number): Matrix {
    this.tx += dx;
    this.ty += dy;

    return this;
  }

  concat(mx: Matrix): Matrix {
    // Not tested
    const a1 = this.a,
      b1 = this.b,
      c1 = this.c,
      d1 = this.d,
      a2 = mx.a,
      b2 = mx.b,
      c2 = mx.c,
      d2 = mx.d,
      tx2 = mx.tx,
      ty2 = mx.ty;

    this.a = a2 * a1 + c2 * b1;
    this.b = b2 * a1 + d2 * b1;
    this.c = a2 * c1 + c2 * d1;
    this.d = b2 * c1 + d2 * d1;
    this.tx += tx2 * a1 + ty2 * b1;
    this.ty += tx2 * c1 + ty2 * d1;

    return this;
  }

  transformPoint(point: Point): Point {
    const x = point.x,
      y = point.y;
    const res = new Point();

    res.x = x * this.a + y * this.c + this.tx;
    res.y = x * this.b + y * this.d + this.ty;

    return res;
  }

  invert(): Matrix {
    const det = this.a * this.d - this.b * this.c;
    const a = this.a,
      b = this.b,
      c = this.c,
      d = this.d,
      tx = this.tx,
      ty = this.ty;

    this.a = d / det;
    this.b = -b / det;
    this.c = -c / det;
    this.d = a / det;
    this.tx = (c * ty - d * tx) / det;
    this.ty = (b * tx - a * ty) / det;

    return this;
  }

  toString(): string {
    return (
      "(a=" +
      this.a +
      ", b=" +
      this.b +
      ", c=" +
      this.c +
      ", d=" +
      this.d +
      ", tx=" +
      this.tx +
      ", ty=" +
      this.ty +
      ")"
    );
  }
}

export interface IConstraint {
  applyConstraint: (
    original: DragGeometry,
    translation: DragGeometry,
    resizeHandleRole: number
  ) => void;
}
