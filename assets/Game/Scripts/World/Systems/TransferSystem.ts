import { Rect, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { ShapeComponent } from "../Components/ShapeComponent";
import { TransferComponent } from "../Components/TransferComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { GameEvent, ServerReturnEvent } from "../../Constants";
import { TimerManager } from "../../../../Framework/Scripts/Managers/TimerManager";
import { EventManager } from "../../../../Framework/Scripts/Managers/EventManager";

export class TransferSystem {
    
    public static Update(transferComponent: TransferComponent, 
        transferTransform: TransformComponent, 
        transferShape: ShapeComponent,
        entityTransform: TransformComponent,
        entityBaseComponent: BaseComponent,
        entityShapeComponent: ShapeComponent): void {
        
        var lhs = new Rect(transferTransform.pos.x - transferShape.width * 0.5, transferTransform.pos.y, transferShape.width, transferShape.height);
        var rhs = new Rect(entityTransform.pos.x - entityShapeComponent.width * 0.5, entityTransform.pos.y, entityShapeComponent.width, entityShapeComponent.height);

        if(lhs.intersects(rhs)) { // entity来到了传送门, 如果是网络游戏，这个代码放服务器，就要发网络消息給客户端
            TimerManager.Instance.ScheduleOnce(()=>{
                // 模拟发送一个事件給客户端(FightMgr);
                var enrityId = entityBaseComponent.entityID;
                var mapId = transferComponent.targetMapId;
                var spawnId = transferComponent.targetMapSpawnId;
                EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TransterEvent, playerId: enrityId, mapId: mapId, spawnId: spawnId});
                // end
            }, this, 0.00001);
        }
    }
}


