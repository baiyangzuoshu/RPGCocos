import { BaseComponent } from "../Components/BaseComponent";
import { NavComponent } from "../Components/NavComponent";
import { NPCComponent } from "../Components/NPCComponent";
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
}


