import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { NavComponent } from '../Components/NavComponent';
import { UnitComponent, UnitState } from '../Components/UnitComponent';
import { TransformComponent } from '../Components/TransformComponent';
import { BaseComponent } from '../Components/BaseComponent';
import RoadNode from '../../3rd/map/road/RoadNode';
const { ccclass, property } = _decorator;

@ccclass('NavSystem')
export class NavSystem {

    private static _instance: NavSystem = null;
    public static get Instance(): NavSystem {
        if(this._instance === null) {
            this._instance = new NavSystem();
        }

        return this._instance;
    }

    public StartEntityAction(roadNodeArr:RoadNode[],
                        navComponent: NavComponent, 
                        unitComponent: UnitComponent): void {
                            
        navComponent.isWalking = true; // 我们System迭代就可以移动了
        navComponent.nextIndex = 0; // 你的位置是当前的位置，你要从第1个开始
        navComponent.roadNodeArr = roadNodeArr;
        navComponent.passedTime = navComponent.walkTime = 0;
        unitComponent.state = UnitState.walk;
    }

    public StopEntityAction(navComponent: NavComponent): void {
        navComponent.isWalking = false;
    }

    private WalkToNext(navComponent: NavComponent, 
                       unitComponent: UnitComponent, 
                       transformComponent: TransformComponent): boolean {

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

        return true;
    }

    // 每一个entity我们迭代的时候只要这两个组件;
    // 解决跨组件拿数据的问题，这样的话，就可以让数据做到扁平化;
    // 算法与数据完全的分开;
    Update(dt: number, navComponent: NavComponent, 
           unitComponent: UnitComponent, 
           transformComponent: TransformComponent,
           baseComponent: BaseComponent) {
        
        /*if(navComponent.isWalking === false) { // 在进入system.Update之前，就已经处理了;
            return;
        }*/

        if(navComponent.passedTime >= navComponent.walkTime) { // 已经走到了，切换到下一个点
            navComponent.nextIndex ++;
            if(navComponent.nextIndex >= navComponent.roadNodeArr.length) {
                navComponent.isWalking = false;
                unitComponent.state = UnitState.idle;
                return;
            }

            if(!this.WalkToNext(navComponent, unitComponent, transformComponent)) {
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
        baseComponent.gameObject.setPosition(pos);
        // end
    }
}


