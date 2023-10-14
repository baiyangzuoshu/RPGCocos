import { Node, Vec3 } from "cc";
import { BundleName } from "../../Constants";
import { BaseComponent } from "../Components/BaseComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent, UnitState } from "../Components/UnitComponent";
import { PlayerEntity } from "../Entities/PlayerEntity";
import { EntityUtils } from "../EntityUtils";
import MovieClip from "../../Utils/MovieClip";
import { AttackComponent } from "../Components/AttackComponent";
import { GameDataManager } from "../../../GameDataManager";
import { PoolManager } from "../../../../Framework/Scripts/Managers/PoolManager";

export class AttackSystem {

    public static StartAttackAction(attackId: number, attackTarget: any, 
                                    unit: UnitComponent, 
                                    baseComponet: BaseComponent,
                                    transform: TransformComponent,
                                    attackComponent: AttackComponent): void {
        
        attackComponent.attackId = attackId; 
        attackComponent.attackTarget = attackTarget; //

        if(attackComponent.attackTarget !== null) { // 玩家朝向我们的角色
            EntityUtils.LookAtTarget(unit, baseComponet, transform, attackTarget.transformComponent);
        }

        // 设置成我们的idle状态，播放动画
        EntityUtils.SetEntityState(UnitState.attack, unit, baseComponet);
        // end

        // 生成一个攻击特效;
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        var effectNode = PoolManager.Instance.GetNodeInPoolByPath(BundleName.Charactors, attackConfig.attackEffectName);
        baseComponet.gameObject.addChild(effectNode);
        effectNode.setPosition(Vec3.ZERO);
        var clip = effectNode.getComponentInChildren(MovieClip);
        clip.reset();
        clip.play();
        attackComponent.effectNode = effectNode as Node;
        // end

        // 攻击计算与计算伤害的时间，可以从动画里面读取，可以从配置里读取;
        attackComponent.totalTime = clip.totalFrame * clip.interval;
        attackComponent.calcTime = attackComponent.totalTime * 0.5; 
        // console.log(attackComponent.totalTime, attackComponent.calcTime);
        // end

        console.log("Attack Started!");
    }

    public static StopAttackAction(attackComponent: AttackComponent, unit: UnitComponent, baseComponent: BaseComponent): void {
        // 处理我们的动画与特效
        attackComponent.effectNode.removeFromParent();
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackComponent.attackId);
        PoolManager.Instance.PutNodeByPath(BundleName.Charactors, attackConfig.attackEffectName, attackComponent.effectNode);
        // end

        attackComponent.attackId = 0; 
        attackComponent.calcTime = attackComponent.totalTime = 0;
         // 设置成我们的idle状态，播放动画
         EntityUtils.SetEntityState(UnitState.idle, unit, baseComponent);
         // end
    }

    public static Update(dt: number, attackComponent: AttackComponent, unit: UnitComponent, baseComponent: BaseComponent): void {
        if(attackComponent.calcTime >= 0) {
            attackComponent.calcTime -= dt;
            if(attackComponent.calcTime <= 0) { // 计算伤害
                attackComponent.calcTime = -1; // 避免重复计算伤害
                // console.log("Calc now !", attackComponent.attackTarget);
            }
        }

        attackComponent.totalTime -= dt;
        if(attackComponent.totalTime <= 0) {
            console.log("Attack End!");
            AttackSystem.StopAttackAction(attackComponent, unit, baseComponent);
        }
    }

    public static GetPlayerEntityAttackR(entity: PlayerEntity, attackId: number) { // 玩家等级，还有装备，
        // 从配置表里面读取我们的攻击半径
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        var baseR = attackConfig.attackR; // 后续有玩家装备的集成; 1.6
        return (baseR);
        // end
    }

    public static IsAreaAttack(attackId: number): boolean {
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        return attackConfig.IsAreaAttack        
    }
}


