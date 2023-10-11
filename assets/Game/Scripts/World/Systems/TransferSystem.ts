import { Rect, size, v2 } from "cc";
import { BaseComponent } from "../Components/BaseComponent";
import { RectShapeComponent, ShapeComponent, ShapeType } from "../Components/ShapeComponent";
import { TransferComponent } from "../Components/TransferComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { GameEvent, ServerReturnEvent } from "../../Constants";
import { EventManager } from "../../../../Framework/Scripts/Managers/EventManager";
import { TimerManager } from "../../../../Framework/Scripts/Managers/TimerManager";

export class TransferSystem {
    
    public static Update(transferComponent: TransferComponent, 
        transferTransform: TransformComponent, 
        transferShape: ShapeComponent,
        entityTransform: TransformComponent,
        entityBaseComponent: BaseComponent,
        entityShapeComponent: ShapeComponent): void {
        
        
        if(transferShape.type === ShapeType.None || entityShapeComponent.type === ShapeType.None) {
            return;
        }
        

        if(transferShape.type === ShapeType.Rect && entityShapeComponent.type === ShapeType.Rect) {
            var lhs = new Rect();
            lhs.center = v2(transferTransform.pos.x, transferTransform.pos.y);
            lhs.size = size((transferShape.shape as RectShapeComponent).width, (transferShape.shape as RectShapeComponent).height);

            var rhs = new Rect();
            rhs.center = v2(entityTransform.pos.x, entityTransform.pos.y);
            rhs.size = size((entityShapeComponent.shape as RectShapeComponent).width, (entityShapeComponent.shape as RectShapeComponent).height);

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
}


