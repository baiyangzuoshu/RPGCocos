import { Node, Sprite, Vec3, color, v3 } from "cc";
import { BundleName, InternalEvent } from "../../Constants";
import { AttackComponent } from "../Components/AttackComponent";
import { BaseComponent } from "../Components/BaseComponent";
import { TransformComponent } from "../Components/TransformComponent";
import { UnitComponent, UnitState } from "../Components/UnitComponent";
import { PlayerEntity } from "../Entities/PlayerEntity";
import { EntityUtils } from "../EntityUtils";
import MovieClip from "../../Utils/MovieClip";
import { ECSWorld } from "../ECSWorld";
import { GameDataManager } from "../../../GameDataManager";
import { PoolManager } from "../../../../Framework/Scripts/Managers/PoolManager";
import { DamageCalcSystem } from "./DamageCalcSystem";

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
        baseComponet.gameObject.parent.addChild(effectNode);
        if(attackTarget !== null) { // 点对点
            effectNode.setPosition(attackTarget.transformComponent.pos);
        }
        else { // 范围杀伤;
            effectNode.setPosition(transform.pos);
        }
        effectNode.setSiblingIndex(2000000);

        var clip = effectNode.getComponentInChildren(MovieClip);
        clip.reset();
        clip.play();
        attackComponent.effectNode = effectNode as Node;
        // end

        // 测试代码, 区别不同特效
        var sp = effectNode.getComponentInChildren(Sprite);
        if(attackId === 90002) {
            sp.color = color(255, 255, 0, 255);
            effectNode.setScale(2.5, 2.5, 2.5);
        }
        else {
            sp.color = color(255, 255, 255, 255);
            effectNode.setScale(1, 1, 1);
        }
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

    public static Update(dt: number, world: ECSWorld, 
                         selfTransform: TransformComponent, 
                         attackComponent: AttackComponent, 
                         unit: UnitComponent, 
                         baseComponent: BaseComponent): void {

        if(attackComponent.calcTime >= 0) {
            attackComponent.calcTime -= dt;
            if(attackComponent.calcTime <= 0) { // 计算伤害
                attackComponent.calcTime = -1; // 避免重复计算伤害
                // console.log("Calc now !", attackComponent.attackTarget);
                // 计算攻击力, 玩家的等级+装备+基础攻击力---》结果;
                var attackValue = AttackSystem.GetPlayerEntityAttackValue(attackComponent.attackId);
                var attackR = AttackSystem.GetPlayerEntityAttackR(attackComponent.attackId);
                if(AttackSystem.IsAreaAttack(attackComponent.attackId)) {
                    var targets = world.GetMonestEntitiesInAttackR(selfTransform.pos, attackR);
                    for(var i = 0; i < targets.length; i ++) {
                        if(AttackSystem.IsInAttackR(attackR, selfTransform, targets[i].transformComponent)) {
                            DamageCalcSystem.DamageOneTarget(attackValue, 
                                targets[i].lifeAttrComponent, 
                                targets[i].baseComponent);
                        }
                    }
                }
                else {
                    if(attackComponent.attackTarget !== null) {
                        if(AttackSystem.IsInAttackR(attackR, selfTransform, attackComponent.attackTarget.transformComponent)) {
                            DamageCalcSystem.DamageOneTarget(attackValue, 
                                attackComponent.attackTarget.lifeAttrComponent,
                                attackComponent.attackTarget.baseComponent);
                        }                        
                    }
                }
            }
        }

        attackComponent.totalTime -= dt;
        if(attackComponent.totalTime <= 0) {
            console.log("Attack End!");
            AttackSystem.StopAttackAction(attackComponent, unit, baseComponent);
        }
    }

    public static IsInAttackR(attackR: number, selfTransform: TransformComponent, targetTransform: TransformComponent): boolean {
        var dir = Vec3.squaredDistance(selfTransform.pos, targetTransform.pos);
        if(dir <= attackR * attackR) {
            return true;
        }
        return false;
    }

    public static GetPlayerEntityAttackValue(/*entity: PlayerEntity, */attackId: number) { // 玩家等级，还有装备，
        // 从配置表里面读取我们的攻击半径
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        var value = attackConfig.baseAttacValue; // 后续有玩家装备的集成; 1.6
        return (value);
        // end
    }

    public static GetPlayerEntityAttackR(/*entity: PlayerEntity, */attackId: number) { // 玩家等级，还有装备，
        // 从配置表里面读取我们的攻击半径
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        var baseR = attackConfig.attackR; // 后续有玩家装备的集成; 1.6
        return (baseR);
        // end
    }

    public static IsAreaAttack(attackId: number): boolean {
        var attackConfig = GameDataManager.Instance.GetAttackConfigData(attackId);
        return attackConfig.IsAreaAttack;        
    }
}


