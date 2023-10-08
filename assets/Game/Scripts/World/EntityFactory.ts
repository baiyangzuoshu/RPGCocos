import { _decorator, Component, Node, Prefab, instantiate, Label } from 'cc';
import { ResManager } from '../../../Framework/Scripts/Managers/ResManager';
import { BundleName, EntityName } from '../Constants';
import { EntityType } from './Components/BaseComponent';
import { PlayerEntity } from './Entities/PlayerEntity';
import { TransferEntity } from './Entities/TransferEntity';
const { ccclass, property } = _decorator;

export class EntityFactory extends Component {
    public static autoID: number = 1;
    public static entityRoot: Node = null;
    
    public static Init(gameMap: Node): void {
        EntityFactory.entityRoot = gameMap.getChildByPath("Layer/EntityLayer");
    }

    // 来自于网络, {playerType: 1, selectRoleId: 0, controlType: 1, controlMode: 2, x: 位置, y: 位置}
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

        // UnitComponent, 从配置文件里面读,
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

        return entity;
    }

    public static CreateNPCEntity(config: any): any {
        console.log("");
        return null;
    }

    public static CreateMonestEntity(config: any): any {
        
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
        entity.transferComponent.targetMapId = config.targetMapId;
        entity.transferComponent.targetMapSpawnId = config.targetMapSpawnId;
        entity.transferComponent.transferType = config.transferType;        
        // end

        // ShapeComponent
        var radiusArray = [100, 100, 50];
        entity.shapeComponent.radius = radiusArray[config.transferType];
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

        return entity;
    }
}


