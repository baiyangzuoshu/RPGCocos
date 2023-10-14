import { _decorator, Component, Node, Prefab, instantiate, Label, BoxCollider, SphereCollider, Texture2D, v3, UIOpacity } from 'cc';
import { ResManager } from '../../../Framework/Scripts/Managers/ResManager';
import { GameDataManager } from '../../GameDataManager';
import EntityLayer from '../3rd/map/layer/EntityLayer';
import { BundleName, EntityName } from '../Constants';
import MovieClip from '../Utils/MovieClip';
import { EntityType } from './Components/BaseComponent';
import { NavComponent } from './Components/NavComponent';
import { InteractiveState, NPCInteractiveComponent } from './Components/NPCInteractiveComponent';
import { PatrolAIComponent } from './Components/PatrolAIComponent';
import { UnitState } from './Components/UnitComponent';
import { MonestEntity } from './Entities/MonestEntity';
import { NPCEntity } from './Entities/NPCEntity';
import { PlayerEntity } from './Entities/PlayerEntity';
import { TransferEntity } from './Entities/TransferEntity';
import { EntityUtils } from './EntityUtils';
const { ccclass, property } = _decorator;

export class EntityFactory {
    public static autoID: number = 1;
    public static entityRoot: Node = null;
    

    public static Init(gameMap: Node): void {
        EntityFactory.entityRoot = gameMap.getChildByPath("Layer/EntityLayer");
        EntityFactory.entityRoot.addComponent(EntityLayer);
    }

    public static Exit(): void {
        EntityFactory.entityRoot = null;
    }

    public static async SwitchRole(entity: PlayerEntity, roleId) {

        entity.roleComponent.roleId = roleId;
        // 创建我们的entity对应的节点
        // var prefabNameArray = ["Prefabs/TransferDoor1", "Prefabs/TransferDoor2", "Prefabs/TransferDoor3"];
        var pefabName = "Prefabs/Player_" + roleId;
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, pefabName, Prefab);
        var gameObject = instantiate(prefab) as unknown as Node;
        // entity.baseComponent.gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(gameObject);
        gameObject.setPosition(entity.transformComponent.pos);
        entity.baseComponent.gameObject = gameObject;
        // end

