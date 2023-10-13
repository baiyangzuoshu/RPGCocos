import { Rect, Vec3, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { RectShapeComponent, ShapeComponent, ShapeType } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { NPCEntity } from "../Entities/NPCEntity";
import { PlayerEntity } from "../Entities/PlayerEntity";
import { InteractiveState, NPCInteractiveComponent } from "../Components/NPCInteractiveComponent";
import { EntityUtils } from "../EntityUtils";
import { NPCComponent } from "../Components/NPCComponent";
import { PatrolAIComponent } from "../Components/PatrolAIComponent";
import { NavSystem } from "./NavSystem";
import { NavComponent } from "../Components/NavComponent";
import { UnitComponent, UnitState } from "../Components/UnitComponent";

export class NPCInteractiveTestSystem {
    public static Update(npcShape: ShapeComponent, 
                         npcInteractive: NPCInteractiveComponent,
                         patrolAIComponent: PatrolAIComponent,
                         npcNavComponent: NavComponent,
                         npcUnitComponent: UnitComponent,
                         npcTransform: TransformComponent,
                         npcBaseComponent: BaseComponent,
                         playerShape: ShapeComponent,
                         playerTransform: TransformComponent,
                         playerBaseComponent: BaseComponent) {
        
        /*
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
                console.log("#####", lhs.size, rhs.size);
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
        */
        
        var npcRadius = 80;
        // var playerRadius = 80;

        var distance = Vec3.distance(playerTransform.pos, npcTransform.pos);
        if(distance <= (npcRadius)) {
            if(npcInteractive.isCanInteractive) { // 发送时间
                // console.log("npc opend !!!!");
                if(patrolAIComponent) { 
                    patrolAIComponent.isStopPatrol = true; 
                }

                if(npcNavComponent) {
                    NavSystem.StopAction(npcNavComponent);
                    EntityUtils.SetEntityState(UnitState.walk, npcUnitComponent, npcBaseComponent);
                }
                
                npcInteractive.isCanInteractive = false;
                npcInteractive.interactiveState = InteractiveState.opened;
            }
        }
        else {
            if(patrolAIComponent) {
                patrolAIComponent.isStopPatrol = false;
            }
            npcInteractive.isCanInteractive = true;
            npcInteractive.interactiveState = InteractiveState.closed;
        }
    }
}


