import { _decorator, Component, Node } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
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
        EventManager.Instance.AddEventListener(UIEventName.UIEventHome,this.UIEventHome,this);
    }

    public UIEventHome(uname:string,udata:any){
        this.loadAndGotoMap(udata.mapId,udata.enterSpawnId,udata.mapLoadModel);
    }

    public async loadAndGotoMap(mapId:string,enterSpawnId:number,mapLoadModel:MapLoadModel=MapLoadModel.single){
        
        await SceneManager.Instance.IE_RunScene("Main");
        await UIManager.Instance.IE_ShowUIView(UIView.UILoading,null,BundleName.GUI);
        UIManager.Instance.DestroyUIView(UIView.UILoading);
        UIManager.Instance.DestroyUIView(UIView.UILogin);
    }
}

 
