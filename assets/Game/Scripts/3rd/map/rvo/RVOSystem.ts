// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Node, Component, _decorator, game, director } from "cc";
import { Simulator } from "./Simulator";

const { ccclass, property } = _decorator;

@ccclass('RVOSystem')
export default class RVOSystem extends Component {

    private static _instance: RVOSystem;
    public static get instance(): RVOSystem {
        if(this._instance == null)
        {
            var node:Node = new Node("RVOSystem");
            director.addPersistRootNode(node);
            this._instance = node.addComponent(RVOSystem);
            this._instance.init();
        }
        return this._instance;
    }

    /**
     * rvo运行标记
     */
    public rvoTag:number = 0;

    private init()
    {

    }

    /**
     * rvo系统运作状态
     */
    public runing: boolean = false;


    /**
     * 启动RVO系统
     */
     public startup()
    {
        console.log("RVOSystem 启动RVO系统");
        this.runing = true;
    }

    /**
     * 停止RVO系统
     */
    public stop()
    {
        console.log("RVOSystem 停止RVO系统");
        this.runing = false;
    }

    /**
     * 刷新RVO系统
     */
    public refresh()
    {
        this.rvoTag ++;
        Simulator.instance.clear();
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) 
    {
        if(this.runing)
        {
            Simulator.instance.run(dt);
        }
    }
}
