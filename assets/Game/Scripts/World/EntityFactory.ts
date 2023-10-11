import { _decorator, Component, Node, Prefab, instantiate, Label, BoxCollider, SphereCollider } from 'cc';
import { ResManager } from '../../../Framework/Scripts/Managers/ResManager';
import { BundleName, EntityName } from '../Constants';
import { EntityType } from './Components/BaseComponent';
import { RectShapeComponent, RoundShapeComponent, ShapeType } from './Components/ShapeComponent';
import { UnitState } from './Components/UnitComponent';
import { PlayerEntity } from './Entities/PlayerEntity';
import { TransferEntity } from './Entities/TransferEntity';
import { EntityUtils } from './EntityUtils';
const { ccclass, property } = _decorator;

export class EntityFactory extends Component {
    public static autoID: number = 1;
    public static entityRoot: Node = null;
    
    public static Init(gameMap: Node): void {
        EntityFactory.entityRoot = gameMap.getChildByPath("Layer/EntityLayer");
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
        entity.baseComponent.gameObject = instantiate(prefab) as unknown as Node;
        // entity.baseComponent.gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(entity.baseComponent.gameObject);
        entity.baseComponent.gameObject.setPosition(entity.transformComponent.pos);
        // end

        // UnitComponent, 从配置文件里面读,
        var prevState = entity.unitComponent.state;
        entity.unitComponent.state = UnitState.none;
        EntityUtils.SetEntityState(prevState, entity.unitComponent, entity.baseComponent);
        EntityUtils.SetEntityDirection(entity.unitComponent.direction, entity.unitComponent, entity.baseComponent)
        // end

        // ShapeComponent
        var b = entity.baseComponent.gameObject.getChildByName("FootTrigger").getComponent(BoxCollider)
        if(b) {
            entity.shapeComponent.type = ShapeType.Rect;
            entity.shapeComponent.shape = new RectShapeComponent();
            entity.shapeComponent.shape.width = b.size.x;
            entity.shapeComponent.shape.height = b.size.y;
        }
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

        // ShapeComponent
        // var radiusArray = [100, 100, 50];
        // entity.shapeComponent.radius = radiusArray[config.transferType];
        // end

        // RoleComponent
        entity.roleComponent.roleId = config.selectRoleId;
        entity.roleComponent.playerType = config.playerType; // my, other
        entity.roleComponent.controlType = config.controlType; // 用户, AI, 网络控制
        entity.roleComponent.controlType = config.controlType; // touch, joystick
        // end


        // 创建我们的entity对应的节点
        // var prefabNameArray = ["Prefabs/TransferDoor1", "Prefabs/TransferDoor2", "Prefabs/TransferDoor3"];
        var pefabName = "Prefabs/Player_" + config.selectRoleId;
        var prefab = await ResManager.Instance.IE_GetAsset(BundleName.Charactors, pefabName, Prefab);
        entity.baseComponent.gameObject = instantiate(prefab) as unknown as Node;
        // entity.baseComponent.gameObject.getChildByName("NameTxt").getComponent(Label).string = config.objName;
        EntityFactory.entityRoot.addChild(entity.baseComponent.gameObject);
        entity.baseComponent.gameObject.setPosition(entity.transformComponent.pos);
        // end

        // UnitComponent, 从配置文件里面读,
        entity.unitComponent.state = UnitState.none;
        entity.unitComponent.direction = config.direction;
        EntityUtils.SetEntityState(config.state, entity.unitComponent, entity.baseComponent);
        EntityUtils.SetEntityDirection(config.direction, entity.unitComponent, entity.baseComponent)
        // end

        // ShapeComponent
        var b = entity.baseComponent.gameObject.getChildByName("FootTrigger").getComponent(BoxCollider)
        if(b) {
            entity.shapeComponent.type = ShapeType.Rect;
            entity.shapeComponent.shape = new RectShapeComponent();
            entity.shapeComponent.shape.width = b.size.x;
            entity.shapeComponent.shape.height = b.size.y;

            // console.log(entity.shapeComponent.shape);
        }
        // end

        return entity;
    }

    
    public static DestoryEntityGameObject(entity): void {
        entity.baseComponent.gameObject.destroy();
    }



    public static async CreateNPCEntity(config: any) {
        console.log("CreateNPCEntity", config);
        return null;
    }



    public static async CreateMonestEntity(config: any) {
        console.log("CreateMonestEntity", config);
        return null;
    }

    public static async CreateTransferEntity(config: any) {
        
        // 在场景中构造节点
        var entity: TransferEntity = new TransferEntity();
        // 我们要把Entity里面的数据给他初始化好
        // BaseComponent
        entity.baseComponent.entityID = EntityFactory.autoID ++;
        entity.baseComponent.type = EntityType.Transfer;
        entity.baseComponent.name = config.objName;
        entity.baseComponent.subTypeID = config.objType;
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
            entity.shapeComponent.type = ShapeType.Rect;
            entity.shapeComponent.shape = new RectShapeComponent();
            entity.shapeComponent.shape.width = b.size.x;
            entity.shapeComponent.shape.height = b.size.y;
        }
        else {
            var c = entity.baseComponent.gameObject.getComponent(SphereCollider);
            if(c) {
                entity.shapeComponent.shape = new RoundShapeComponent();
                entity.shapeComponent.shape.radius = c.radius; 
            }
        }
        // console.log(entity.shapeComponent.shape);
        // end

        return entity;
    }
}


