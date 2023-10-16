import { BoxCollider, game, instantiate, Label, Node, Prefab, SphereCollider, Texture2D, UIOpacity, v3 } from 'cc';
import { TransferEntity } from './Entities/TransferEntity';
import { EntityType } from './Components/BaseComponent';
import { BundleName } from '../Constants';
import { PlayerEntity } from './Entities/PlayerEntity';
import { EntityUtils } from './EntityUtils';
import { UnitState } from './Components/UnitComponent';
import { NPCEntity } from './Entities/NPCEntity';
import MovieClip from '../Utils/MovieClip';
import EntityLayer from '../3rd/map/layer/EntityLayer';
import { NavComponent } from './Components/NavComponent';
import { PatrolAIComponent } from './Components/PatrolAIComponent';
import { MonestEntity } from './Entities/MonestEntity';
import { InteractiveState, NPCInteractiveComponent } from './Components/NPCInteractiveComponent';
import { ResManager } from '../../../Framework/Scripts/Managers/ResManager';
import { GameDataManager } from '../GameDataManager';

export class EntityFactory {
    public static autoID: number = 1;
    public static entityRoot: Node = null;
    
    public static init(gameMap: Node): void {
        EntityFactory.entityRoot = gameMap.getChildByPath("Layer/EntityLayer");
        EntityFactory.entityRoot.addComponent(EntityLayer);
    }

    public static exit(): void {
        EntityFactory.entityRoot = null;
    }

    public static async switchRole(entity: PlayerEntity, roleId) {

        entity.roleComponent.roleId = roleId;
        var pefabName = "Prefabs/Player_" + roleId;
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, pefabName, Prefab);
        var gameObject = instantiate(prefab) as unknown as Node;
        EntityFactory.entityRoot.addChild(gameObject);
        gameObject.setPosition(entity.transformComponent.pos);
        entity.baseComponent.gameObject = gameObject;

