import { _decorator, Component, Node, Camera, JsonAsset, Texture2D, Prefab, instantiate, v3, Vec2, Vec3, UITransform, warn } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import MapData from './3rd/map/base/MapData';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import MapParams from './3rd/map/base/MapParams';
import PathFindingAgent from './3rd/map/road/PathFindingAgent';
import PathLog from './3rd/map/road/PathLog';
import RoadNode from './3rd/map/road/RoadNode';
import { BundleName, UIGameEvent, ServerReturnEvent, GameEvent } from './Constants';
import { DeviceParams } from './DeviceParams';
import { GameCamera } from './GameCamera';
import { MapViewLoader } from './MapViewLoader';
import { UnitState } from './World/Components/UnitComponent';
import { ECSWorld } from './World/ECSWorld';
import { NavSystem } from './World/Systems/NavSystem';
const { ccclass, property } = _decorator;

export class FightManager extends Component {
    public static Instance: FightManager = null;

    private isLoading: boolean = false;
    private mapId: string = "";

    private gameCamrea: GameCamera = null!;
    private mapRoot: Node = null!;
    private mapData: any = null!;
    private mapParams: MapParams = null!;
    private selfPlayerEntity = null!;

    private ecsWorld: ECSWorld = null!;
    
    private gameEventProcess = {};

    protected onLoad(): void {
        if(FightManager.Instance !== null) {
            this.destroy();
            return;
        }

        FightManager.Instance = this;
    }

