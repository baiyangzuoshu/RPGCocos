import { Vec3, _decorator } from 'cc';
import { UnitComponent, UnitState } from './Components/UnitComponent';
import { BaseComponent, EntityType } from './Components/BaseComponent';
import MovieClip from '../Utils/MovieClip';



export class EntityUtils  {

    private static SetPlayerEntityState(state: UnitState, 
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

        // 方向是正确的
        this.SetEntityDirection(unitComponent.direction, unitComponent, baseComponent);
        // end

        unitComponent.movieClip.node.active = true;
        unitComponent.movieClip.playIndex = 0;
        unitComponent.movieClip.playAction();
    }

    private static SetNPCEntityState(state: UnitState, 
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

        // 方向是正确的
        this.SetEntityDirection(unitComponent.direction, unitComponent, baseComponent);
        // end

        unitComponent.movieClip.node.active = true;
        unitComponent.movieClip.playIndex = 0;
        unitComponent.movieClip.playAction();
    }

    public static SetEntityState(state: UnitState, 
                                    unitComponent: UnitComponent, 
                                    baseComponent: BaseComponent) {

        if(unitComponent.state == state) {
            return;
        }

        switch(baseComponent.type) {
            case EntityType.Player:
                EntityUtils.SetPlayerEntityState(state, unitComponent, baseComponent);
            break;
            case EntityType.NPC:
                EntityUtils.SetNPCEntityState(state, unitComponent, baseComponent);
            break;
        }
        
    }

    // ctrl + [
    public static SetEntityDirection(value: number, 
                                     unitComponent: UnitComponent, 
                                     baseComponent: BaseComponent) {
        switch(baseComponent.type) {
            case EntityType.Player:
                EntityUtils.SetPlayerEntityDirection(value, unitComponent, baseComponent);
            break;
            case EntityType.NPC:
                EntityUtils.SetNPCEntityDirection(value, unitComponent, baseComponent);
            break;
        }
    }

    private static SetPlayerEntityDirection(value: number, 
                                           unitComponent: UnitComponent, 
                                           baseComponent: BaseComponent) {
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

    private static SetNPCEntityDirection(value: number, 
                                        unitComponent: UnitComponent, 
                                        baseComponent: BaseComponent) {
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
}


