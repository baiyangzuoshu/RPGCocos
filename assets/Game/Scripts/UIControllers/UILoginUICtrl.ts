import { _decorator, Component, Node, EditBox } from 'cc';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { SceneManager } from '../../../Framework/Scripts/Managers/SceneManager';
import { UIManager } from '../../../Framework/Scripts/Managers/UIManager';
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { MapLoadModel } from '../3rd/map/base/MapLoadModel';
import { BundleName, UIEventName, UIView } from '../Constants';
import { GameController } from '../GameController';
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

        EventManager.Instance.Emit(UIEventName.UIEventHome, {mapId:"10001",enterSpawnId:0,mapLoadModel:MapLoadModel.single});
    }

    private async OnClickRegist() {
        console.log("OnClickRegist");
        console.log("account:", this.accountEditBox.string);
        console.log("password:", this.passwordEditBox.string);
        EventManager.Instance.Emit(UIEventName.UIEventHome, {mapId:"10001",enterSpawnId:0,mapLoadModel:MapLoadModel.single});
    }

    update(deltaTime: number) {
        
    }
}


