import { Component, Vec2, Vec3, math, warn } from 'cc';
import MapParams from '../3rd/map/base/MapParams';
import MapData from '../3rd/map/base/MapData';
import { EntityFactory } from './EntityFactory';
import { PlayerEntity } from './Entities/PlayerEntity';
import { NavSystem } from './Systems/NavSystem';
import { TransferSystem } from './Systems/TransferSystem';
import { TransferEntity } from './Entities/TransferEntity';
import { EntityAlphaSystem } from './Systems/EntityAlphaSystem';
import { PatrolAISystem } from './Systems/PatrolAISystem';
import { NPCEntity } from './Entities/NPCEntity';
import { InteractiveState } from './Components/NPCInteractiveComponent';
import { NPCInteractiveTestSystem } from './Systems/NPCInteractiveTestSystem';
import { NPCInteractiveProcessSystem } from './Systems/NPCInteractiveProcessSystem';
import { CollectHitSystem } from './Systems/CollectHitSystem';
import { AttackSystem } from './Systems/AttackSystem';
import { UnitState } from './Components/UnitComponent';
import { TrackAttackSystem } from './Systems/TrackAttackSystem';


export class ECSWorld extends Component {

    private spawnPoints = {};
    
    
    private playerEntities = {};
    private npcEntities = {};
    
    private monsterEntities = {};
    private transferEntities = {};

    private worldEntities = {}; // entityId ---> entity的一个映射

    public GetEntityById(entityID: number): any {
        if(this.worldEntities[entityID]) {
            return this.worldEntities[entityID];
        }

        warn("entityID: " + entityID + "can not find in worldEnities !!!")
        return null;
    }

    public GetMonestEntitiesInAttackR(centerPos: Vec3, attackR: number): Array<any> {
     
        var minDis = attackR * attackR;
        var targets = [];

        for (let key in this.monsterEntities) { // AOI
            if(this.monsterEntities[key] === null) {
                continue;
            }

            if(this.monsterEntities[key].unitComponent.state === UnitState.death || this.monsterEntities[key].unitComponent.state === UnitState.none) {
                continue;
            }

            var len = Vec3.squaredDistance(centerPos, this.monsterEntities[key].transformComponent.pos);
            if(len <= minDis) {
                targets.push(this.monsterEntities[key]);
                minDis = len;
            }
        }

        return targets;
    }

    public GetNearastMonestAttackEntity(entity:PlayerEntity, attackId): any {
        var attackR = AttackSystem.GetPlayerEntityAttackR(/*entity, */attackId);
        console.log(attackR);

        var minDis = attackR * attackR;
        var target = null;

        for (let key in this.monsterEntities) { // AOI
            if(this.monsterEntities[key] === null) {
                continue;
            }

            if(this.monsterEntities[key].unitComponent.state === UnitState.death || this.monsterEntities[key].unitComponent.state === UnitState.none) {
                continue;
            }

            var len = Vec3.squaredDistance(entity.transformComponent.pos, this.monsterEntities[key].transformComponent.pos);
            if(len <= minDis) {
                target = this.monsterEntities[key];
                minDis = len;
            }
        }

        return target;
    }

    public EntityCollectHit(pos: Vec3): number {
        for(let key in this.worldEntities) {
            var entity = this.worldEntities[key];
            if(!entity) {
                continue;
            } 

            if(CollectHitSystem.CollectHitTest(pos, entity.transformComponent, entity.shapeComponent)) {
                return entity.baseComponent.entityID;                
            }
        }
        return 0; // 表示什么都没有点击到
    }

    public GetPlayerEntityByID(entityID: number): PlayerEntity {
        if(this.playerEntities[entityID]) {
            return this.playerEntities[entityID];
        }

        warn("entityID: " + entityID + "can not find!!!")
        return null;
    }

