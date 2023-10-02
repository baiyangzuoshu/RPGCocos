import { MapType } from "./MapType";

export default class MapData {

    /**
     * 地图名称
     */
    public name:string = "";

    /**
     * 地图背景资源名
     */
    public bgName:string = "";

    /**
     * 地图类型
     */
    public type:MapType = MapType.angle45;

    /**
     * 地图宽
     */
    public mapWidth:number = 0;

    /**
     * 地图高
     */
    public mapHeight:number = 0;

    /**
     * 地图路点宽
     */
    public nodeWidth:number = 0;
    
    /**
     * 地图路点高
     */
    public nodeHeight:number = 0;

    /**
     * 地图路点数据
     */
    public roadDataArr:number[][] = [];

    /**
     * 地图上编辑的所有元素（npc，怪，传送门等）
     */
    public mapItems:any[] = [];

    /**
     * 对齐方式：0，左下角; 1,左上角
     */
    public alignment:number = 0; 

    /**
     * 偏移量X
     */
    public offsetX:number = 0;
    
    /**
     * 偏移量Y
     */
    public offsetY:number = 0;    


}
