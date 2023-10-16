import { Vec2 } from "cc";
import RoadNode from "../../3rd/map/road/RoadNode";

export class NavComponent {
    roadNodeArr: RoadNode[] = null; // 寻路导航时候的路径
    nextIndex: number = 0; // 走向下一个点的索引;
    isWalking: boolean = false; // 表示这个entity是否在移动中;
    vx: number = 0; // vx方向上的速度;
    vy: number = 0; // vy 方向上的速度;
    walkTime: number = 0; // 行走的时间你要走多久;
    passedTime: number = 0; // 行走的过去的时间
    joyStickDir: Vec2 = null; // 为 null;
}


