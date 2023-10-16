import { Rect, Vec3, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";

export class CollectHitSystem {
    public static collectHitTest(hitPos: Vec3, 
                                 transformComponent: TransformComponent,
                                 shapeComponent: ShapeComponent): boolean {
                
        var lhs = new Rect(transformComponent.pos.x - shapeComponent.width * 0.5, transformComponent.pos.y, shapeComponent.width, shapeComponent.height);

        if(lhs.contains(v2(hitPos.x, hitPos.y))) {
            // console.log(lhs, hitPos, "#####");
            return true;
        }
        
        return false;
    }
}


