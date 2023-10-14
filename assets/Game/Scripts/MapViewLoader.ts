import { Component, Node, Sprite, SpriteFrame, UITransform, error } from 'cc';
import MapParams from './3rd/map/base/MapParams';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';

export class MapViewLoader extends Component {

    private bgImg: Sprite = null!;

    public Init(mapParams: MapParams): void {

        this.bgImg = this.node.getChildByPath("Layer/MapLayer/MapBg").getComponent(Sprite);

        if(mapParams.mapLoadModel === MapLoadModel.single) {
            this.InitWithSingle(mapParams);
        }
        else {
            this.InitWithSlices(mapParams);
        }
    }

    private InitWithSingle(mapParams: MapParams):void {

        // console.log("InitWithSingle ######");
        var spriteFrame: SpriteFrame = new SpriteFrame();
		spriteFrame.texture = mapParams.bgTex;
		this.bgImg.spriteFrame = spriteFrame;

        this.bgImg.getComponent(UITransform).width = mapParams.mapWidth;
		this.bgImg.getComponent(UITransform).height = mapParams.mapHeight;

        this.node.getComponent(UITransform).width = mapParams.mapWidth;
		this.node.getComponent(UITransform).height = mapParams.mapHeight;
    }

    private InitWithSlices(mapParams: MapParams): void {
        error("目前没有实现....");
        
    }
}


