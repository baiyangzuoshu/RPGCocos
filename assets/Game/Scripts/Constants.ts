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
    UILoginSuccessReturn="UILoginSuccessReturn",
    UITouchNav="UITouchNav",
}

export enum GameEvent {
    NetServerRetEvent = "NetServerRetEvent",
}

// 网络服务端返回給我们用户的事件
export enum ServerReturnEvent {
    TouchNav = 1,
    TransterEvent = 2,
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
