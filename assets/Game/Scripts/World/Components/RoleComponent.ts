/**
 * 玩家类型
 * 
 * 多人在线游戏时，用于区分玩家是谁的
 */
export enum PlayerType
{
    /**
     * 无人认领
     */
    none = 0,

    /**
     * 属于玩家自己
     */
    my = 1,

    /**
     * 属于其他玩家
     */
    other = 1,

}

/**
 * 玩家控制的方式
 */
export enum PlayerControlType
{
    /**
     * 无控制
     */
    none = 0,

    /**
     * 用户控制
     */
    user = 1,

    /**
     * ai控制
     */
    ai = 2,

    /**
     * 网络玩家控制
     */
    net = 3,
}

/**
 * 控制模式
 */
export enum ControlMode
{
    /**
     * 点击行走
     */
    touch = 0,

    /**
     * 摇杆操作
     */
    joystick = 1,
}

export class RoleComponent {
    public roleId: number = -1;
    public playerType: PlayerType = PlayerType.none;
    public controlType: PlayerControlType = PlayerControlType.none;
    public controlMode: ControlMode = ControlMode.touch;

    
}


