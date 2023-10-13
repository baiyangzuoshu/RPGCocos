import { BaseComponent } from "../Components/BaseComponent";
import { NPCComponent } from "../Components/NPCComponent";
import { NPCInteractiveComponent } from "../Components/NPCInteractiveComponent";
import { NavComponent } from "../Components/NavComponent";
import { PatrolAIComponent } from "../Components/PatrolAIComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";

export class NPCEntity {
    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();
    unitComponent: UnitComponent = new UnitComponent();
    npcComponent: NPCComponent = new NPCComponent();

    // ====可选的======,不是所有的Entity都会有这两个组件
    navComponent: NavComponent = null;
    patrolAIComponent: PatrolAIComponent = null;
    npcInteractiveComponent: NPCInteractiveComponent = null; 
    // end
    
}


