import { _decorator, Component, Node } from 'cc';
import MapData from '../3rd/map/base/MapData';
import MapParams from '../3rd/map/base/MapParams';
import { EntityFactory } from './EntityFactory';
export class ECSWorld extends Component {
    private initMapElement(mapParams:MapParams,mapData:MapData): void {
        var mapItems:object[] = mapData.mapItems;

        if(!mapItems) {
            return;
        }

        for(var i:number = 0 ; i < mapItems.length ; i++)
        {
            var mapItem:any = mapItems[i];
            var entity: any = EntityFactory.CreateEntity(mapItem);   
        }
    }

    public Init(mapParams:MapParams,mapData:MapData): void {
        EntityFactory.Init(this.node);

        this.initMapElement(mapParams,mapData);
        // 单机,或者从配置表创建一个玩家，如果是网络，我们就从网络消息时间这里创建一个玩家;
        // x,y位置是从SpwanPoint里面来的;  从地图里面写死这个位置;
        var config = {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, x: 384, y: 304.667};
        EntityFactory.CreatePlayerEntity(config);
        // end
    }

    update(deltaTime: number) {
        // AI System的迭代
        // end

        // 寻路导航的迭代
        // end
    }
}


