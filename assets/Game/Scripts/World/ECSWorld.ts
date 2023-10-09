import { _decorator, Component, Node, warn } from 'cc';
import MapData from '../3rd/map/base/MapData';
import MapParams from '../3rd/map/base/MapParams';
import { MapItemType } from '../Constants';
import { PlayerEntity } from './Entities/PlayerEntity';
import { EntityFactory } from './EntityFactory';
import { NavSystem } from './Systems/NavSystem';
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

    // {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: 1  };
    public async OnPlayerEnterWorld(config) {
        var pos = this.GetSpwanPosition(config.enterSpawnId);
        var entity = await EntityFactory.CreatePlayerEntity(config, pos.x, pos.y);
        this.playerEntities[entity.baseComponent.entityID] = entity;


        return entity;
    } 

    private NavSystemUpdate(dt: number): void {
        for (let key in this.playerEntities) {
            if(!this.playerEntities[key]) {
                continue;
            }

            if(this.playerEntities[key].navComponent.isWalking === false) {
                continue;
            }

            NavSystem.Instance.Update(dt, this.playerEntities[key].navComponent, 
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

            NavSystem.Instance.Update(dt, this.monsterEntities[key].navComponent, 
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

    }
}


