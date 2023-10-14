import { RandomUtils } from "../../../../Framework/Scripts/Utils/RandomUtils";
import PathFindingAgent from "../../3rd/map/road/PathFindingAgent";
import RoadNode from "../../3rd/map/road/RoadNode";
import { NPCComponent } from "../Components/NPCComponent";
import { NavComponent } from "../Components/NavComponent";
import { PatrolAIComponent } from "../Components/PatrolAIComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";
import { NavSystem } from "./NavSystem";

export class PatrolAISystem {

    public static Update(dt: number, npcComponent: NPCComponent, 
                  patrolAIComponent: PatrolAIComponent,
                  navComponent: NavComponent, 
                  transformComponent: TransformComponent,
                  unitComponent: UnitComponent): void {
        
        if(patrolAIComponent.isStopPatrol === true) {
            return;
        }

        patrolAIComponent.lastTime -= dt;
        if(patrolAIComponent.lastTime > 0) {
            return;
        }

        patrolAIComponent.lastTime = RandomUtils.Range(1.5 , 4);
        var x = npcComponent.startX + RandomUtils.Range(-patrolAIComponent.patrolRange, patrolAIComponent.patrolRange);
        var y = npcComponent.startY + RandomUtils.Range(-patrolAIComponent.patrolRange, patrolAIComponent.patrolRange);
        // console.log(x, y);

        // 給我们的导航组件来装好我们对应的目标点;
        var roadNodeArr: RoadNode[] = PathFindingAgent.instance.seekPath2(transformComponent.pos.x, transformComponent.pos.y, x, y, 8);
        if(roadNodeArr.length < 2) {
            console.log(roadNodeArr.length);
            return;
        }
        NavSystem.StartNavTouchAction(roadNodeArr, navComponent, unitComponent);
        // end

        
    }

}


