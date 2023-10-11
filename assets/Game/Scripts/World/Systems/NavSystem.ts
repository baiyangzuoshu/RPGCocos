import { v3, Vec2, Vec3 } from 'cc';
import { NavComponent } from '../Components/NavComponent';
import { UnitComponent, UnitState } from '../Components/UnitComponent';
import { TransformComponent } from '../Components/TransformComponent';
import { BaseComponent } from '../Components/BaseComponent';
import RoadNode from '../../3rd/map/road/RoadNode';
import { EntityUtils } from '../EntityUtils';
import PathFindingAgent from '../../3rd/map/road/PathFindingAgent';

export class NavSystem {
    
    public static StartNavTouchAction(roadNodeArr: RoadNode[],
                        navComponent: NavComponent/*, 
                        unitComponent: UnitComponent,
                        baseComponent: BaseComponent*/): void {
                            
        navComponent.isWalking = true; // 我们System迭代就可以移动了
        navComponent.nextIndex = 0; // 你的位置是当前的位置，你要从第1个开始
        navComponent.roadNodeArr = roadNodeArr;
        navComponent.passedTime = navComponent.walkTime = 0;
        navComponent.joyStickDir = null;
        // unitComponent.state = UnitState.walk;
    }

    public static StartNavJoystickAction(dir: Vec2,
        navComponent: NavComponent, 
        unitComponent: UnitComponent, 
        baseComponent: BaseComponent): void {
            
        navComponent.isWalking = true; // 我们System迭代就可以移动了
        navComponent.nextIndex = 0; // 你的位置是当前的位置，你要从第1个开始
        navComponent.roadNodeArr = null;
        navComponent.passedTime = navComponent.walkTime = 0;
        navComponent.joyStickDir = dir;
        // unitComponent.state = UnitState.walk;
        
        navComponent.vx = unitComponent.moveSpeed * dir.x;
        navComponent.vy = unitComponent.moveSpeed * dir.y;

        var moveAngle:number = Math.atan2(dir.y, dir.x); // 【-180， 180】
        var dire:number = Math.round((-moveAngle + Math.PI) / (Math.PI / 4));
        var direction = dire > 5 ? dire-6 : dire+2;
        // var flag = (direction === unitComponent.direction)? true : false
        EntityUtils.SetEntityDirection(direction, unitComponent, baseComponent);
        EntityUtils.SetEntityState(UnitState.walk, unitComponent, baseComponent);
        // end
    }

    public static StopAction(navComponent: NavComponent): void {
        navComponent.isWalking = false;
        navComponent.roadNodeArr = null;
        navComponent.joyStickDir = null;
    }

    private static WalkToNext(navComponent: NavComponent, 
                       unitComponent: UnitComponent, 
                       transformComponent: TransformComponent, 
                       baseComponent: BaseComponent): boolean {

        var src = transformComponent.pos;
        var dst = v3(navComponent.roadNodeArr[navComponent.nextIndex].px, navComponent.roadNodeArr[navComponent.nextIndex].py, 0);
        var dir = v3();
        Vec3.subtract(dir, dst, src);

        var len = dir.length();
        if(len <= 0) {
            navComponent.passedTime = navComponent.walkTime = 0;
            return false;
        }

        navComponent.walkTime = len / unitComponent.moveSpeed;
        navComponent.passedTime = 0;

        navComponent.vx = unitComponent.moveSpeed * dir.x / len;
        navComponent.vy = unitComponent.moveSpeed * dir.y / len;

        // 计算出来我们的角色方向
        var moveAngle:number = Math.atan2(dir.y, dir.x); // 【-180， 180】
        var dire:number = Math.round((-moveAngle + Math.PI) / (Math.PI / 4));
        var direction = dire > 5 ? dire-6 : dire+2;
        // var flag = (direction === unitComponent.direction)? true : false
        EntityUtils.SetEntityDirection(direction, unitComponent, baseComponent);
        EntityUtils.SetEntityState(UnitState.walk, unitComponent, baseComponent);
        // end
        return true;
    }

    private static NavJoystickUpdate(dt: number, navComponent: NavComponent, 
        unitComponent: UnitComponent, 
        transformComponent: TransformComponent,
        baseComponent: BaseComponent) {
        
        
        var x = transformComponent.pos.x + (navComponent.vx * dt);
        var y = transformComponent.pos.y + (navComponent.vy * dt);
        
        var roadNode = PathFindingAgent.instance.getRoadNodeByPixel(x, y);
        if(!roadNode || roadNode.value === 1) { // 我们就不动
            return;
        }

        // 同步节点的位置, gameObject
        transformComponent.pos.x = x;
        transformComponent.pos.y = y;
        baseComponent.gameObject?.setPosition(transformComponent.pos);
        // end
    }

    private static NavTouchUpdate(dt: number, navComponent: NavComponent, 
        unitComponent: UnitComponent, 
        transformComponent: TransformComponent,
        baseComponent: BaseComponent) {
        
        // 寻路的update
        if(navComponent.passedTime >= navComponent.walkTime) { // 已经走到了，切换到下一个点
            navComponent.nextIndex ++;
            if(navComponent.nextIndex >= navComponent.roadNodeArr.length) {
                navComponent.isWalking = false;
                EntityUtils.SetEntityState(UnitState.idle, unitComponent, baseComponent);
                return;
            }

            if(!this.WalkToNext(navComponent, unitComponent, transformComponent, baseComponent)) {
                return;
            }
        }

        navComponent.passedTime += dt;
        if(navComponent.passedTime > navComponent.walkTime) {
            dt -= (navComponent.passedTime - navComponent.walkTime);
        }

        var pos = transformComponent.pos;
        pos.x += (navComponent.vx * dt);
        pos.y += (navComponent.vy * dt);

        // 同步节点的位置, gameObject
        baseComponent.gameObject?.setPosition(pos);
        // end
    }

    // 每一个entity我们迭代的时候只要这两个组件;
    // 解决跨组件拿数据的问题，这样的话，就可以让数据做到扁平化;
    // 算法与数据完全的分开;
    public static Update(dt: number, navComponent: NavComponent, 
           unitComponent: UnitComponent, 
           transformComponent: TransformComponent,
           baseComponent: BaseComponent) {
        
        /*if(navComponent.isWalking === false) { // 在进入system.Update之前，就已经处理了;
            return;
        }*/

        if(navComponent.joyStickDir !== null) { // 走的是摇杆的Update
            NavSystem.NavJoystickUpdate(dt, navComponent, unitComponent, transformComponent, baseComponent);
        } // end
        else {
            NavSystem.NavTouchUpdate(dt, navComponent, unitComponent, transformComponent, baseComponent);
        }
       
    }
}