        // UnitComponent, 从配置文件里面读,
        var prevState = entity.unitComponent.state;
        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.uiOpacity = gameObject.getComponent(UIOpacity);
        EntityUtils.SetEntityState(prevState, entity.unitComponent, entity.baseComponent);
        EntityUtils.SetEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)
        // end

        // ShapeComponent
        entity.shapeComponent.radius = 20; // 从配置表里面读取;
        entity.shapeComponent.width = 60; 
        entity.shapeComponent.height = 80;
        // end
        
    }

    // 来自于网络, {playerType: 1, selectRoleId: 0, controlType: 1, controlMode: 2, x: 位置, y: 位置, state}
    public static async CreatePlayerEntity(config: any, x, y) {
        // console.log(config);

        // 在场景中构造节点
        var entity: PlayerEntity = new PlayerEntity();
        // 我们要把Entity里面的数据给他初始化好
        // BaseComponent
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Player;
        entity.baseComponent.name = "Player";
        entity.baseComponent.subTypeID = config.selectRoleId;
        // end

        // TransformComponent
        entity.transformComponent.pos.x = x;
        entity.transformComponent.pos.y = y;
        // end 

        // RoleComponent
        entity.roleComponent.roleId = config.selectRoleId;
        entity.roleComponent.playerType = config.playerType; // my, other
        entity.roleComponent.controlType = config.controlType; // 用户, AI, 网络控制
        entity.roleComponent.controlType = config.controlType; // touch, joystick
        // end

        // UnitComponent, 从配置文件里面读,
        entity.unitComponent.state = config.state;
        entity.unitComponent.direction = config.direction;
        EntityFactory.SwitchRole(entity, config.selectRoleId);
        // end

        return entity;
    }

    public static DestoryEntityGameObject(entity): void {
        if(entity.baseComponent.gameObject !== null) {
            entity.baseComponent.gameObject.destroy();
        }
    }

    public static async CreateNPCEntity(config: any) {
        // 在场景中构造节点
        var entity: NPCEntity = new NPCEntity();

        // BaseComponent
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.NPC;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = parseInt(config.objId);
        // end

        // TransformComponent
        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;
        // end

        // NPC Componet
        entity.npcComponent.npcId = Number(config.objId);
        entity.npcComponent.defaultDir = config.direction;
        entity.npcComponent.isPatrol = config.isPatrol;    
        entity.npcComponent.dialogueId = Number(config.dialogueId);
        entity.npcComponent.taskId = Number(config.taskId);
        entity.npcComponent.funcId = Number(config.funcId);
        entity.npcComponent.startX = config.x;
        entity.npcComponent.startY = config.y;
        // end 

        // 创建我们的Cocos Node
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
        // end

        // unitComponent
        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.direction = config.direction;
        EntityUtils.SetEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent);
        EntityUtils.SetEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)
        // end

        // ShapeComponent
        entity.shapeComponent.radius = 20; // 接入配置表
        entity.shapeComponent.width = 60;
        entity.shapeComponent.height = 80;
        // end

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
        // end
        
        if(!entity.npcComponent.isPatrol) {
            return entity;
        }
        
        // nav
        entity.navComponent = new NavComponent();
        // end

        // AI Partrol
        entity.patrolAIComponent = new PatrolAIComponent();
        entity.patrolAIComponent.patrolRange = 200;
        entity.patrolAIComponent.lastTime = 3.5;
        entity.patrolAIComponent.isStopPatrol = false;
        // end

        return entity;
    }



    public static async CreateMonestEntity(config: any) {
        // 在场景中构造节点
        var entity: MonestEntity = new MonestEntity();

        // BaseComponent
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Monster;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = Number(config.objId);
        // end

        // TransformComponent
        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;
        // end

        // monest Componet
        entity.monestComponent.monsterId = Number(config.objId);
        entity.monestComponent.defaultDir = config.direction;
        entity.monestComponent.isPatrol = config.isPatrol;    
        entity.monestComponent.dialogueId = config.dialogueId;
        entity.monestComponent.fightId = config.fightId;
        entity.monestComponent.startX = config.x;
        entity.monestComponent.startY = config.y;
        // end 

        // 创建我们的Cocos Node
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
        // end

        // unitComponent
        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.direction = config.direction;
        EntityUtils.SetEntityState(UnitState.idle, entity.unitComponent, entity.baseComponent);
        EntityUtils.SetEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)
        // end

        // ShapeComponent
        entity.shapeComponent.radius = 20;
        entity.shapeComponent.width = 46; // 目前写死，后面写到配置文件
        entity.shapeComponent.height = 60; 
        // entity.shapeComponent.shape.width = (tex as Texture2D).width / 5;
        // entity.shapeComponent.shape.height = (tex as Texture2D).height / 8;
        // end

        if(!entity.monestComponent.isPatrol) {
            return entity;
        }
        
        // nav
        entity.navComponent = new NavComponent();
        // end

        // AI Partrol
        /*entity.patrolAIComponent = new PatrolAIComponent();
        entity.patrolAIComponent.patrolRange = 200;
        entity.patrolAIComponent.lastTime = 3.5;
        entity.patrolAIComponent.isStopPatrol = false;
        */
        // end
        
        return entity;
    }

    public static async CreateTransferEntity(config: any) {
        
        // 在场景中构造节点
        var entity: TransferEntity = new TransferEntity();
        // 我们要把Entity里面的数据给他初始化好
        // BaseComponent
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Transfer;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = config.transferType;
        // end

        // TransferComponet
        entity.transferComponent.targetMapId = config.targetMapId.toString();
        entity.transferComponent.targetMapSpawnId = config.targetMapSpawnId;
        entity.transferComponent.transferType = config.transferType;        
        // end

        // TransformComponent
        entity.transformComponent.pos.x = config.x;
        entity.transformComponent.pos.y = config.y;
        // end 
        
        // 把传送门节点new出来, 后面整理到配置表;
        var prefabNameArray = ["Prefabs/TransferDoor1", "Prefabs/TransferDoor2", "Prefabs/TransferDoor3"];
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, prefabNameArray[config.transferType], Prefab);
        entity.baseComponent.gameObject = instantiate(prefab) as unknown as Node;
        entity.baseComponent.gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(entity.baseComponent.gameObject);
        entity.baseComponent.gameObject.setPosition(entity.transformComponent.pos);
        // end 

        // ShapeComponent, 原版资源用的是3D 碰撞器，最好用2D的;
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
        // console.log(entity.shapeComponent.shape);
        // end

        return entity;
    }



}





