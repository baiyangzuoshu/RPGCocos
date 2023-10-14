import { Rect, Vec3, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
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
        

        
        var npcRadius = 80; // 考虑使用shape的 radius,或者在交互这里把这个半径写入;
        
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


