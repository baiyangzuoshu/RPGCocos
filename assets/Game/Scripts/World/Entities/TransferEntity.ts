import { BaseComponent } from "../Components/BaseComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransferComponent } from "../Components/TransferComponent";
import { TransformComponent } from "../Components/TransformComponent";

// 内存排布到一起的，struct;
export class TransferEntity {

    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();

    // 传送门特有
    transferComponent: TransferComponent = new TransferComponent(); 
    // end

}