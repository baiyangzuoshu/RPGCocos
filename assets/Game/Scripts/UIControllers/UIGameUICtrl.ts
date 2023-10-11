import { _decorator, Component, Node, EventTouch, Vec2 } from 'cc';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { UIGameEvent } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('UIGameUICtrl')
export class UIGameUICtrl extends UIComponent {
    public static name2MapName = {
        "MapItem1": "10001",
        "MapItem2": "10002",
        "MapItem3": "10003",
        "MapItem4": "10004",
        "MapItem5": "10005",
    };

    start(): void {
        var node = this.ViewNode("TouchPlane");
        node.on(Node.EventType.TOUCH_START,this.onTouchNavEvent,this);

        // Topbar按钮响应
        this.AddButtonListener("UILayer/TopToolbar/SwBtn", this, this.OnSwitchRole);
        this.AddButtonListener("UILayer/TopToolbar/LoginBtn", this, this.OnLoginOut);
        // 地图切换按钮响应
        this.AddButtonListener("UILayer/MapBar/Content/MapItem1", this, this.OnUIGotoMap);
        this.AddButtonListener("UILayer/MapBar/Content/MapItem2", this, this.OnUIGotoMap);
        this.AddButtonListener("UILayer/MapBar/Content/MapItem3", this, this.OnUIGotoMap);
        this.AddButtonListener("UILayer/MapBar/Content/MapItem4", this, this.OnUIGotoMap);
        this.AddButtonListener("UILayer/MapBar/Content/MapItem5", this, this.OnUIGotoMap);
    }

    private OnUIGotoMap(targetButton):void {
        var mapId: string = UIGameUICtrl.name2MapName[targetButton.node.name];
        if(!mapId) {
            return;
        }

        EventManager.Instance.Emit(UIGameEvent.UIChangeMap, mapId);
    }

    private onTouchNavEvent(event: EventTouch): void {
        // console.log(event);
        var touchPos:Vec2 = event.getUILocation();
        EventManager.Instance.Emit(UIGameEvent.UITouchNav, touchPos);
    }

    private OnSwitchRole(): void {
        EventManager.Instance.Emit(UIGameEvent.UISwitchRole, null);
    }

    private OnLoginOut(): void {
        EventManager.Instance.Emit(UIGameEvent.UILoginOut, null);
    }
}