    private InitUIEventListeners(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UIChangeMap, this.OnUIChangeMap, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    private InitReturnEventListeners(): void {
        this.gameEventProcess[ServerReturnEvent.ChangeMap] = this.OnProcessChangeMapEvent;
        this.gameEventProcess[ServerReturnEvent.TouchNav] = this.OnProcessNavEvent;
        this.gameEventProcess[ServerReturnEvent.TransterEvent] = this.OnProcessTransferEvent;
    }

    private RemoveUIEventListeners(): void {
        EventManager.Instance.RemoveEventListener(UIGameEvent.UIChangeMap, this.OnUIChangeMap, this);
        EventManager.Instance.RemoveEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    protected onDestroy(): void {
        this.RemoveUIEventListeners();
        EventManager.Instance.RemoveEventListener(GameEvent.NetServerRetEvent, this.OnServerEventReturn, this);
    }

    private OnUIChangeMap(eventName: string, udata): void {
        var mapId: string = udata as string;

        // 是要发往服务器的
        if(this.isLoading) {
            return;
        }
        // end

        // 发送事件給服务器，服务器就給你切换地图，并且通知对你感兴趣的玩家，你要走了;
        // {}
        var serverData = {eventType: ServerReturnEvent.ChangeMap, 
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            mapId: mapId};
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        // end
    }

    private OnUITouchNav(eventName: string, udata: any): void {
        if(this.selfPlayerEntity === null) {
            return;
        }

        var touchPos = udata as Vec2;
        var pos: Vec3 = this.getCameraPos().add(new Vec3(touchPos.x,touchPos.y));
        pos = this.ecsWorld.node.getComponent(UITransform).convertToNodeSpaceAR(pos);
        // console.log(pos);
        // 发往服务器
        // 服务器开发的时候，发往服务器的，我们不要带玩家的id;
        // 服务端根据哪个socket ----> 是哪个玩家对应的socket, ===>id;
        // end

        // 测试(网络数据模块来调用，由于没有网络，所以我们这里来接入)
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
        // end
    }

    // {eventType: 1, pos: , playerId, ... }
    // {eventType: 传送带事件, playerId: xxxx, mapId: 1, spawnId: xxxx,}
    // 
    private OnServerEventReturn(eventName: string, event: any): void {
        var func = this.gameEventProcess[event.eventType];
        if(!func) {
            warn("eventType: " + event.eventType + " has no Handler !!!!");
            return;
        }
        func.call(this, event);
    }

    private OnProcessChangeMapEvent(event): void {
        var mapId: string = event.mapId;
        
        if(this.selfPlayerEntity !== null) { // 先判断以下是不是自己这个玩家，如果是
            if(this.selfPlayerEntity.baseComponent.entityID === event.playerId) {
                if(this.isLoading || this.mapId == mapId) {
                    return;
                }
                this.SelfTransferMap(mapId, -1);
            }
            else {
                this.DeleteOtherEntity(event.playerId);    
            }
        }
        else { // 如果是别人，直接把别人玩家的entity删除就可以了
            this.DeleteOtherEntity(event.playerId);
        }
    }
    
    private OnProcessNavEvent(event): void {
        // 调用寻路了
        var pos = event.pos;
        var playerId = event.playerId;

        var entity = this.ecsWorld.GetPlayerEntityByID(playerId);
        // console.log(entity);
        var roadNodeArr:RoadNode[] = PathFindingAgent.instance.seekPath2(entity.transformComponent.pos.x, entity.transformComponent.pos.y, pos.x, pos.y);
        // console.log(roadNodeArr);
        if(roadNodeArr.length < 2) {
            return;
        }

        NavSystem.StartAction(roadNodeArr, entity.navComponent, entity.unitComponent);
       
    }

    private DeleteOtherEntity(entityId: number): void {
        this.ecsWorld.RemovePlayerEntityInWorld(entityId);
    }

    private SelfTransferMap(mapId, spawnId): void {
        if(this.mapId == mapId) {
            return;
        }
        this.gameCamrea.BindTarget(null);
        // 删除当前场景的所有物体
        this.ecsWorld.DestroyWorld();
        this.selfPlayerEntity = null;
        // end

        console.log(mapId, spawnId);

        this.LoadAndGotoMap(mapId, spawnId);
    }

    private OnProcessTransferEvent(event): void {
        var mapId = event.mapId;
        var spawnId = event.spawnId;
        
       
        if(this.selfPlayerEntity !== null) { // 先判断以下是不是自己这个玩家，如果是
            if(this.selfPlayerEntity.baseComponent.entityID === event.playerId) {
                this.SelfTransferMap(mapId, spawnId);
            }
            else {
                this.DeleteOtherEntity(event.playerId);    
            }
        }
        else { // 如果是别人，直接把别人玩家的entity删除就可以了
            this.DeleteOtherEntity(event.playerId);
        }
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
        this.gameCamrea = this.node.getChildByName("MapCamera").addComponent(GameCamera);
        this.mapRoot = this.node.getChildByName("MapStage");
        this.isLoading = false;

        this.InitUIEventListeners();
        this.InitReturnEventListeners();   

        // 单机游戏，添加一个事件监听，模拟网络游戏
        // 如果网络游戏，由网络事件模块，来调用这个接口;
        EventManager.Instance.AddEventListener(GameEvent.NetServerRetEvent, this.OnServerEventReturn, this);
        // end
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
    
    private async InitGameMap(mapData: any, enterSpawnId: number, bgTex: Texture2D, mapLoadModel:MapLoadModel = MapLoadModel.single) {
        // 地图参数;
        this.mapData = mapData;
        this.mapParams = this.GetMapParams(mapData, bgTex, mapLoadModel);

        var width = (DeviceParams.winSize.width < this.mapParams.viewWidth) ? DeviceParams.winSize.width : this.mapParams.viewWidth;
        var height = (DeviceParams.winSize.height < this.mapParams.viewHeight) ? DeviceParams.winSize.height : this.mapParams.viewHeight;
        this.mapRoot.setPosition(v3(-width * 0.5, -height * 0.5, 0));
        // end

        // 架设好我们的摄像机, 架设到物体出生的地方
        this.gameCamrea.ResetCamera(enterSpawnId, this.mapRoot, this.mapParams, this.mapData);
        // end

        // 实例化地图节点出来
        var gameMapPrefab = ResManager.Instance.TryGetAsset(BundleName.Map, "GameMap");
        var gameMap = instantiate(gameMapPrefab) as unknown as Node;
        this.mapRoot.addChild(gameMap); // Entiry世界
        gameMap.setPosition(Vec3.ZERO);
        // end

        // 更换我们的地图的背景图片
        gameMap.addComponent(MapViewLoader).Init(this.mapParams);
        // end

        // 地图物体上的显示
        this.ecsWorld = gameMap.addComponent(ECSWorld);
        await this.ecsWorld.Init(this.mapParams, this.mapData);
        // end
    }

    public async LoadAndGotoMap(mapId: string, enterSpawnId: number, mapLoadModel:MapLoadModel = MapLoadModel.single) {
        this.isLoading = true;
        this.mapId = mapId;

        // 加载我们的游戏地图数据
        console.log("######: " + mapId, typeof(mapId));
        var jsonAsset: any = await ResManager.Instance.IE_GetAsset(BundleName.MapData, mapId, JsonAsset);
        console.log("end ###### " + mapId);
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

        // 加载我们的游戏地图的背景
        var bgTex = await ResManager.Instance.IE_GetAsset(BundleName.MapBg, mapId + "/texture", Texture2D);
        // end

        // 加载我们的游戏地图预制体
        await ResManager.Instance.IE_GetAsset(BundleName.Map, "GameMap", Prefab);
        // end

        // 地图的显示
        await this.InitGameMap(jsonAsset.json, enterSpawnId, bgTex as Texture2D, mapLoadModel);
        // end 

        // 测试代码, 把游戏主角创建出来, 网络里面传过来一个玩家，然后你判断以下，这个playerId 是不是我们的 自己的这个id;
        var config = {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: enterSpawnId, state: UnitState.idle, direction: 0 };
        this.selfPlayerEntity = await this.ecsWorld.OnPlayerEnterWorld(config);
        // end

        // 调整我们的摄像机的位置
        if(DeviceParams.winSize.width < this.mapParams.mapWidth || DeviceParams.winSize.height < this.mapParams.mapHeight) {
            this.gameCamrea.BindTarget(this.selfPlayerEntity.baseComponent.gameObject);
        }
        else {
            this.gameCamrea.BindTarget(null);
            this.gameCamrea.node.setPosition(v3(0, 0, 1000));
        }
        // end

        this.isLoading = false;
    }
}


