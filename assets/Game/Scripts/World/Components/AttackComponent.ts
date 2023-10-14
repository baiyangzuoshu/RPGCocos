import { Node } from "cc";

export class AttackComponent {
    public totalTime: number = 0; // 攻击的持续时间, 是由我们的攻击属性决定 90001, ---> 获取
    public calcTime: number = 0; // 计算伤害的时间

    public attackId: number = 0; // 当前攻击的Id,用于伤害计算
    

    public attackTarget: any = null!; // 玩家，怪物 

    public effectNode: Node = null!;
} 


