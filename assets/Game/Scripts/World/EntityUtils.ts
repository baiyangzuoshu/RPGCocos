import { Vec3, _decorator, v3 } from 'cc';
import { UnitComponent, UnitState } from './Components/UnitComponent';
import { BaseComponent, EntityType } from './Components/BaseComponent';
import MovieClip from '../Utils/MovieClip';
import { TransformComponent } from './Components/TransformComponent';


export class EntityUtils  {
    private static setPlayerEntityState(state: UnitState, 
                                        unitComponent: UnitComponent, 
                                        baseComponent: BaseComponent) {
        
        unitComponent.state = state;
        if(unitComponent.movieClip) {
            unitComponent.movieClip.node.active = false;
        }

        switch(unitComponent.state)
        {
            case UnitState.idle: 
            unitComponent.movieClip = baseComponent.gameObject.getChildByName("Body").getChildByName("Skin_Idle").getComponent(MovieClip);
            break;

            case UnitState.walk: 
            unitComponent.movieClip = baseComponent.gameObject.getChildByName("Body").getChildByName("Skin_Walk").getComponent(MovieClip);
            break;

            case UnitState.attack: 
            unitComponent.movieClip = baseComponent.gameObject.getChildByName("Body").getChildByName("Skin_Idle").getComponent(MovieClip);
            break;

        }

        this.setEntityDirection(unitComponent.direction, unitComponent, baseComponent);

        unitComponent.movieClip.node.active = true;
        unitComponent.movieClip.playIndex = 0;
        unitComponent.movieClip.playAction();
    }

    private static setNPCEntityState(state: UnitState, 
                                     unitComponent: UnitComponent, 
                                     baseComponent: BaseComponent) {

        unitComponent.state = state;
        var halfCol:number = unitComponent.movieClip.col / 2;
        
        switch(unitComponent.state)
        {
            case UnitState.idle: 
                unitComponent.movieClip.begin = 0;
                unitComponent.movieClip.end = halfCol;
            break;

            case UnitState.walk: 
                unitComponent.movieClip.begin = halfCol;
                unitComponent.movieClip.end = unitComponent.movieClip.col;
            break;
        }

        this.setEntityDirection(unitComponent.direction, unitComponent, baseComponent);

        unitComponent.movieClip.node.active = true;
        unitComponent.movieClip.playIndex = 0;
        unitComponent.movieClip.playAction();
    }

    public static setEntityState(state: UnitState, 
                                    unitComponent: UnitComponent, 
                                    baseComponent: BaseComponent) {

        if(unitComponent.state == state) {
            return;
        }

        switch(baseComponent.type) {
            case EntityType.Player:
                EntityUtils.setPlayerEntityState(state, unitComponent, baseComponent);
            break;
            case EntityType.NPC:
            case EntityType.Monster:
                EntityUtils.setNPCEntityState(state, unitComponent, baseComponent);
            break;

        }
        
    }

    public static setEntityDirection(value: number, 
                                     unitComponent: UnitComponent, 
                                     baseComponent: BaseComponent) {
        switch(baseComponent.type) {
            case EntityType.Player:
                EntityUtils.setPlayerEntityDirection(value, unitComponent/*, baseComponent*/);
            break;
            case EntityType.NPC:
            case EntityType.Monster:
                EntityUtils.setNPCEntityDirection(value, unitComponent/*, baseComponent*/);
            break;
        }
    }

    private static setPlayerEntityDirection(value: number, 
                                           unitComponent: UnitComponent, 
                                           /*baseComponent: BaseComponent*/) {
        unitComponent.direction = value;

        switch(unitComponent.direction)
        {
            case 0 : 
                unitComponent.movieClip.rowIndex = 0;
            break;

            case 1 : 
                unitComponent.movieClip.rowIndex = 4;
            break;

            case 2 : 
                unitComponent.movieClip.rowIndex = 1;
            break;

            case 3 : 
                unitComponent.movieClip.rowIndex = 6;
            break;

            case 4 : 
                unitComponent.movieClip.rowIndex = 3;
            break;

            case 5 : 
                unitComponent.movieClip.rowIndex = 7;
            break;

            case 6 : 
                unitComponent.movieClip.rowIndex = 2;
            break;

            case 7 : 
                unitComponent.movieClip.rowIndex = 5;
            break;
        }
    }

    private static setNPCEntityDirection(value: number, 
                                        unitComponent: UnitComponent, 
                                        /*baseComponent: BaseComponent*/) {
        unitComponent.direction = value;

        if(value > 4) {
            unitComponent.movieClip.rowIndex = 4 - value % 4;
            var scale:Vec3 = unitComponent.movieClip.node.scale;
            scale.x = -1;
            unitComponent.movieClip.node.scale = scale;
        }
        else {
            unitComponent.movieClip.rowIndex = value;
            var scale:Vec3 = unitComponent.movieClip.node.scale;
            scale.x = 1;
            unitComponent.movieClip.node.scale = scale;
        }
    }

    public static lookAtTarget(unit: UnitComponent,
                               baseComponent: BaseComponent,
                               selfTransform: TransformComponent, 
                               targetTransform: TransformComponent): void {
        
        var dir = v3();
        Vec3.subtract(dir, targetTransform.pos, selfTransform.pos);
        
        // 计算出来我们的角色方向
        var moveAngle:number = Math.atan2(dir.y, dir.x); // 【-180， 180】
        var dire:number = Math.round((-moveAngle + Math.PI) / (Math.PI / 4));
        var direction = dire > 5 ? dire-6 : dire+2;
        // var flag = (direction === unitComponent.direction)? true : false
        EntityUtils.setEntityDirection(direction, unit, baseComponent);
    }
}


