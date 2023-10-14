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
        await UIManager.Instance.IE_ShowUIView("UILogin");
        UIManager.Instance.DestroyUIView("UIGame");

        if(FightManager.Instance) {
            FightManager.Instance.ClearFightScene();
            FightManager.Instance = null;
        }
    }

    private async OnProcessLoginInEvent(event) {
        // 预先加载我们的main场景, 然后再加载我们的地图
        await SceneManager.Instance.IE_RunScene("Main");
        // end
 
        var fightMgr = find("MapCanvas").addComponent(FightManager);
        fightMgr.Init();
 
        // 预先加载GameUI
        await ResManager.Instance.IE_GetAsset(BundleName.GUI, UIView.UIGame, Prefab);
        // end
        
        // 进入我们的第一个地图
        await FightManager.Instance.LoadAndGotoMap("10001", 0, MapLoadModel.single);
        // end

        UIManager.Instance.DestroyUIView(UIView.UILoading);
        UIManager.Instance.IE_ShowUIView(UIView.UIGame);
    }

    public Init(): void {
        EventManager.Instance.AddEventListener(UIGameEvent.UILoginOut, this.OnUILoginOut, this);
        EventManager.Instance.AddEventListener(UIGameEvent.UILoginIn, this.OnUILoginIn, this);
        this.InitReturnEventListeners();

        // 单机游戏，添加一个事件监听，模拟网络游戏
        // 如果网络游戏，由网络事件模块，来调用这个接口;
        EventManager.Instance.AddEventListener(GameEvent.NetServerRetEvent, this.OnServerEventReturn, this);
        // end
        
    }

    private OnServerEventReturn(eventName: string, event: any): void {
        console.log("[Recv Server Event] : " + event.eventType);
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
        // 发送消息給服务器，我们要登出去了;
        // end

        // 测试模拟, 网络返回的，第一个入口我们接入到GameController, 发送离开的事件, Enter/Exit
        // LoginOut不放战斗的原因就在这里，因为玩家要先做Enter/Exit AOI / 到战斗场景;
        var serverData = { eventType: ServerReturnEvent.LoginOutRet }
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        // end
    }

    private OnUILoginIn(eventName: string, udata: any) {
        // 发送消息給服务器，我们要登录
        // end 

        // 模拟服务器返回登录成功的消息，这里一般从网络模块接入
        var serverData = { eventType: ServerReturnEvent.LoginInRet }
        EventManager.Instance.Emit(GameEvent.NetServerRetEvent, serverData);
        // end
    }    

}


