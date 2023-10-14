import { TextAsset } from "cc";
import { ExcelManager } from "../../Framework/Scripts/Managers/ExcelManager";
import { ResManager } from "../../Framework/Scripts/Managers/ResManager";
import { BundleName } from "./Constants";

export class GameDataManager {
    public static Instance = new GameDataManager();

    public charactorConfig = null;
    public monesterConfig = null;
    public npcConfig = null;
    public npc_dialogue = null;
    public skillConfig = null;

    public async Init() {
        // 到Excel表格里面加载配置文件
        await ResManager.Instance.IE_LoadBundleAndAllAssets(BundleName.Datas, TextAsset);
        ExcelManager.Instance.AddTable("charactor", (ResManager.Instance.TryGetAsset(BundleName.Datas, "charactor") as TextAsset).text);
        this.charactorConfig = ExcelManager.Instance.GetTable("charactor");
        ExcelManager.Instance.AddTable("monester", (ResManager.Instance.TryGetAsset(BundleName.Datas, "monester") as TextAsset).text);
        this.monesterConfig = ExcelManager.Instance.GetTable("monester");
        ExcelManager.Instance.AddTable("npc", (ResManager.Instance.TryGetAsset(BundleName.Datas, "npc") as TextAsset).text);
        this.npcConfig = ExcelManager.Instance.GetTable("npc");
        ExcelManager.Instance.AddTable("npc_dialogue", (ResManager.Instance.TryGetAsset(BundleName.Datas, "npc_dialogue") as TextAsset).text);
        this.npc_dialogue = ExcelManager.Instance.GetTable("npc_dialogue");
        ExcelManager.Instance.AddTable("skill", (ResManager.Instance.TryGetAsset(BundleName.Datas, "skill") as TextAsset).text);
        this.skillConfig = ExcelManager.Instance.GetTable("skill");
        // end

        // console.log(this.charactorConfig, this.monesterConfig, this.npcConfig, this.npc_dialogue, this.skillConfig);
    }

    private NpcTalkData = {
        1000: ["你好！"],
        2001: ["我是装备商，要买点什么装备吗？"],
        2002: ["往西边走，可以去长寿！"],
        3001: ["天上人间很好玩！，你快去体验一下吧！"],
        3002: ["我是楼主！你是谁？"],
        4001: ["私闯民宅，给我滚出去！"],
        5001: ["大爷，我们这里的姑娘只卖身不卖艺的！"],
        5002: ["我寂寞，我冷！"],
        5003: ["什么才一两，当我什么啊，最少也要给十两"],
        5004: ["大爷，不要这样，你再这样我可要叫了！"],
        5005: ["禽兽！"],
    }

    public GetNpcTalkData(talkId:number): Array<string> {
        if(this.NpcTalkData[talkId]) {
            return this.NpcTalkData[talkId];
        }

        return this.NpcTalkData[1000]; //如果id没有数据，就用默认数据
    }

    private GameAttackData = {
        90001: {attackR: 80, baseAttacValue: 20, IsAreaAttack: false, attackEffectName: "Prefabs/RoadSign"},
        90002: {attackR: 120, baseAttacValue: 40, IsAreaAttack: true, attackEffectName: "Prefabs/RoadSign"},
    }

    public GetAttackConfigData(attackId: number): any {
        if(this.GameAttackData[attackId]) {
            return this.GameAttackData[attackId];
        }
        
        this.GameAttackData[90001];
    }
}


