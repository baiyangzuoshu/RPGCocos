import { _decorator, Camera, Component, instantiate, JsonAsset, Node, Prefab, Texture2D, UITransform, v3, Vec2, Vec3, warn} from 'cc';
import { BundleName, UIGameEvent, ServerReturnEvent, GameEvent } from './Constants';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import MapData from './3rd/map/base/MapData';
import MapParams from './3rd/map/base/MapParams';
import { DeviceParams } from './DeviceParams';
import { MapViewLoader } from './MapViewLoader';
import { ECSManager } from './World/ECSManager';
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

    private ecsWorld: ECSManager = null!;
    
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

        var serverRetData = {
            eventType: ServerReturnEvent.PlayerAttack,
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            attackId: attackId,
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverRetData);
    }

    private OnUIJoystickEvent(eventName: string, udata: any): void {
        var dir: Vec2 = udata as Vec2;

        if(this.selfPlayerEntity === null) { // 测试代码
            return;
        }

        var serverRetData = {
            eventType: ServerReturnEvent.JoystickEvent,
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            dir: dir,
        };
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverRetData);
    }

    private OnUISwitchRole(): void {
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
    }

    private OnUIChangeMap(eventName: string, udata): void {
        var mapId: string = udata as string;

        if(this.isLoading) {
            return;
        }
        var serverData = {eventType: ServerReturnEvent.ChangeMap, 
            playerId: this.selfPlayerEntity.baseComponent.entityID, 
            mapId: mapId};
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
    }

    private OnUITouchNav(eventName: string, udata: any): void {
        if(this.selfPlayerEntity === null) {
            return;
        }

        var touchPos = udata as Vec2;
        var pos: Vec3 = this.getCameraPos().add(new Vec3(touchPos.x,touchPos.y));
        pos = this.ecsWorld.node.getComponent(UITransform).convertToNodeSpaceAR(pos);
        // 测试代码: 来做物体的拾取，计算出来当前我们点击到的是那些物体;
        var hitEntityId = this.ecsWorld.entityCollectHit(pos);

        // 测试(网络数据模块来调用，由于没有网络，所以我们这里来接入)
        if(hitEntityId === 0) {
            TrackAttackSystem.stopAction(this.selfPlayerEntity);
            EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
        }
        else {
            var hitEntity = this.ecsWorld.getEntityById(hitEntityId);
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
                    TrackAttackSystem.startAction(this.selfPlayerEntity);
                }
            }

            if(hitEntity.baseComponent.type === EntityType.Transfer) {
                EventManager.Instance.Emit(GameEvent.NetServerRetEvent, {eventType: ServerReturnEvent.TouchNav, pos: pos, playerId: this.selfPlayerEntity.baseComponent.entityID});
            }
        }        
    }

    public OnServerEventReturn(eventName: string, event: any): void {
        var func = this.fightEventProcess[event.eventType];
        if(func) {
            func.call(this, event);    
        }
    }

    private OnProcessEntityTrackAttackEvent(event): void {
        var entityId = event.playerId;
        var entity: PlayerEntity = this.ecsWorld.getPlayerEntityByID(entityId);
        if(entity === null) {
            return;
        }

        entity.trackAttack.trackTarget = this.ecsWorld.getEntityById(event.targetId);
        if(entity.trackAttack.trackTarget === null) {
            return;
        } 

        if(entity.trackAttack.trackTarget.unitComponent.state === UnitState.death || entity.trackAttack.trackTarget.unitComponent.state === UnitState.none) {
            return;
        }

        TrackAttackSystem.startAction(entity);
    }

    private OnProcessEntityDeadEvent(event): void {
        var entityId = event.entityId;
        var enrity = this.ecsWorld.getEntityById(entityId);
        if(enrity === null) {
            return;
        }

        enrity.unitComponent.state = UnitState.death;
        if(enrity.baseComponent.type === EntityType.Player) {
            this.ecsWorld.destroyPlayerEntityInWorld(entityId);
        }
        else if(enrity.baseComponent.type === EntityType.Monster) {
            this.ecsWorld.destroyMonestEntityInWorld(entityId);
        }
    }

    private OnProcessPlayerAttackEvent(event): void {
        var entity = this.ecsWorld.getPlayerEntityByID(event.playerId);
        if(!entity) { // 找不到玩家;
            return;
        }
        
        NavSystem.stopAction(entity.navComponent);

        var attackTarget = null;
        if(!AttackSystem.isAreaAttack(event.attackId)) {
            attackTarget = this.ecsWorld.getNearastMonestAttackEntity(entity, event.attackId);
        }
        
        AttackSystem.startAttackAction(event.attackId, attackTarget, 
                                       entity.unitComponent, 
                                       entity.baseComponent, 
                                       entity.transformComponent, 
                                       entity.attackComponent);
    }

    private OnProcessJoystickEvent(event): void {
        var entity = this.ecsWorld.getPlayerEntityByID(event.playerId);
        if(!entity) { // 哪个玩家有摇杆操作;
            return;
        }

        entity.roleComponent.controlMode = ControlMode.joystick;

        if(event.dir.x === 0 && event.dir.y === 0) {
            NavSystem.stopAction(entity.navComponent);   
            EntityUtils.setEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent); 
            return;
        }
        
        NavSystem.startNavJoystickAction(event.dir, entity.navComponent, entity.unitComponent, entity.baseComponent);
    }

    private OnProcessSwitchRoleEvent(event): void {
        var roleId = event.roleId;
        var playerId = event.playerId; 

        var player = this.ecsWorld.getPlayerEntityByID(event.playerId);
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
        EntityFactory.switchRole(player, roleId);
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
        var pos = event.pos;
        var playerId = event.playerId;
        
        var entity = this.ecsWorld.getPlayerEntityByID(playerId);
        if(!entity) {
            return;
        }
        
        entity.roleComponent.controlMode = ControlMode.touch;
        var roadNodeArr:RoadNode[] = PathFindingAgent.instance.seekPath2(entity.transformComponent.pos.x, entity.transformComponent.pos.y, pos.x, pos.y);
        if(roadNodeArr.length < 2) {
            return;
        }

        AttackSystem.stopAttackAction(entity.attackComponent, entity.unitComponent, entity.baseComponent);
        NavSystem.startNavTouchAction(roadNodeArr, entity.navComponent, entity.unitComponent);
    }

    private DeleteOtherEntity(entityId: number): void {
        this.ecsWorld.destroyPlayerEntityInWorld(entityId);
    }

    public ClearFightScene(): void {
        this.gameCamrea.BindTarget(null);
        this.ecsWorld.destroyWorld();
        this.selfPlayerEntity = null;
    }

    private SelfTransferMap(mapId, spawnId): void {
        if(this.mapId == mapId) {
            return;
        }
        this.ClearFightScene();
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
        this.mapData = mapData;
        this.mapParams = this.GetMapParams(mapData, bgTex, mapLoadModel);

        var width = (DeviceParams.winSize.width < this.mapParams.viewWidth) ? DeviceParams.winSize.width : this.mapParams.viewWidth;
        var height = (DeviceParams.winSize.height < this.mapParams.viewHeight) ? DeviceParams.winSize.height : this.mapParams.viewHeight;
        this.mapRoot.setPosition(v3(-width * 0.5, -height * 0.5, 0));

        this.gameCamrea.resetCamera(enterSpawnId, this.mapRoot, this.mapParams, this.mapData);

        var gameMapPrefab = ResManager.Instance.TryGetAsset(BundleName.Map, "GameMap");
        var gameMap = instantiate(gameMapPrefab) as unknown as Node;
        this.mapRoot.addChild(gameMap); // Entiry世界
        gameMap.setPosition(Vec3.ZERO);
        gameMap.addComponent(MapViewLoader).Init(this.mapParams);

        this.ecsWorld = gameMap.addComponent(ECSManager);
        await this.ecsWorld.init(this.mapParams, this.mapData);
    }

    public async LoadAndGotoMap(mapId: string, enterSpawnId: number, mapLoadModel:MapLoadModel = MapLoadModel.single) {
        this.isLoading = true;
        this.mapId = mapId;

        var jsonAsset: any = await ResManager.Instance.IE_GetAsset(BundleName.MapData, mapId, JsonAsset);

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

        var bgTex = await ResManager.Instance.IE_GetAsset(BundleName.MapBg, mapId + "/texture", Texture2D);

        await ResManager.Instance.IE_GetAsset(BundleName.Map, "GameMap", Prefab);

        await this.InitGameMap(jsonAsset.json, enterSpawnId, bgTex as Texture2D, mapLoadModel);

        var config = {selectRoleId: 1, controlType: 1, controlMode: 0, playerType: 1, enterSpawnId: enterSpawnId, state: UnitState.idle, direction: 0 };
        this.selfPlayerEntity = await this.ecsWorld.onPlayerEnterWorld(config);

        if(DeviceParams.winSize.width < this.mapParams.mapWidth || DeviceParams.winSize.height < this.mapParams.mapHeight) {
            this.gameCamrea.BindTarget(this.selfPlayerEntity);
        }
        else {
            this.gameCamrea.BindTarget(null);
            this.gameCamrea.node.setPosition(v3(0, 0, 1000));
        }

        this.isLoading = false;
    }
}


