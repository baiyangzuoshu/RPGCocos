import { BaseComponent } from "../Components/BaseComponent";
import { NPCComponent } from "../Components/NPCComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";

export class NPCEntity {
    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();
    unitComponent: UnitComponent = new UnitComponent();
    npcComponent: NPCComponent = new NPCComponent();
}


