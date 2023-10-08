import { _decorator, Component, Node, EventTouch, Vec2 } from 'cc';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { UIGameEvent } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('UIGameUICtrl')
export class UIGameUICtrl extends UIComponent {
    start(): void {
        var node = this.ViewNode("TouchPlane");
        node.on(Node.EventType.TOUCH_START,this.onTouchNavEvent,this);
    }

    private onTouchNavEvent(event: EventTouch): void {
        console.log(event);
        var touchPos:Vec2 = event.getUILocation();

        EventManager.Instance.Emit(UIGameEvent.UITouchNav, touchPos);
    }
}


