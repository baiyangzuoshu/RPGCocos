
export enum InteractiveState {
    closed = 0, // 交互结束
    opened = 1,
    Talking = 2, // 正在对话
    ProcessingFunc = 3, // 正在处理功能;
    ClaimTask = 4, // 领取任务
    // ...
}

export class NPCInteractiveComponent {
    public interactiveState: InteractiveState = InteractiveState.closed;
    public curId: number = 0;

    public actionSeq: Array<InteractiveState> = new Array<InteractiveState>;
    public actionId: Array<number> = new Array<number>();

    public stepIndex: number = -1; // 当前交互到哪里的索引;


    public sayStatement: Array<string> = null; // 
    public sayIndex: number = 0;
    public timeIenterval: number = 0; // 打印字的时间间隔
    public charLen: number = 0; // 当前打印到字符的数目

    public isCanInteractive: boolean = true; //是否可以交互
}


