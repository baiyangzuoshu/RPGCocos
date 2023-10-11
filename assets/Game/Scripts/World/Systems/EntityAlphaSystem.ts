import PathFindingAgent from "../../3rd/map/road/PathFindingAgent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";


export class EntityAlphaSystem {
    public static Update(unitComponent: UnitComponent, 
                        transformComponent: TransformComponent): void {

        var roadNode = PathFindingAgent.instance.getRoadNodeByPixel(transformComponent.pos.x, transformComponent.pos.y);
        if(!roadNode || unitComponent.uiOpacity === null) {
            return;
        }


         switch(roadNode.value) {
            case 2://如果是透明节点时
                if(unitComponent.uiOpacity.opacity != 102) {
                    unitComponent.uiOpacity.opacity = 102;
                }
            break;
            case 3://如果是隐藏节点时
                if(unitComponent.uiOpacity.opacity > 0) {
                    unitComponent.uiOpacity.opacity = 0;
                }
                break;
            default:
                if(unitComponent.uiOpacity.opacity != 255) {
                    unitComponent.uiOpacity.opacity = 255;
                }
            break;
        }
    }
}




