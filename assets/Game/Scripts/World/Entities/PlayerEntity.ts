import { BaseComponent } from "../Components/BaseComponent";
import { NavComponent } from "../Components/NavComponent";
import { RoleComponent } from "../Components/RoleComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";


export class PlayerEntity {

    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();

    unitComponent: UnitComponent = new UnitComponent(); 

    roleComponent: RoleComponent = new RoleComponent();

    navComponent: NavComponent = new NavComponent();
    // userInfoComponent: UserInfoComponnet = new UserInfoComponnet();
    // uname, uid, usex, 装备; ...
}