    public RemoveAllEntitiesInWorld(): void {
        for (let key in this.playerEntities) {
            EntityFactory.DestoryEntityGameObject(this.playerEntities[key]);
        }
        
        this.playerEntities = {};
        
        for (let key in this.npcEntities) {
            EntityFactory.DestoryEntityGameObject(this.npcEntities[key]);
        }
        this.npcEntities = {};
        
        for (let key in this.monsterEntities) {
            EntityFactory.DestoryEntityGameObject(this.monsterEntities[key]);
        }
        this.monsterEntities = {};

        for (let key in this.transferEntities) {
            EntityFactory.DestoryEntityGameObject(this.transferEntities[key]);
        }
        this.transferEntities = {};

        this.spawnPoints = {};

        this.worldEntities = {};
    }

    public DestroyMonestEntityInWorld(entityID: number): void {
        if(!this.monsterEntities[entityID]) {
            return;
        }

        var entity = this.monsterEntities[entityID];

        // 从我们的表里移除出来
        // this.playerEntities[entityID] = null;
        delete this.monsterEntities[entityID];
        delete this.worldEntities[entityID];
        // end

        // 释放entity的数据
        EntityFactory.DestoryEntityGameObject(entity);
    }

    public DestroyPlayerEntityInWorld(entityID: number): void {
        if(!this.playerEntities[entityID]) {
            return;
        }

        var entity = this.playerEntities[entityID];

        // 从我们的表里移除出来
        // this.playerEntities[entityID] = null;
        delete this.playerEntities[entityID];
        delete this.worldEntities[entityID];
        // end

        // 释放entity的数据
        EntityFactory.DestoryEntityGameObject(entity);
    }

    private async InitMapElement(mapParams: MapParams, mapData: MapData) {
        var mapItems:object[] = mapData.mapItems;

        if(!mapItems) {
            return;
        }

        for(var i:number = 0 ; i < mapItems.length ; i++)
        {
            var mapItem:any = mapItems[i];
            if(mapItem.type == "spawnPoint")  {
                this.spawnPoints[mapItem.spawnId] = mapItem;
                continue;
            }

            var entity = null;

            if(mapItem.type == "npc" && Number(mapItem.objId) != 0) {
                entity = await EntityFactory.CreateNPCEntity(mapItem);
                if(entity === null) {
                    continue;
                }
                this.npcEntities[entity.baseComponent.entityID] = entity;
            }
            else if(mapItem.type == "monster" && Number(mapItem.objId) != 0) {
                entity = await EntityFactory.CreateMonestEntity(mapItem);
                if(entity === null) {
                    continue;
                }
                this.monsterEntities[entity.baseComponent.entityID] = entity;
            }
            else if(mapItem.type == "transfer") {
                entity = await EntityFactory.CreateTransferEntity(mapItem);
                this.transferEntities[entity.baseComponent.entityID] = entity;
            }
            else { // 有些一地图上的npc, 没有objectId;
                continue;
            }
            this.worldEntities[entity.baseComponent.entityID] = entity;
        }
    }

    public GetSpwanPosition(spawnId): any {
        var config = null;
        var first = null;

        if(this.spawnPoints[spawnId]) {
            config = this.spawnPoints[spawnId];
        }
        else {
            for (let key in this.spawnPoints) {
                if(this.spawnPoints[key] && first === null) {
                    first = this.spawnPoints[key];
                }
                if(this.spawnPoints[key].defaultSpawn === true) {
                    config = this.spawnPoints[key];
                    break;
                }
            }
        }

        if(config === null) {
            config = first;
        }

        if(config === null) {
            return { x: 0, y: 0 };
        }

        return { x: config.x, y: config.y };
    }

    public async Init(mapParams: MapParams, mapData: MapData) {
        // 
        EntityFactory.Init(this.node);
        // end

        // 读取我们的地图数据的内容,把一些我们的物体的Enity给他创建出来，并管理好;
        await this.InitMapElement(mapParams, mapData);
        // end
    }

    public DestroyWorld(): void {
        // 删除我们原来的节点
        this.RemoveAllEntitiesInWorld();
        // end

        // 构造工厂清理以下
        EntityFactory.Exit();
        // end

        this.node.destroy();
    }

