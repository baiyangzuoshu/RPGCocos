import { Component, Node, TextAsset, find, Prefab, NodePool } from 'cc';
import { PoolManager } from '../../Framework/Scripts/Managers/PoolManager';
import { ResManager } from '../../Framework/Scripts/Managers/ResManager';
import { UIManager } from '../../Framework/Scripts/Managers/UIManager';
import { GameDataManager } from '../GameDataManager';
import { BundleName, UIView } from './Constants';
import { GameController } from './GameController';


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
        GameDataManager.Instance.Init();
    }

    public async EnterGame() {
        console.log("EnterGame #######");
        // 注册一个我们的导航器,负责流程导航
        this.node.addComponent(GameController).Init();
        // end

        // 由其它开发者来接管整个游戏项目的代码编写;
        // SceneMgr.Instance.EnterScene("main"); // 如果你把场景当作是ab包的，那么加载不到;
        // await SceneMgr.Instance.IE_RunScene("Main");
        // end

        

        // 加载我们的登录的资源
        await ResManager.Instance.IE_GetAsset(BundleName.GUI, "UILogin", Prefab);
        // end 

        await PoolManager.Instance.AddNodePoolByPath(BundleName.Charactors, "Prefabs/RoadSign");
        // 删除掉启动画面
        var boot = find("Canvas/UIBoot");
        boot.destroy();
        // end

        UIManager.Instance.IE_ShowUIView("UILogin");
    }
    
}


