import { _decorator, Component, Node } from 'cc';
import MapData from '../3rd/map/base/MapData';
import MapParams from '../3rd/map/base/MapParams';
import { MapItemType } from '../Constants';
import { EntityFactory } from './EntityFactory';
export class ECSWorld extends Component {
    private spawnPoints = {};

    private initMapElement(mapParams:MapParams,mapData:MapData): void {
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
            var entity: any = EntityFactory.CreateMapEntity(mapItem); 
            // 把entity放到我们entity的世界里面来;  
        }
    }

    public Init(mapParams:MapParams,mapData:MapData): void {
        EntityFactory.Init(this.node);

        this.initMapElement(mapParams,mapData);
        
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

    // {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: 1  };
    public OnPlayerEnterWorld(config) {
        var pos = this.GetSpwanPosition(config.enterSpawnId);
        EntityFactory.CreatePlayerEntity(config, pos.x, pos.y);
    } 

    update(deltaTime: number) {
        // AI System的迭代
        // end

        // 寻路导航的迭代
        // end
    }
}


