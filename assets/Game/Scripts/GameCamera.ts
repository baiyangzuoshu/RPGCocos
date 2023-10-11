import { Component, Node, UITransform, Vec3, v3 } from 'cc';
import MapParams from './3rd/map/base/MapParams';
import { PlayerEntity } from './World/Entities/PlayerEntity';

export class GameCamera extends Component {

    private target: PlayerEntity = null!;
    private xmin: number = 0;
    private xmax: number = 0;
    private ymin: number = 0;
    private ymax: number = 0;

    public ResetCamera(spawnId, mapRoot: Node, mapParams: MapParams, mapData: any): void {
        var mapItems:object[] = mapData.mapItems;
        var first = null;

        if(!mapItems) {
            return;
        }

        // 计算以下我们的运动的范围
        var wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(0, 0, 0))
        this.xmin = wPos.x + mapParams.viewWidth * 0.5;
        this.ymin = wPos.y + mapParams.viewHeight * 0.5;
        
        wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(mapParams.mapWidth, mapParams.mapHeight, 0))
        this.xmax = wPos.x - mapParams.viewWidth * 0.5;
        this.ymax = wPos.y - mapParams.viewHeight * 0.5;
        // end

        for(var i:number = 0 ; i < mapItems.length ; i++) {
            var mapItem:any = mapItems[i];
            if(mapItem.type == "spawnPoint" && mapItem.spawnId === spawnId)  {
                // 摆好我们的摄像机
                wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(mapItem.x, mapItem.y, 1000 ));
                this.node.setWorldPosition(wPos);
                // end
                return;
            }
        }

        for(var i:number = 0 ; i < mapItems.length ; i++) {
            var mapItem:any = mapItems[i];
            
            if(mapItem.type == "spawnPoint")  {
                if(mapItem.defaultSpawn === true) {
                    // 摆好我们的摄像机
                    wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(mapItem.x, mapItem.y, 1000 ));
                    this.node.setWorldPosition(wPos);
                    // end
                    return;
                }
                if(first === null) {
                    first = mapItem;
                }   
            }
        }
        if(first) {
            wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(first.x, first.y, 1000));
            this.node.setWorldPosition(wPos);
        }
        else {
            this.node.setPosition(v3(0, 0, 1000));    
        }
        
    }

    public BindTarget(target: PlayerEntity): void {
        this.target = target;
    }

    public lateUpdate(dt: number): void {

        if(this.target && this.target.baseComponent.gameObject !== null) {
            var pos = this.node.getWorldPosition();
            var playerPos = this.target.baseComponent.gameObject.getWorldPosition();
            pos.x = (this.xmin > playerPos.x) ? this.xmin : ((this.xmax < playerPos.x) ? this.xmax : playerPos.x);
            pos.y = (this.ymin > playerPos.y) ? this.ymin : ((this.ymax < playerPos.y) ? this.ymax : playerPos.y);
            
            this.node.setWorldPosition(pos);
        }
        
    }
}


