import PathFindingAgent from "../../3rd/map/road/PathFindingAgent";
import RoadNode from "../../3rd/map/road/RoadNode";
import { TrackAttackComponent } from "../Components/TrackAttackComponent";
import { UnitState } from "../Components/UnitComponent";
import { PlayerEntity } from "../Entities/PlayerEntity";
import { EntityUtils } from "../EntityUtils";
import { AttackSystem } from "./AttackSystem";
import { NavSystem } from "./NavSystem";

export class TrackAttackSystem {

    public static startAction(entity: PlayerEntity): void {
        NavSystem.stopAction(entity.navComponent); // 停止行走
        // 停止攻击
        AttackSystem.stopAttackAction(entity.attackComponent, entity.unitComponent, entity.baseComponent);
        EntityUtils.setEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent);
        
        entity.trackAttack.trackTime = 0;
        entity.attackComponent.attackTarget = entity.trackAttack.trackTarget;
    }

    public static stopAction(entity: PlayerEntity): void {
        entity.trackAttack.trackTarget = null;
    }

    public static Update(dt: number, entity: PlayerEntity): void {

        var targetEntity = entity.trackAttack.trackTarget;
        if(targetEntity.unitComponent.state === UnitState.death || targetEntity.unitComponent.state === UnitState.none) {
            TrackAttackSystem.stopAction(entity);
            return;
        }

        entity.trackAttack.trackTime -= dt;

        if(entity.unitComponent.state === UnitState.idle || 
            entity.unitComponent.state === UnitState.walk) {
            // 判断一下目标是不是你的攻击范围内
            var attackR = AttackSystem.getPlayerEntityAttackR(/*entity, */entity.trackAttack.attackId);
            if(AttackSystem.isInAttackR(attackR, entity.transformComponent, targetEntity.transformComponent)) {
                
                NavSystem.stopAction(entity.navComponent);
                entity.attackComponent.attackId = entity.trackAttack.attackId;
                entity.attackComponent.attackTarget = targetEntity;  
                
                AttackSystem.startAttackAction(entity.attackComponent.attackId, targetEntity, 
                    entity.unitComponent, 
                    entity.baseComponent, 
                    entity.transformComponent, 
                    entity.attackComponent);
            }
            else {
                entity.attackComponent.attackId = 0;
                entity.attackComponent.attackTarget = null;

                if(entity.trackAttack.trackTime <= 0) {
                    entity.trackAttack.trackTime = 0.8;

                    var roadNodeArr:RoadNode[] = PathFindingAgent.instance.seekPath2(entity.transformComponent.pos.x, entity.transformComponent.pos.y, targetEntity.transformComponent.pos.x, targetEntity.transformComponent.pos.y);
                    // console.log(roadNodeArr);
                    if(roadNodeArr.length < 2) {
                        entity.trackAttack.trackTarget = null;
                        return;
                    }
                    NavSystem.startNavTouchAction(roadNodeArr, entity.navComponent, entity.unitComponent);
                }
            }
        }
        
    }
}


