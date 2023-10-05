import { _decorator, Component, Node } from 'cc';
import { EntityType } from '../Constants';
const { ccclass, property } = _decorator;

export class EntityFactory extends Component {
    public static CreatePlayerEntity(config: any): any {
        return null;
    }

    private static CreateNPCEntity(config: any): any {
        console.log("CreateNPCEntity");
        return null;
    }

    private static CreateMonestEntity(config: any): any {
        return null;
    }

    private static CreateTransferEntity(config: any): any {
        console.log("CreateTransferEntity", config);
        return null;
    }

    private static CreateSpwanPointEnity(config: any): any {
        console.log("CreateSpwanPointEnity", config);
        return null;
    }

    public static CreateEntity(config: any): any {
        var ret: any = null;

        if(config.type == EntityType.NPC) {
            EntityFactory.CreateNPCEntity(config);
        }
        else if(config.type == EntityType.Monster) {
            EntityFactory.CreateMonestEntity(config);
        }
        else if(config.type == EntityType.Transfer) {
            ret = EntityFactory.CreateTransferEntity(config);
        }else if(config.type == EntityType.SpawnPoint) {
            ret = EntityFactory.CreateSpwanPointEnity(config);
        }

        return ret;
    }
}


