
export class GameDataManager {
    public static Instance = new GameDataManager();

    public Init(): void {
        // 到Excel表格里面加载配置文件
        // end
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
}


