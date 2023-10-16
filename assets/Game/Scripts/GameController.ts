import { Component, JsonAsset, Node, Prefab, Texture2D, find } from 'cc';
import { EventManager } from '../../Framework/Scripts/Managers/EventManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import { SceneManager } from '../../Framework/Scripts/Managers/SceneManager';
import { UIManager } from '../../Framework/Scripts/Managers/UIManager';
import { MapLoadModel } from './3rd/map/base/MapLoadModel';
import { BundleName, GameEvent, ServerReturnEvent, UIGameEvent, UIView } from './Constants';
import { FightManager } from './FightManager';

export class GameController extends Component {
    public static Instance: GameController = null!;
    
    private gameEventProcess = {};
    
    protected onLoad(): void {
        if(GameController.Instance !== null) {
            this.destroy();
            return;
        }

        GameController.Instance = this;
    }

    private InitReturnEventListeners(): void {
        this.gameEventProcess[ServerReturnEvent.LoginOutRet] = this.OnProcessLoginOutEvent;
        this.gameEventProcess[ServerReturnEvent.LoginInRet] = this.OnProcessLoginInEvent;
    }

    private async OnProcessLoginOutEvent(event) {
        await UIManager.Instance.IE_ShowUIView(UIView.UILogin);
        UIManager.Instance.DestroyUIView(UIView.UIGame);

        if(FightManager.Instance) {
            FightManager.Instance.ClearFightScene();
            FightManager.Instance = null;
        }
    }

    private async OnProcessLoginInEvent(event) {
        await SceneManager.Instance.IE_RunScene("Main");
 
        var fightMgr = find("MapCanvas").addComponent(FightManager);
        fightMgr.Init();
 
        await ResManager.Instance.IE_GetAsset(BundleName.GUI, UIView.UIGame, Prefab);
        
        await FightManager.Instance.LoadAndGotoMap("10001", 0, MapLoadModel.single);

        UIManager.Instance.DestroyUIView(UIView.UILoading);
        UIManager.Instance.IE_ShowUIView(UIView.UIGame);
    }

    public Init(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UILoginOut, this.OnUILoginOut, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UILoginIn, this.OnUILoginIn, this);
        this.InitReturnEventListeners();

        EventManager.Instance.AddEventListener(GameEvent.NetServerRetEvent, this.OnServerEventReturn, this);
    }

    private OnServerEventReturn(eventName: string, event: any): void {
        var func = this.gameEventProcess[event.eventType];
        if(func) {
            func.call(this, event);
            return;
        }

        if(FightManager.Instance !== null) {
            FightManager.Instance.OnServerEventReturn(eventName, event);
        }
    }

    private OnUILoginOut(): void {
        var serverData = { eventType: ServerReturnEvent.LoginOutRet }
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
    }

    private OnUILoginIn(eventName: string, udata: any) {
        var serverData = { eventType: ServerReturnEvent.LoginInRet }
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
    }    

}


