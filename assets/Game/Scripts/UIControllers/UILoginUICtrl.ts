import { _decorator, Component, Node, EditBox } from 'cc';
import { SceneManager } from '../../../Framework/Scripts/Managers/SceneManager';
import { UIManager } from '../../../Framework/Scripts/Managers/UIManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { BundleName } from '../Constants';
const { ccclass, property } = _decorator;
@ccclass('UILoginUICtrl')
export class UILoginUICtrl extends UIComponent {
    private accountEditBox: EditBox = null!;
    private passwordEditBox: EditBox = null!;

    start() {
        this.accountEditBox = this.ViewComponent<EditBox>("LoginView/Content/EditField_Account/EditBox", EditBox);
        this.passwordEditBox = this.ViewComponent<EditBox>("LoginView/Content/EditField_Password/EditBox", EditBox);

        this.AddButtonListener("LoginView/Content/LoginBtn", this, this.OnClickLogin);
        this.AddButtonListener("LoginView/Content/RegisterBtn", this, this.OnClickRegist);
    }

    private async OnClickLogin() {
        console.log("OnClickLogin");
        console.log("account:", this.accountEditBox.string);
        console.log("password:", this.passwordEditBox.string);

        await SceneManager.Instance.IE_RunScene("Main");
        //await UIManager.Instance.IE_ShowUIView("UILoading",null,BundleName.GUI);
        UIManager.Instance.DestroyUIView("UILogin");
    }

    private async OnClickRegist() {
        console.log("OnClickRegist");
        console.log("account:", this.accountEditBox.string);
        console.log("password:", this.passwordEditBox.string);

        await SceneManager.Instance.IE_RunScene("Main");
        //await UIManager.Instance.IE_ShowUIView("UILoading",null,BundleName.GUI);
        UIManager.Instance.DestroyUIView("UILogin"); 
    }

    update(deltaTime: number) {
        
    }
}