        var prevState = entity.unitComponent.state;
        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.uiOpacity = gameObject.getComponent(UIOpacity);
        EntityUtils.setEntityState(prevState, entity.unitComponent, entity.baseComponent);
        EntityUtils.setEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)

        entity.shapeComponent.radius = GameDataManager.Instance.charactorConfig[roleId].radius; // 从配置表里面读取;
        entity.shapeComponent.width = GameDataManager.Instance.charactorConfig[roleId].width; 
        entity.shapeComponent.height = GameDataManager.Instance.charactorConfig[roleId].height;
    }

    public static async createPlayerEntity(config: any, x, y) {
        var entity: PlayerEntity = new PlayerEntity();
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Player;
        entity.baseComponent.name = "Player";
        entity.baseComponent.subTypeID = config.selectRoleId;

        entity.transformComponent.pos.x = x;
        entity.transformComponent.pos.y = y;

        entity.roleComponent.roleId = config.selectRoleId;
        entity.roleComponent.playerType = config.playerType; // my, other
        entity.roleComponent.controlType = config.controlType; // 用户, AI, 网络控制
        entity.roleComponent.controlType = config.controlType; // touch, joystick

        entity.unitComponent.state = config.state;
        entity.unitComponent.direction = config.direction;
        EntityFactory.switchRole(entity, config.selectRoleId);
        return entity;
    }

    public static destoryEntityGameObject(entity): void {
        if(entity.baseComponent.gameObject !== null) {
            entity.baseComponent.gameObject.destroy();
        }
    }

    public static async createNPCEntity(config: any) {
        var entity: NPCEntity = new NPCEntity();

        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.NPC;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = parseInt(config.objId);

        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;

        entity.npcComponent.npcId = Number(config.objId);
        entity.npcComponent.defaultDir = config.direction;
        entity.npcComponent.isPatrol = config.isPatrol;    
        entity.npcComponent.dialogueId = Number(config.dialogueId);
        entity.npcComponent.taskId = Number(config.taskId);
        entity.npcComponent.funcId = Number(config.funcId);
        entity.npcComponent.startX = config.x;
        entity.npcComponent.startY = config.y;

        var pefabName = "Prefabs/NPC";
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, pefabName, Prefab);
        var gameObject = instantiate(prefab) as unknown as Node;
        var filePath:string = "npc/" + config.objId + "/texture";
        var tex = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, filePath, Texture2D);
        gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(gameObject);
        gameObject.setPosition(v3(config.x, config.y, 0));

        entity.unitComponent.uiOpacity = gameObject.getComponent(UIOpacity);
        entity.unitComponent.movieClip = gameObject.getComponentInChildren(MovieClip);
        entity.unitComponent.movieClip.init(tex as Texture2D, 5, 12);
        entity.baseComponent.gameObject = gameObject;

        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.direction = config.direction;
        EntityUtils.setEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent);
        EntityUtils.setEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)

        entity.shapeComponent.radius = GameDataManager.Instance.npcConfig[entity.baseComponent.subTypeID].radius; // 接入配置表
        entity.shapeComponent.width = GameDataManager.Instance.npcConfig[entity.baseComponent.subTypeID].width;
        entity.shapeComponent.height = GameDataManager.Instance.npcConfig[entity.baseComponent.subTypeID].height;

        // NPC 交互
        if(entity.npcComponent.dialogueId !== 0 || entity.npcComponent.funcId !== 0 || entity.npcComponent.taskId !== 0) {
            entity.npcInteractiveComponent = new NPCInteractiveComponent();
            if(entity.npcComponent.dialogueId !== 0) {
                entity.npcInteractiveComponent.actionId.push(entity.npcComponent.dialogueId);
                entity.npcInteractiveComponent.actionSeq.push(InteractiveState.Talking);
                // 根据对话ID，从配置文件里面读取;
                entity.npcInteractiveComponent.sayStatement = GameDataManager.Instance.GetNpcTalkData(config.dialogueId);
                entity.npcInteractiveComponent.sayIndex = 0;
            }

            if(entity.npcComponent.funcId !== 0) {
                entity.npcInteractiveComponent.actionId.push(entity.npcComponent.funcId);
                entity.npcInteractiveComponent.actionSeq.push(InteractiveState.ProcessingFunc);
            }

            if(entity.npcComponent.taskId !== 0) {
                entity.npcInteractiveComponent.actionId.push(entity.npcComponent.taskId);
                entity.npcInteractiveComponent.actionSeq.push(InteractiveState.ClaimTask);
            }
        } 
        
        if(!entity.npcComponent.isPatrol) {
            return entity;
        }
        
        entity.navComponent = new NavComponent();

        entity.patrolAIComponent = new PatrolAIComponent();
        entity.patrolAIComponent.patrolRange = 200;
        entity.patrolAIComponent.lastTime = 3.5;
        entity.patrolAIComponent.isStopPatrol = false;

        return entity;
    }

    public static async createMonestEntity(config: any) {
        var entity: MonestEntity = new MonestEntity();

        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Monster;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = Number(config.objId);

        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;

        entity.monestComponent.monsterId = Number(config.objId);
        entity.monestComponent.defaultDir = config.direction;
        entity.monestComponent.isPatrol = config.isPatrol;    
        entity.monestComponent.dialogueId = config.dialogueId;
        entity.monestComponent.fightId = config.fightId;
        entity.monestComponent.startX = config.x;
        entity.monestComponent.startY = config.y;

        var pefabName = "Prefabs/Monster";
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, pefabName, Prefab);
        var gameObject = instantiate(prefab) as unknown as Node;
        var filePath:string = "monster/" + config.objId + "/texture";
        var tex = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, filePath, Texture2D);
        gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(gameObject);
        gameObject.setPosition(v3(config.x, config.y, 0));

        entity.unitComponent.uiOpacity = gameObject.getComponent(UIOpacity);
        entity.unitComponent.movieClip = gameObject.getComponentInChildren(MovieClip);
        entity.unitComponent.movieClip.init(tex as Texture2D, 5, 8);
        entity.baseComponent.gameObject = gameObject;

        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.direction = config.direction;
        EntityUtils.setEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent);
        EntityUtils.setEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)

        entity.shapeComponent.radius = GameDataManager.Instance.monesterConfig[entity.baseComponent.subTypeID].radius;
        entity.shapeComponent.width = GameDataManager.Instance.monesterConfig[entity.baseComponent.subTypeID].width; // 目前写死，后面写到配置文件
        entity.shapeComponent.height = GameDataManager.Instance.monesterConfig[entity.baseComponent.subTypeID].height; 
        

        if(!entity.monestComponent.isPatrol) {
            return entity;
        }
        
        entity.navComponent = new NavComponent();
        
        return entity;
    }

    public static async createTransferEntity(config: any) {
        var entity: TransferEntity = new TransferEntity();
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Transfer;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = config.transferType;

        entity.transferComponent.targetMapId = config.targetMapId.toString();
        entity.transferComponent.targetMapSpawnId = config.targetMapSpawnId;
        entity.transferComponent.transferType = config.transferType;        

        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;
        
        var prefabNameArray = ["Prefabs/TransferDoor1", "Prefabs/TransferDoor2", "Prefabs/TransferDoor3"];
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, prefabNameArray[config.transferType], Prefab);
        entity.baseComponent.gameObject = instantiate(prefab) as unknown as Node;
        entity.baseComponent.gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(entity.baseComponent.gameObject);
        entity.baseComponent.gameObject.setPosition(entity.transformComponent.pos);

        var b = entity.baseComponent.gameObject.getComponent(BoxCollider)
        if(b) {
            entity.shapeComponent.radius = entity.shapeComponent.height;
            entity.shapeComponent.width = b.size.x;
            entity.shapeComponent.height = b.size.y;
        }
        else {
            var c = entity.baseComponent.gameObject.getComponent(SphereCollider);
            if(c) {
                entity.shapeComponent.radius = c.radius; 
                entity.shapeComponent.width = c.radius; 
                entity.shapeComponent.height = c.radius; 
            }
        }

        return entity;
    }
}


