import { Rect, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { NPCInteractiveComponent, InteractiveState } from "../Components/NPCInteractiveComponent";
import { RectShapeComponent, ShapeComponent, ShapeType } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { NPCEntity } from "../Entities/NPCEntity";
import { PlayerEntity } from "../Entities/PlayerEntity";
import { EntityUtils } from "../EntityUtils";

export class NPCInteractiveTestSystem {
    public static Update(npcShape: ShapeComponent, 
                         npcInteractive: NPCInteractiveComponent,
                         playerShape: ShapeComponent,
                         npcTransform: TransformComponent,
                         playerTransform: TransformComponent,
                         npcBaseComponent: BaseComponent,
                         playerBaseComponent: BaseComponent) {

        if(npcShape.type === ShapeType.None || playerShape.type === ShapeType.None) {
            return;
        }

        if(npcShape.type === ShapeType.Rect && playerShape.type === ShapeType.Rect) {
            var lhs = new Rect();
            lhs.center = v2(npcTransform.pos.x, npcTransform.pos.y);
            lhs.size = size((npcShape.shape as RectShapeComponent).width, (npcShape.shape as RectShapeComponent).height);

            var rhs = new Rect();
            rhs.center = v2(playerTransform.pos.x, playerTransform.pos.y);
            rhs.size = size((playerShape.shape as RectShapeComponent).width, (playerShape.shape as RectShapeComponent).height);

            if(lhs.intersects(rhs)) { // 我们来处理
                if(npcInteractive.isCanInteractive) { // 发送时间
                    console.log("npc opend !!!!");
                    npcInteractive.isCanInteractive = false;
                    npcInteractive.interactiveState = InteractiveState.opened;
                }
            }
            else {
                npcInteractive.isCanInteractive = true;
                npcInteractive.interactiveState = InteractiveState.closed;
            }
        }
    }
}