    // {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: 1  };
    public async OnPlayerEnterWorld(config) {
        var pos = this.GetSpwanPosition(config.enterSpawnId);

        var entity = await EntityFactory.CreatePlayerEntity(config, pos.x, pos.y);
        this.playerEntities[entity.baseComponent.entityID] = entity;


        return entity;
    } 

    private SimTrasferUpdate(dt: number): void {
        for (let key in this.transferEntities) {
            var trasferEntity: TransferEntity = this.transferEntities[key];
            // 遍历传送门，AOI范围内的玩家，不用遍历这个服务器上的所有玩家
            // 我们单机游戏，玩家只有一个，所以我们遍历所有玩家列表;
            for(let playerKey in this.playerEntities) {
                var playerEntity = this.playerEntities[playerKey];
                
                if(playerEntity === null) {
                    continue;
                }

                TransferSystem.Update(trasferEntity.transferComponent,
                    trasferEntity.transformComponent, 
                    trasferEntity.shapeComponent, 
                    playerEntity.transformComponent, 
                    playerEntity.baseComponent, 
                    playerEntity.shapeComponent);
            }
        }
    }

    private NavSystemUpdate(dt: number): void {
        for (let key in this.playerEntities) {
            if(!this.playerEntities[key]) {
                continue;
            }
            
            if(this.playerEntities[key].navComponent.isWalking === false) {
                continue;
            }

            NavSystem.Update(dt, this.playerEntities[key].navComponent, 
                                      this.playerEntities[key].unitComponent, 
                                      this.playerEntities[key].transformComponent,
                                      this.playerEntities[key].baseComponent);
        }

        for (let key in this.monsterEntities) {
            if(!this.monsterEntities[key] || !this.monsterEntities[key].monestComponent.isPatrol) {
                continue;
            }

            if(this.monsterEntities[key].navComponent.isWalking === false) {
                continue;
            }

            NavSystem.Update(dt, this.monsterEntities[key].navComponent, 
                                      this.monsterEntities[key].unitComponent, 
                                      this.monsterEntities[key].transformComponent,
                                      this.monsterEntities[key].baseComponent);
        }

        for (let key in this.npcEntities) {
            if(!this.npcEntities[key] || !this.npcEntities[key].npcComponent.isPatrol) {
                continue;
            }

            if(this.npcEntities[key].navComponent.isWalking === false) {
                continue;
            }

            NavSystem.Update(dt, this.npcEntities[key].navComponent, 
                                      this.npcEntities[key].unitComponent, 
                                      this.npcEntities[key].transformComponent,
                                      this.npcEntities[key].baseComponent);
        }
    }

    private PatrolAISystemUpdate(dt: number): void {
        for (let key in this.npcEntities) {
            if(!this.npcEntities[key]) {
                continue;
            }

            if(this.npcEntities[key].npcComponent.isPatrol == false) {
                continue;
            }

            PatrolAISystem.Update(dt, this.npcEntities[key].npcComponent, 
                                    this.npcEntities[key].patrolAIComponent,
                                    this.npcEntities[key].navComponent,
                                    this.npcEntities[key].transformComponent, this.npcEntities[key].unitComponent);
        }
    }

    private EntityAttackSystemUpdate(dt: number): void {
        for (let key in this.playerEntities) {
            if(!this.playerEntities[key]) {
                continue;
            }

            if(this.playerEntities[key].attackComponent.attackId === 0) {
                continue;
            }

            AttackSystem.Update(dt, this, 
                this.playerEntities[key].transformComponent, 
                this.playerEntities[key].attackComponent, 
                this.playerEntities[key].unitComponent, 
                this.playerEntities[key].baseComponent);
        }

        // 遍历怪物的攻击
        for (let key in this.monsterEntities) {
            if(!this.monsterEntities[key]) {
                continue;
            }

            if(this.monsterEntities[key].attackComponent.attackId === 0) {
                continue;
            }

            AttackSystem.Update(dt, this, 
                this.monsterEntities[key].transformComponent,
                this.monsterEntities[key].attackComponent, 
                this.monsterEntities[key].unitComponent, 
                this.monsterEntities[key].baseComponent);
        }
    }

