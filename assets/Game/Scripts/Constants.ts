export enum BundleName {
    GUI="GUI",
    MapData="MapData",
    MapBg="MapBg",
    Map="Map",
    Charactors="Charactors"
}

export enum UIView {
    UILoading="UILoading",
    UILogin="UILogin",
    UIGame="UIGame",
} 

export enum UIGameEvent {
    UITouchNav = "UITouchNav",
    UIChangeMap = "UIChangeMap",
    UISwitchRole = "UISwitchRole",
    UILoginOut = "UILoginOut",
    UILoginIn = "UILoginIn",
    UIJoystick = "UIJoystick",
    UIOpenEquipShop = "UIOpenEquipShop",
}

export enum GameEvent {
    NetServerRetEvent = "NetServerRetEvent",
}

// 网络服务端返回給我们用户的事件
export enum ServerReturnEvent {
    TouchNav = 1, // 导航事件
    TransterEvent = 2, // 传送带事件
    ChangeMap = 3, // 切换地图
    SwitchRole = 4, // 切换角色
    LoginInRet = 5, // 登入游戏
    LoginOutRet = 6, // 登出游戏
    JoystickEvent = 7, // 摇杆事件
}

export enum EntityName {
    NPC="npc",
    Monster="monster",
    Transfer="transfer",
    SpawnPoint="spawnPoint",
    Player="Player",

}

export enum MapItemType {   
    spawnPoint="spawnPoint",
    npc="npc",
    monster="monster",
    transfer="transfer",
}
