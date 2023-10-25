import { Component, Node, Prefab, TextAsset, UI, find } from 'cc';
import { PoolManager } from '../../Framework/Scripts/Managers/PoolManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import { UIManager } from '../../Framework/Scripts/Managers/UIManager';
import { BundleName, UIView } from './Constants';
import { GameController } from './GameController';
import { GameDataManager } from './GameDataManager';

export class GameApp extends Component {
    public static Instance: GameApp = null;

    protected onLoad(): void {
        if(GameApp.Instance !== null) {
            this.destroy();
            return;
        }

        GameApp.Instance = this;
    }

    public Init(): void {
        
    }

    public async enterGame() {
        await GameDataManager.Instance.Init();

        this.node.addComponent(GameController).Init();

        await ResManager.Instance.IE_GetAsset(BundleName.GUI, UIView.UILogin, Prefab);

        await PoolManager.Instance.AddNodePoolByPath(BundleName.Charactors, "Prefabs/RoadSign");
        
        var boot = find("Canvas/UIBoot");
        boot.destroy();

        UIManager.Instance.IE_ShowUIView(UIView.UILogin);
    }
    
}