    private EntityAlphaSystemUpdate(): void {
        for (let key in this.playerEntities) {
            if(!this.playerEntities[key]) {
                continue;
            }

            if(this.playerEntities[key].navComponent.isWalking === false) {
                continue;
            }

            EntityAlphaSystem.Update(this.playerEntities[key].unitComponent, 
                                    this.playerEntities[key].transformComponent);
        }

        for (let key in this.monsterEntities) {
            if(!this.monsterEntities[key]) {
                continue;
            }

            EntityAlphaSystem.Update(this.monsterEntities[key].unitComponent, 
                                    this.monsterEntities[key].transformComponent);
        }

        for (let key in this.npcEntities) {
            if(!this.npcEntities[key]) {
                continue;
            }

            EntityAlphaSystem.Update(this.npcEntities[key].unitComponent, 
                                     this.npcEntities[key].transformComponent);
        }
    }

    private NPCInteractiveTestUpdate(): void {
        for (let key in this.npcEntities) {
            var npcEntity: NPCEntity = this.npcEntities[key];
            
            if(!npcEntity.npcInteractiveComponent || npcEntity.npcInteractiveComponent.interactiveState !== InteractiveState.closed) {
                continue;
            }

            // 遍历传送门，AOI范围内的玩家，不用遍历这个服务器上的所有玩家
            // 我们单机游戏，玩家只有一个，所以我们遍历所有玩家列表;
            // 从我们的GameDataMgr里面读取我们当前selfPlayer的玩家ID；
            for(let playerKey in this.playerEntities) {
                var playerEntity = this.playerEntities[playerKey];
                
                if(playerEntity === null) {
                    continue;
                }

                if(playerEntity.unitComponent.state === UnitState.death || 
                    playerEntity.unitComponent.state === UnitState.none) {
                    continue;
                }

                NPCInteractiveTestSystem.Update(npcEntity.shapeComponent, 
                                                npcEntity.npcInteractiveComponent,
                                                npcEntity.patrolAIComponent,
                                                npcEntity.navComponent,
                                                npcEntity.unitComponent,
                                                npcEntity.transformComponent, 
                                                npcEntity.baseComponent, 
                                                playerEntity.shapeComponent, 
                                                playerEntity.transformComponent, 
                                                playerEntity.baseComponent);
            }
        }
    }

    private NPCInteractiveProcessUpdate(dt: number): void {
        for (let key in this.npcEntities) {
            var npcEntity: NPCEntity = this.npcEntities[key];

            if(!npcEntity.npcInteractiveComponent || npcEntity.npcInteractiveComponent.interactiveState === InteractiveState.closed) {
                continue;
            }

            NPCInteractiveProcessSystem.Update(dt, npcEntity);
            
        }
    }

    private EntityTrackAttackUpdate(dt: number) {
        for (let key in this.playerEntities) {
            var player: PlayerEntity = this.playerEntities[key];

            if(player.unitComponent.state === UnitState.death || player.unitComponent.state === UnitState.none) {
                continue;
            }
            
            if(player.trackAttack.trackTarget === null) {
                continue;
            }

            TrackAttackSystem.Update(dt, player);
        }
    }

    protected update(dt: number): void {

        // AI System的迭代
        this.PatrolAISystemUpdate(dt);
        // end

        // 导航的迭代
        this.NavSystemUpdate(dt);
        // end

        // 透明度的迭代
        this.EntityAlphaSystemUpdate();
        // end

        // 模拟服务器上的传送门的迭代计算
        this.SimTrasferUpdate(dt);
        // end

        // 模拟服务器上 NPC 对话检测的迭代计算 
        this.NPCInteractiveTestUpdate();
        // end 

        // 客户端的NPC对话进程迭代计算
        this.NPCInteractiveProcessUpdate(dt);
        // end

        // 追踪攻击对象
        this.EntityTrackAttackUpdate(dt);
        // end

        // 攻击计算迭代
        this.EntityAttackSystemUpdate(dt);
        // end
    }
}


