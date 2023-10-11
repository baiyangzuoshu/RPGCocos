import { _decorator, Component, Node, EventTouch, Vec2, v2, Vec3, v3, UITransform } from 'cc';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { UIGameEvent } from '../Constants';
import { ControlMode } from '../World/Components/RoleComponent';
const { ccclass, property } = _decorator;

@ccclass('UIGameUICtrl')
export class UIGameUICtrl extends UIComponent {
    private joystick: Node = null;
    private stick: Node = null;

    private controlMode: ControlMode = ControlMode.joystick;
    private startPos: Vec2 = null;
    private endPos: Vec2 = null;
    private maxR: number = 80;

    private uiTransform: UITransform = null;

    public static name2MapName = {
        "MapItem1": "10001",
        "MapItem2": "10002",
        "MapItem3": "10003",
        "MapItem4": "10004",
        "MapItem5": "10005",
    };

    start(): void {
        var node = this.ViewNode("TouchPlane");

        this.joystick = this.ViewNode("Joystick");
        this.joystick.active = false;
        this.stick = this.joystick.getChildByName("Stick");

        this.uiTransform = this.node.getComponent(UITransform);
        // 摇杆的事件
        node.on(Node.EventType.TOUCH_START, this.onTouchStartEvent,this);
        node.on(Node.EventType.TOUCH_MOVE, this.onTouchMoveEvent,this);
        node.on(Node.EventType.TOUCH_END, this.onTouchEndEvent,this);
        node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEndEvent,this);
        // end

        // Topbar按钮响应
        this.AddButtonListener("UILayer/TopToolbar/ControllBtn", this, this.OnChangeControlType);
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

    private onTouchMoveEvent(event: EventTouch): void {
        if(this.controlMode !== ControlMode.joystick) {
            return;
        }

        // 摇杆的代码,决定搞一个摇杆的方向
        this.endPos = event.getUILocation();
        var dir = v2();
        Vec2.subtract(dir, this.endPos, this.startPos);
        var len = dir.length();
        len = (len > this.maxR) ? this.maxR : len;
        dir = dir.normalize(); // dir.x = cos(r), dir.y = sin(r)
        EventManager.Instance.Emit(UIGameEvent.UIJoystick, dir);
        // end

        this.stick.setPosition(v3(len * dir.x, len * dir.y, 0));

    }

    private onTouchEndEvent(event: EventTouch): void {
        if(this.controlMode !== ControlMode.joystick) {
            return;
        }

        // 摇杆的代码,决定搞一个摇杆的方向, 传递摇杆的方向为0， 0
        var dir = v2(0, 0);
        EventManager.Instance.Emit(UIGameEvent.UIJoystick, dir);
        // end
        this.joystick.active = false; 
    }

    private onTouchStartEvent(event: EventTouch): void {
        if(this.controlMode === ControlMode.joystick) { // 摇杆模式
            this.startPos = event.getUILocation();
            this.endPos = this.startPos;
            this.joystick.active = true; 
            var joyStickPos = this.uiTransform.convertToNodeSpaceAR(v3(this.startPos.x, this.startPos.y, 0));
            this.joystick.setPosition(joyStickPos);
            this.stick.setPosition(Vec3.ZERO);
            return;
        }

        // 逻辑导航模式
        var touchPos:Vec2 = event.getUILocation();
        EventManager.Instance.Emit(UIGameEvent.UITouchNav, touchPos);
    }

    private OnChangeControlType(): void {
        this.controlMode = (this.controlMode === ControlMode.joystick) ? ControlMode.touch : ControlMode.joystick 
    }

    private OnSwitchRole(): void {
        EventManager.Instance.Emit(UIGameEvent.UISwitchRole, null);
    }

    private OnLoginOut(): void {
        EventManager.Instance.Emit(UIGameEvent.UILoginOut, null);
    }
}


