import { _decorator, Component, Node, Prefab, JsonAsset, ImageAsset, Texture2D, find } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import { SceneManager } from '../../Framework/Scripts/Managers/SceneManager';
import { UIManager } from '../../Framework/Scripts/Managers/UIManager';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import { BundleName, UIGameEvent, UIView } from './Constants';
import { FightManager } from './FightManager';
const { ccclass, property } = _decorator;

export class GameController extends Component {
    public static Instance: GameController = null;

    protected onLoad(): void {
        if(GameController.Instance !== null) {
            this.destroy();
            return;
        }

        GameController.Instance = this;
    }

    public Init(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UILoginSuccessReturn,this.UILoginSuccessReturn,this);
    }

    private async UILoginSuccessReturn(uname:string,udata:any){
        await SceneManager.Instance.IE_RunScene("Main");

        find("MapCanvas").addComponent(FightManager).Init();

        await ResManager.Instance.IE_GetAsset(BundleName.GUI,UIView.UIGame,Prefab);

        await FightManager.Instance.loadAndGotoMap(udata.mapId,udata.enterSpawnId,udata.mapLoadModel);

        //删除加载界面
        UIManager.Instance.DestroyUIView(UIView.UILoading);
        //显示游戏界面
        UIManager.Instance.IE_ShowUIView(UIView.UIGame,null,BundleName.GUI);
    }

    
}

 
