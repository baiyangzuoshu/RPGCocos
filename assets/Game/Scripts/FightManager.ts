import { _decorator, Component, Node, Camera, JsonAsset, Texture2D, Prefab, instantiate, v3, Vec2, Vec3 } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import MapData from './3rd/map/base/MapData';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import MapParams from './3rd/map/base/MapParams';
import PathFindingAgent from './3rd/map/road/PathFindingAgent';
import PathLog from './3rd/map/road/PathLog';
import { BundleName, UIGameEvent, UserOptEvent } from './Constants';
import { DeviceParams } from './DeviceParams';
import { MapViewLoader } from './MapViewLoader';
import { ECSWorld } from './World/ECSWorld';
const { ccclass, property } = _decorator;

export class FightManager extends Component {
    public static Instance: FightManager = null;
    private gameCamrea: Camera = null!;
    private mapRoot: Node = null!;
    private mapData: any = null!;
    private mapParams: MapParams = null!;
    private selfPlayerEntity = null!;

    private ecsWorld: ECSWorld = null!;

    protected onLoad(): void {
        if(FightManager.Instance !== null) {
            this.destroy();
            return;
        }

        FightManager.Instance = this;
    }

    private InitEventListeners(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    private RemoveEventListeners(): void {
        EventManager.Instance.RemoveEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    protected onDestroy(): void {
        this.RemoveEventListeners();
    }

    private OnUITouchNav(eventName: string, udata: any): void {
        if(this.selfPlayerEntity === null) {
            return;
        }

        var touchPos = udata as Vec2;
        var pos:Vec3 = this.getCameraPos().add(new Vec3(touchPos.x,touchPos.y));
        console.log(pos);
        // 发往服务器
        // 服务器开发的时候，发往服务器的，我们不要带玩家的id;
        // 服务端根据哪个socket ----> 是哪个玩家对应的socket, ===>id;
        // end

        // 测试(网络数据模块来调用，由于没有网络，所以我们这里来接入)
        this.OnNetEventReturn({eventType: UserOptEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
        // end
    }

    // {eventType: 1, pos: , playerId, ... }
    private OnNetEventReturn(event): void {
        // 正式行走与导航了
        if(event.eventType === UserOptEvent.TouchNav) { // 最好是和协议整合到一起，用数字来表示;1, 2, 3, ..
            this.OnProcessNavEvent(event);
        }
    }
    
    private OnProcessNavEvent(event): void {
        // 调用寻路了
        var pos = event.pos;
        var playerId = event.playerId;

        var entity = this.ecsWorld.GetPlayerEntityByID(playerId);
        console.log(entity);
        // var roadNodeArr:RoadNode[] = PathFindingAgent.instance.seekPath2(targetX,targetY,this.navAgent.radius);

        
    }

    public getCameraPos():Vec3
    {
        if(this.gameCamrea == null) {
            return new Vec3(0,0,0);
        }

        //对摄像机位置向上取整后返回
        return new Vec3(Math.ceil(this.gameCamrea.node.position.x), Math.ceil(this.gameCamrea.node.position.y),0);
    }

    public async Init() {
        this.gameCamrea = this.node.getComponentInChildren(Camera);
        this.mapRoot = this.node.getChildByName("MapStage");
        this.InitEventListeners();
        
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
        // 加载我们的游戏地图数据
        var jsonAsset: any = await ResManager.Instance.IE_GetAsset(BundleName.MapData, mapId, JsonAsset);
        // console.log(jsonAsset);
        // end

        PathLog.setLogEnable(false); //关闭寻路日志打印信息
        //PathLog.setLogEnable(true); //打开寻路日志打印信息     备注： 想看寻路日志信息，执行这行

        PathFindingAgent.instance.init(jsonAsset.json); //初始化寻路系统
        //PathFindingAgent.instance.setMaxSeekStep(1000); //设置最大寻路步骤
        //PathFindingAgent.instance.setPathOptimize(PathOptimize.best); //设置路径优化类型
        //PathFindingAgent.instance.setPathQuadSeek(PathQuadSeek.path_dire_4); //4方向路点地图，这个方法是用来设置寻路是使用4方向寻路，还是8方向寻路,默认是8方向寻路。对六边形路点地图无效


        //---------------------------------这是自定义寻路时检测路点是否能通过的条件----------------------------------------------
        //寻路系统默认路点值为1是障碍点。如果不想要默认寻路条件，可以自定义寻路条件，在以下回调函数中写自己的路点可通过条件
        /*PathFindingAgent.instance.setRoadNodePassCondition((roadNode:RoadNode):boolean=>
        {
            if(roadNode == null) //等于null, 证明路点在地图外，不允许通过
            {
                return false;
            }

            if(roadNode.value == 1) //路点值等于1，不允许通过
            {
                return false;
            }

            return true;
        });*/
        //-----------------------------------------------------------------------------------------------------------------------
        //加载地图
        
        //console.log(jsonData);
        let texture=await ResManager.Instance.IE_GetAsset(BundleName.MapBg,mapId+"/texture",Texture2D) as Texture2D;
        //console.log(texture);
        let prefab=await ResManager.Instance.IE_GetAsset(BundleName.Map,"GameMap",Prefab);
        //console.log(prefab);
        await this.initGameMap(jsonAsset.json,texture,mapLoadModel);
        // 测试代码, 把游戏主角创建出来, 网络里面传过来一个玩家，然后你判断以下，这个playerId 是不是我们的 自己的这个id;
        var config = {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: enterSpawnId };
        this.selfPlayerEntity = await this.ecsWorld.OnPlayerEnterWorld(config);
    }
}


