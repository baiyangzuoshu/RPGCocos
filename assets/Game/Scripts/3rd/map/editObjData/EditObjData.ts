/**
 * 地图编辑物体对象的数据结构 （基类）
 */
export default class EditObjData  {

    /**
     * 物体Id
     */
    public objId:string = "";

    /**
     * 物体名称
     */
    public objName:string = "";

    /**
     * 物体类型
     */
    public objType:string = "";

    /**
     * 物体皮肤
     */
    public skin:string = "";

    /**
     * x坐标
     */
    public x:number = 0;

    /**
     * y坐标
     */
    public y:number = 0;

    /**
     * 世界坐标x轴
     */
    public cx:number = 0;

    /**
     * 世界坐标y轴
     */
    public cy:number = 0;

    /**
     * 自定义参数
     */
    public params:string = "";
    
}

/**
 * 编辑npc的数据
 */
export class EditNpcData extends EditObjData
{
    /**
     * 角色方向,值为 0-7
     */
    public direction:number = 0;

    /**
     * 是否巡逻
     */
    public isPatrol:boolean = false;

    /**
     * 对话id
     */
    public dialogueId:number = 0;

    /**
     * 任务id
     */
    public taskId:number = 0;

    /**
     * 功能id
     */
    public funcId:number = 0;

    /**
     * npc类型
     */
    public npcType:number = 0;
}

/**
 * 编辑怪物的数据
 */
export class EditMonsterData extends EditObjData
{
    /**
     * 角色方向,值为 0-7
     */
    public direction:number = 0;

    /**
     * 是否巡逻
     */
    public isPatrol:boolean = false;

    /**
     * 对话id
     */
    public dialogueId:number = 0;

    /**
     * 战斗id
     */
    public fightId:number = 0;

    /**
     * 怪物类型
     */
    public monsterType:number = 0;
}

/**
 * 编辑传送门的数据
 */
export class EditTransferData extends EditObjData
{
    /**
     * 传送到目标地图Id
     */
    public targetMapId:string = "";

    /**
     * 目标地图的出生点Id
     */
    public targetMapSpawnId:number = 0;

    /**
     * 传送门类型
     */
    public transferType:number = 0;
}

/**
 * 编辑出生点的位置
 */
export class EditSpawnPointData extends EditObjData
{
    /**
     * 出生点Id
     */
    public spawnId:number = 0;

    /**
     * 是否是默认出生点
     */
    public defaultSpawn:boolean = false;
}
