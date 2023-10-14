import { _decorator, Component, EditBox, Node } from 'cc';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { UIManager } from '../../../Framework/Scripts/Managers/UIManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
const { ccclass, property } = _decorator;

import { UIGameEvent, UIView } from '../Constants';

@ccclass('UILoginUICtrl')
export class UILoginUICtrl extends UIComponent {
    
    private unameEditor: EditBox = null;
    private upwdEditor: EditBox = null;

    
    protected start(): void {
        this.unameEditor = this.ViewComponent("LoginView/Content/EditField_Account/EditBox", EditBox);
        this.upwdEditor = this.ViewComponent("LoginView/Content/EditField_Password/EditBox", EditBox);

        this.AddButtonListener("LoginView/Content/LoginBtn", this, this.OnGameLogin);
        this.AddButtonListener("LoginView/Content/RegisterBtn", this, this.OnGameRegister);
    }

    private async OnGameLogin() {
        // 发送给服务器, 服务器给你回一个Success
        await UIManager.Instance.IE_ShowUIView(UIView.UILoading);
        UIManager.Instance.DestroyUIView(UIView.UILogin);
        // end

        // 给一个状态，如果正在登录中，就屏蔽掉，不让它点击;
        var uname = this.unameEditor.string;
        var upwd = this.upwdEditor.string;
        EventManager.Instance.Emit(UIGameEvent.UILoginIn, {uname: uname, upwd: upwd});
        // end
    }

    private OnGameRegister(): void {

    }
    
}
