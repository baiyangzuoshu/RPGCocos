
export enum ShapeType {
    None = 0,
    Round = 1,
    Rect = 2,
}

export class RoundShapeComponent {
    radius: number = 0;
}


export class RectShapeComponent {
    width: number = 0;
    height: number = 0;
}


export class ShapeComponent {
    type: ShapeType = ShapeType.None;

    shape: RoundShapeComponent | RectShapeComponent = null;
}
