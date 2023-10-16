import { Vec3 } from "cc";
import { LifeAttrComponent } from "../Components/LifeAttrComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { BaseComponent } from "../Components/BaseComponent";
import { GameEvent, ServerReturnEvent } from "../../Constants";
import { EventManager } from "../../../../Framework/Scripts/Managers/EventManager";

export class DamageCalcSystem {
    public static damageOneTarget(attackValue, 
                                  targetLifeAttr: LifeAttrComponent, 
                                  baseComponent: BaseComponent): void {
        
        
        // 发送消息给客户端，掉血;
        var value = attackValue - (targetLifeAttr.defense);
        if(value <= 0) {
            return;
        }

        targetLifeAttr.hp -= value;
        // end

        // 模拟发送事件给客户端，方便客户端掉血
        let serverData = {eventType: ServerReturnEvent.CalcDamage, 
            entityId: baseComponent.entityID, 
            damageValue: value 
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        console.log("Entity ID: " + baseComponent.entityID + " has damge " + value);
        // end

        if(targetLifeAttr.hp <= 0) { // 角色死亡
            let serverData = {
                eventType: ServerReturnEvent.EntityDead, 
                entityId: baseComponent.entityID, 
            };
            console.log("Entity Dead : " + baseComponent.entityID);

            EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        }
    }
}


