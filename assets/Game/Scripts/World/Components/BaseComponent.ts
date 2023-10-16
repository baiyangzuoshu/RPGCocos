import { Node } from 'cc';
export enum EntityType {
    Invalid = -1,
    Transfer = 0, // 
    Player = 1,
    Monster = 2, // 200001, 200002
    NPC = 3,
}

export class BaseComponent  {
    public type: EntityType = EntityType.Invalid;
    public name:string = null; // 物体的名字;
    public entityID: number = 0; // 全局唯一 
    public subTypeID: number = 0; // 物体的类型ID, 用来区分物体的子类型
    public gameObject: Node = null; // entity所绑定的视图中节点;
}


