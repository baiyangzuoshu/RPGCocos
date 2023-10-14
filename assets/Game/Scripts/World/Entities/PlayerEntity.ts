import { AttackComponent } from "../Components/AttackComponent";
import { BaseComponent } from "../Components/BaseComponent";
import { LifeAttrComponent } from "../Components/LifeAttrComponent";
import { NavComponent } from "../Components/NavComponent";
import { RoleComponent } from "../Components/RoleComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TrackAttackComponent } from "../Components/TrackAttackComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent } from "../Components/UnitComponent";


export class PlayerEntity {
    baseComponent: BaseComponent = new BaseComponent();
    shapeComponent: ShapeComponent = new ShapeComponent();
    transformComponent: TransformComponent = new TransformComponent();
    unitComponent: UnitComponent = new UnitComponent(); 
    roleComponent: RoleComponent = new RoleComponent();
    navComponent: NavComponent = new NavComponent();
    lifeAttrComponent: LifeAttrComponent = new LifeAttrComponent();
    attackComponent: AttackComponent = new AttackComponent();
    trackAttack: TrackAttackComponent = new TrackAttackComponent();
    
    // userInfoComponent: UserInfoComponnet = new UserInfoComponnet();
    // uname, uid, usex, 装备; ...
}


