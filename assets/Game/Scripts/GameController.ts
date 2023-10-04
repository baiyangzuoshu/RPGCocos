import { _decorator, Component, Node, Prefab, JsonAsset, ImageAsset, Texture2D } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import { SceneManager } from '../../Framework/Scripts/Managers/SceneManager';
import { UIManager } from '../../Framework/Scripts/Managers/UIManager';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import { BundleName, UIEventName, UIView } from './Constants';
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
        EventManager.Instance.AddEventListener(UIEventName.UILoginSuccessReturn,this.UILoginSuccessReturn,this);
    }

    private async UILoginSuccessReturn(uname:string,udata:any){
        await SceneManager.Instance.IE_RunScene("Main");
        await ResManager.Instance.IE_GetAsset(BundleName.GUI,UIView.UIGame,Prefab);

        await this.loadAndGotoMap(udata.mapId,udata.enterSpawnId,udata.mapLoadModel);

        //删除加载界面
        UIManager.Instance.DestroyUIView(UIView.UILoading);
    }

    public async loadAndGotoMap(mapId:string,enterSpawnId:number,mapLoadModel:MapLoadModel=MapLoadModel.single){
        //加载地图
        await ResManager.Instance.IE_LoadBundleAndAllAssets(BundleName.MapData,JsonAsset);
        await ResManager.Instance.IE_LoadBundleAndAllAssets(BundleName.MapBg,Texture2D);
    }
}

 