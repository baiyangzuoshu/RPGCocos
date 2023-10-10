import { _decorator, Component, Node, warn } from 'cc';
import MapData from '../3rd/map/base/MapData';
import MapParams from '../3rd/map/base/MapParams';
import { MapItemType } from '../Constants';
import { PlayerEntity } from './Entities/PlayerEntity';
import { TransferEntity } from './Entities/TransferEntity';
import { EntityFactory } from './EntityFactory';
import { NavSystem } from './Systems/NavSystem';
import { TransferSystem } from './Systems/TransferSystem';
export class ECSWorld extends Component {
    private spawnPoints = {};
    private playerEntities = {};
    private npcEntities = {};
    private monsterEntities = {};
    private transferEntities = {};


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


    }

    public RemovePlayerEntityInWorld(entityID: number): void {
        if(!this.playerEntities[entityID]) {
            return;
        }

        var entity = this.playerEntities[entityID];

        // 从我们的表里移除出来
        // this.playerEntities[entityID] = null;
        delete this.playerEntities[entityID];
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
            if(mapItem.type == MapItemType.spawnPoint)  {
                this.spawnPoints[mapItem.spawnId] = mapItem;
                continue;
            }

            var entity = null;

            if(mapItem.type == MapItemType.npc) {
                entity = EntityFactory.CreateNPCEntity(mapItem);
                this.npcEntities[entity.baseComponent.entityID] = entity;
            }
            else if(mapItem.type == MapItemType.monster) {
                entity = EntityFactory.CreateMonestEntity(mapItem);
                this.monsterEntities[entity.baseComponent.entityID] = entity;
            }
            else if(mapItem.type == MapItemType.transfer) {
                entity = await EntityFactory.CreateTransferEntity(mapItem);
                this.transferEntities[entity.baseComponent.entityID] = entity;
            }
            
        }
    }

    public GetSpwanPosition(spawnId): any {
        var config = null;

        if(this.spawnPoints[spawnId]) {
            config = this.spawnPoints[spawnId];
        }
        else {
            for (let key in this.spawnPoints) {
                if(this.spawnPoints[key].defaultSpawn === true) {
                    config = this.spawnPoints[key];
                    break;
                }
            }
        }

        // console.log(config);
        if(config === null) {
            return {x: 0, y: 0};
        }

        return { x: config.x, y: config.y };
    }

    public Init(mapParams: MapParams, mapData: MapData): void {
        // 
        EntityFactory.Init(this.node);
        // end

        // 读取我们的地图数据的内容,把一些我们的物体的Enity给他创建出来，并管理好;
        this.InitMapElement(mapParams, mapData);
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
            if(!this.monsterEntities[key]) {
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
    }

    protected update(dt: number): void {

        // AI System的迭代
        // end

        // 导航的迭代
        this.NavSystemUpdate(dt);
        // end
        // 模拟服务器上的传送门的迭代计算
        this.SimTrasferUpdate(dt);
        // end
    }
}


