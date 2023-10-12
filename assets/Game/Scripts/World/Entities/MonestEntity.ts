import { BaseComponent } from "../Components/BaseComponent";
import { MonestComponent } from "../Components/MonestComponent";
import { NavComponent } from "../Components/NavComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";

export class MonestEntity {
    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();
    
    unitComponent: UnitComponent = new UnitComponent(); 
    monestComponent: MonestComponent = new MonestComponent();

    // --可选的模块数据
    navComponent: NavComponent = null;
}


