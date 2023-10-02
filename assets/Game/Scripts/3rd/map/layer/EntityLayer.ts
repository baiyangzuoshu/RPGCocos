// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Node,Component, _decorator } from "cc";

const { ccclass, property } = _decorator;

/**
 * 物体层
 */
 @ccclass('EntityLayer')
export default class EntityLayer extends Component {



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) 
    {
       this.sortZindex(); 
    }

    public clear()
    {
        
    }

    private sortZindex()
    {
        var allEntityNodes:Node[] = this.node.children.slice();

        allEntityNodes.sort((node1:Node,node2:Node):number=>
        {
            if(node1.position.y > node2.position.y)
            {
                return -1
            }else if(node1.position.y < node2.position.y)
            {
                return 1;
            }

            return 0;
        });

        var entiryCount:number = allEntityNodes.length;
        for(var i = 0 ; i < entiryCount; i++)
        {
            //allEntityNodes[i].zIndex = i;
            allEntityNodes[i].setSiblingIndex(i);
        }
    }
}
