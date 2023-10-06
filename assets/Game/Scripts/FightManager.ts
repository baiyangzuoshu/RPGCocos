import { _decorator, Component, Node, Camera, JsonAsset, Texture2D, Prefab, instantiate, v3 } from 'cc';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import MapData from './3rd/map/base/MapData';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import MapParams from './3rd/map/base/MapParams';
import { BundleName } from './Constants';
import { DeviceParams } from './DeviceParams';
import { MapViewLoader } from './MapViewLoader';
import { ECSWorld } from './World/ECSWorld';
const { ccclass, property } = _decorator;

export class FightManager extends Component {
    public static Instance: FightManager = null;
    private gameCamera: Camera = null!;
    private mapRoot: Node = null!;
    private mapData: MapData = null!;
    private mapParams: MapParams = null!;
    private ecsWorld: ECSWorld = null!;

    protected onLoad(): void {
        if(FightManager.Instance !== null) {
            this.destroy();
            return;
        }

        FightManager.Instance = this;
    }

    public  Init():void {
       this.gameCamera=this.node.getComponentInChildren(Camera); 
       this.mapRoot=this.node.getChildByName("MapStage")!;
    }

    public GetMapParams(mapData:MapData,bgTex:Texture2D,mapLoadModel:MapLoadModel = 1):MapParams
    {
        //初始化底图参数
        var mapParams:MapParams = new MapParams();
        mapParams.name = mapData.name;
        mapParams.bgName = mapData.bgName;
        mapParams.mapType = mapData.type;
        mapParams.mapWidth = mapData.mapWidth;
        mapParams.mapHeight = mapData.mapHeight;
        mapParams.ceilWidth = mapData.nodeWidth;
        mapParams.ceilHeight = mapData.nodeHeight;
        mapParams.viewWidth = mapData.mapWidth > DeviceParams.winSize.width ? DeviceParams.winSize.width : mapData.mapWidth;
        mapParams.viewHeight = mapData.mapHeight > DeviceParams.winSize.height ? DeviceParams.winSize.height : mapData.mapHeight;
        mapParams.sliceWidth = 256;
        mapParams.sliceHeight = 256;
        mapParams.bgTex = bgTex;
        mapParams.mapLoadModel = mapLoadModel;

        return mapParams;
    }

    private async initGameMap(mapData:any,bgTexture:Texture2D, mapLoadModel:MapLoadModel = MapLoadModel.single){
        // 地图物体显示出来;
        this.mapData = mapData;
        this.mapParams = this.GetMapParams(mapData, bgTexture, mapLoadModel);
        // end
        // 实例化地图节点出来
        var gameMapPrefab = ResManager.Instance.TryGetAsset(BundleName.Map, "GameMap");
        var gameMap = instantiate(gameMapPrefab) as unknown as Node;
        this.mapRoot.addChild(gameMap); // Entiry世界坐标系
        
        var width = (DeviceParams.winSize.width < this.mapParams.viewWidth) ? DeviceParams.winSize.width : this.mapParams.viewWidth;
        var height = (DeviceParams.winSize.width < this.mapParams.viewHeight) ? DeviceParams.winSize.height : this.mapParams.viewHeight;
        gameMap.setPosition(v3(-width * 0.5, -height * 0.5, 0));
        // end
        // 更换我们的地图的背景图片
        gameMap.addComponent(MapViewLoader).Init(this.mapParams);
        // end

        // 地图物体上的显示
        this.ecsWorld = gameMap.addComponent(ECSWorld);
        this.ecsWorld.Init(this.mapParams, this.mapData);
        // end
    }

    public async loadAndGotoMap(mapId:string,enterSpawnId:number,mapLoadModel:MapLoadModel=MapLoadModel.single){
        //加载地图
        let jsonData=await ResManager.Instance.IE_GetAsset(BundleName.MapData,mapId,JsonAsset) as JsonAsset;
        //console.log(jsonData);
        let texture=await ResManager.Instance.IE_GetAsset(BundleName.MapBg,mapId+"/texture",Texture2D) as Texture2D;
        //console.log(texture);
        let prefab=await ResManager.Instance.IE_GetAsset(BundleName.Map,"GameMap",Prefab);
        //console.log(prefab);
        await this.initGameMap(jsonData.json,texture,mapLoadModel);
        // 把游戏主角创建出来
        var config = {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: enterSpawnId };
        this.ecsWorld.OnPlayerEnterWorld(config);
    }
}


