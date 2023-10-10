import { Component, Node, UITransform, Vec3, v3 } from 'cc';
import MapParams from './3rd/map/base/MapParams';

export class GameCamera extends Component {

    private target: Node = null!;


    public ResetCamera(spawnId, mapRoot: Node, mapParams: MapParams, mapData: any): void {
        var mapItems:object[] = mapData.mapItems;

        if(!mapItems) {
            return;
        }


        for(var i:number = 0 ; i < mapItems.length ; i++) {
            var mapItem:any = mapItems[i];
            if(mapItem.type == "spawnPoint" && mapItem.spawnId === spawnId)  {
                // 摆好我们的摄像机
                var wPos = mapRoot.getComponent(UITransform).convertToWorldSpaceAR(v3(mapItem.x, mapItem.y, 1000 ));
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
            }
        }
        this.node.setPosition(v3(0, 0, 1000));    
        
    }

    public BindTarget(target: Node): void {
        this.target = target;
    }

    public lateUpdate(dt: number): void {
        if(this.target) {
            var pos = this.node.getWorldPosition();
            var playerPos = this.target.getWorldPosition();
            pos.x = playerPos.x;
            pos.y = playerPos.y;
            this.node.setWorldPosition(pos);
        }
        
    }
}


