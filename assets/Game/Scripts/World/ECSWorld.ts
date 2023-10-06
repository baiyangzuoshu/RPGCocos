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
    }

    update(deltaTime: number) {

    }
}


