import { _decorator } from 'cc';
import { UnitComponent, UnitState } from './Components/UnitComponent';
import { BaseComponent } from './Components/BaseComponent';
import MovieClip from '../Utils/MovieClip';



export class EntityUtils  {

    public static SetEntityState(state: UnitState, 
                                    unitComponent: UnitComponent, 
                                    baseComponent: BaseComponent) {

        if(unitComponent.state == state) {
            return;
        }

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

    public static SetEntityDirection(value: number, unitComponent: UnitComponent, 
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
}


