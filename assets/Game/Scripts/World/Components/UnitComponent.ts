/**
 * 单位状态
 */
 export enum UnitState
 {
     /**
      * 无
      */
     none = 0,
 
     /**
      * 待机
      */
     idle = 1,
 
     /**
      * 行走
      */
     walk = 2,
 
     /**
      * 攻击
      */
     attack = 3,
 
     /**
      * 死亡
      */
     death = 4,
 }
 
 export class UnitComponent  {
     public state: UnitState = UnitState.none;
     public moveSpeed:number = 200;
     public hp:number = 100;
     public mp:number = 100;
 
     /**
      * 设置单位方向
      * 
      * 方向值范围为 0-7，方向值设定如下，0是下，1是左下，2是左，3是左上，4是上，5是右上，6是右，7是右下
      * 
      *        4
      *      3   5
      *    2   *   6
      *      1   7
      *        0
      * 
      */
     public direction:number = 0;
 }
 
 
 