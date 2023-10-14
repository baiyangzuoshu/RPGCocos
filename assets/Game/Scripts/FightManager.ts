import { _decorator, Camera, Component, instantiate, JsonAsset, Node, Prefab, Texture2D, UITransform, v3, Vec2, Vec3, warn} from 'cc';
import { BundleName, UIGameEvent, ServerReturnEvent, GameEvent } from './Constants';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import MapData from './3rd/map/base/MapData';
import MapParams from './3rd/map/base/MapParams';
import { DeviceParams } from './DeviceParams';
import { MapViewLoader } from './MapViewLoader';
import { ECSWorld } from './World/ECSWorld';
import PathLog from './3rd/map/road/PathLog';
import PathFindingAgent from './3rd/map/road/PathFindingAgent';
import RoadNode from './3rd/map/road/RoadNode';
import { NavSystem } from './World/Systems/NavSystem';
import { UnitState } from './World/Components/UnitComponent';
import { PlayerEntity } from './World/Entities/PlayerEntity';
import { GameCamera } from './GameCamera';
import { EntityFactory } from './World/EntityFactory';
import { ControlMode } from './World/Components/RoleComponent';
import { EntityType } from './World/Components/BaseComponent';
import { AttackSystem } from './World/Systems/AttackSystem';
import { TrackAttackSystem } from './World/Systems/TrackAttackSystem';
import { EntityUtils } from './World/EntityUtils';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';

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
    
    private fightEventProcess = {};

    protected onLoad(): void {
        FightManager.Instance = this;
    }

    private InitUIEventListeners(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UIAttack, this.OnUIAttackEvent, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UIJoystick, this.OnUIJoystickEvent, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UIChangeMap, this.OnUIChangeMap, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UISwitchRole, this.OnUISwitchRole, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    private InitReturnEventListeners(): void {
        this.fightEventProcess[ServerReturnEvent.TrackAttack] = this.OnProcessEntityTrackAttackEvent;
        this.fightEventProcess[ServerReturnEvent.EntityDead] = this.OnProcessEntityDeadEvent;
        this.fightEventProcess[ServerReturnEvent.PlayerAttack] = this.OnProcessPlayerAttackEvent;
        this.fightEventProcess[ServerReturnEvent.JoystickEvent] = this.OnProcessJoystickEvent;
        this.fightEventProcess[ServerReturnEvent.SwitchRole] = this.OnProcessSwitchRoleEvent;
        this.fightEventProcess[ServerReturnEvent.ChangeMap] = this.OnProcessChangeMapEvent;
        this.fightEventProcess[ServerReturnEvent.TouchNav] = this.OnProcessNavEvent;
        this.fightEventProcess[ServerReturnEvent.TransterEvent] = this.OnProcessTransferEvent;
    }

    private RemoveUIEventListeners(): void {
        EventManager.Instance.RemoveEventListener(UIGameEvent.UIAttack, this.OnUIAttackEvent, this);
        EventManager.Instance.RemoveEventListener(UIGameEvent.UIJoystick, this.OnUIJoystickEvent, this);
        EventManager.Instance.RemoveEventListener(UIGameEvent.UISwitchRole, this.OnUISwitchRole, this);
        EventManager.Instance.RemoveEventListener(UIGameEvent.UIChangeMap, this.OnUIChangeMap, this);
        EventManager.Instance.RemoveEventListener(UIGameEvent.UITouchNav, this.OnUITouchNav, this);
    }

    
    protected onDestroy(): void {
        // console.log("onDestroy exit &&&&&&&&&");
        this.RemoveUIEventListeners();
    }

    private OnUIAttackEvent(eventName: string, udata): void {
        var attackId: number = udata as number;

        if(this.selfPlayerEntity === null) {
            return;
        }

        if(this.selfPlayerEntity.unitComponent.state === UnitState.attack ||
            this.selfPlayerEntity.unitComponent.state === UnitState.death || 
            this.selfPlayerEntity.unitComponent.state === UnitState.none) {
            return;
        }

        // 发数据给服务器: playerId, 发起攻击请求， 攻击的attackId;
        // end 

        // 测试模拟服务器就会给你返回一个数据 允许你发起攻击;
        // ret = { eventType: playerId: xxxx,  attackId: xxxx}
        var serverRetData = {
            eventType: ServerReturnEvent.PlayerAttack,
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            attackId: attackId,
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverRetData);
        // end
    }

    private OnUIJoystickEvent(eventName: string, udata: any): void {
        var dir: Vec2 = udata as Vec2;

        // 发往服务器，让服务器来验证，验证通过以后，返回给客户端
        // end

        // 模拟发送一个网络事件给这个客户端，让我们的游戏来处理摇杆
        // {eventType: 类型,  playerId: xxxx, dir: }
        if(this.selfPlayerEntity === null) { // 测试代码
            return;
        }

        var serverRetData = {
            eventType: ServerReturnEvent.JoystickEvent,
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            dir: dir,
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverRetData);
        // end
    }

    private OnUISwitchRole(): void {
        // 要发往服务器,服务器同意你才可以切换你的RoleId;
        // end
        
        // 模拟服务器的消息回来
        // {eventType: 类型,  roleId: 1, playerId: xxxx}
        if(this.selfPlayerEntity === null) {
            return;
        }

        var roleId: number = this.selfPlayerEntity.roleComponent.roleId;
        roleId ++;
        roleId = (roleId > 11) ? 1 : roleId;

        var serverData = {
            eventType: ServerReturnEvent.SwitchRole,
            roleId: roleId,
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        // end

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

        // 测试代码: 来做物体的拾取，计算出来当前我们点击到的是那些物体;
        var hitEntityId = this.ecsWorld.EntityCollectHit(pos);
        // end

        // 测试(网络数据模块来调用，由于没有网络，所以我们这里来接入)
        if(hitEntityId === 0) {
            TrackAttackSystem.StopAction(this.selfPlayerEntity);
            EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
        }
        else {
            // 测试，发送数据给客户端，你点击到了哪个entityId;
            // end
            var hitEntity = this.ecsWorld.GetEntityById(hitEntityId);
            if(hitEntity !== null) {
                console.log(hitEntity.baseComponent.name);
            }

            // 如果我们点击到了monest
            // 玩家追着我们的怪物来攻击;
            if(hitEntity.baseComponent.type === EntityType.Monster) {
                EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TrackAttack, playerId: this.selfPlayerEntity.baseComponent.entityID, targetId: hitEntity.baseComponent.entityID});
            }
            else { // 停止自动追击的迭代
                if(this.selfPlayerEntity) {
                    // 
                    TrackAttackSystem.StartAction(this.selfPlayerEntity);
                    // end
                }
            }
            // end

            // 临时代码
            if(hitEntity.baseComponent.type === EntityType.Transfer) {
                EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
            }
            // end
        }        
        // end
    }

    // {eventType: 1, pos: , playerId, ... }
    // {eventType: 传送带事件, playerId: xxxx, mapId: 1, spawnId: xxxx,}
    // 
    public OnServerEventReturn(eventName: string, event: any): void {
        var func = this.fightEventProcess[event.eventType];
        if(func) {
            func.call(this, event);    
        }
    }

    private OnProcessEntityTrackAttackEvent(event): void {
        var entityId = event.playerId;
        var entity: PlayerEntity = this.ecsWorld.GetPlayerEntityByID(entityId);
        if(entity === null) {
            return;
        }

        entity.trackAttack.trackTarget = this.ecsWorld.GetEntityById(event.targetId);
        if(entity.trackAttack.trackTarget === null) {
            return;
        } 

        if(entity.trackAttack.trackTarget.unitComponent.state === UnitState.death || entity.trackAttack.trackTarget.unitComponent.state === UnitState.none) {
            return;
        }

        TrackAttackSystem.StartAction(entity);
    }

    private OnProcessEntityDeadEvent(event): void {
        var entityId = event.entityId;
        var enrity = this.ecsWorld.GetEntityById(entityId);
        if(enrity === null) {
            return;
        }

        // entity就要销毁
        enrity.unitComponent.state = UnitState.death;
        if(enrity.baseComponent.type === EntityType.Player) {
            this.ecsWorld.DestroyPlayerEntityInWorld(entityId);
        }
        else if(enrity.baseComponent.type === EntityType.Monster) {
            this.ecsWorld.DestroyMonestEntityInWorld(entityId);
        }
        // end
    }

    private OnProcessPlayerAttackEvent(event): void {
        // console.log(event);
        var entity = this.ecsWorld.GetPlayerEntityByID(event.playerId);
        if(!entity) { // 找不到玩家;
            return;
        }
        
        // 停止导航
        NavSystem.StopAction(entity.navComponent);
        // end

        // 开始攻击, 如果是对点的，你就是attackTarget, 如果是范围杀伤;

        var attackTarget = null;
        if(!AttackSystem.IsAreaAttack(event.attackId)) {
            attackTarget = this.ecsWorld.GetNearastMonestAttackEntity(entity, event.attackId);
        }
        
        AttackSystem.StartAttackAction(event.attackId, attackTarget, 
                                       entity.unitComponent, 
                                       entity.baseComponent, 
                                       entity.transformComponent, 
                                       entity.attackComponent);
        // end
    }

    private OnProcessJoystickEvent(event): void {
        var entity = this.ecsWorld.GetPlayerEntityByID(event.playerId);
        if(!entity) { // 哪个玩家有摇杆操作;
            return;
        }

        entity.roleComponent.controlMode = ControlMode.joystick;

        if(event.dir.x === 0 && event.dir.y === 0) {
            NavSystem.StopAction(entity.navComponent);   
            EntityUtils.SetEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent); 
            return;
        }
        
        NavSystem.StartNavJoystickAction(event.dir, entity.navComponent, entity.unitComponent, entity.baseComponent);
    }

    // {eventType: 类型,  roleId: 1, playerId: xxxx}
    private OnProcessSwitchRoleEvent(event): void {
        var roleId = event.roleId;
        var playerId = event.playerId; 

        var player = this.ecsWorld.GetPlayerEntityByID(event.playerId);
        if(!player) {
            return;
        }

        var node = player.baseComponent.gameObject
        if(node === null) {
            return;
        }
        node.destroy();
        player.baseComponent.gameObject = null;
        player.unitComponent.movieClip = null;
        EntityFactory.SwitchRole(player, roleId);
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
        if(!entity) {
            return;
        }
        
        entity.roleComponent.controlMode = ControlMode.touch;
        // console.log(entity);
        var roadNodeArr:RoadNode[] = PathFindingAgent.instance.seekPath2(entity.transformComponent.pos.x, entity.transformComponent.pos.y, pos.x, pos.y);
        // console.log(roadNodeArr);
        if(roadNodeArr.length < 2) {
            return;
        }

        AttackSystem.StopAttackAction(entity.attackComponent, entity.unitComponent, entity.baseComponent);
        NavSystem.StartNavTouchAction(roadNodeArr, entity.navComponent, entity.unitComponent);
       
    }

    private DeleteOtherEntity(entityId: number): void {
        this.ecsWorld.DestroyPlayerEntityInWorld(entityId);
    }

    public ClearFightScene(): void {
        this.gameCamrea.BindTarget(null);
        // 删除当前场景的所有物体
        this.ecsWorld.DestroyWorld();
        this.selfPlayerEntity = null;
    }

    private SelfTransferMap(mapId, spawnId): void {
        if(this.mapId == mapId) {
            return;
        }
        // 删除当前场景的所有物体
        this.ClearFightScene();
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
            this.gameCamrea.BindTarget(this.selfPlayerEntity);
        }
        else {
            this.gameCamrea.BindTarget(null);
            this.gameCamrea.node.setPosition(v3(0, 0, 1000));
        }
        // end

        this.isLoading = false;
    }
}


