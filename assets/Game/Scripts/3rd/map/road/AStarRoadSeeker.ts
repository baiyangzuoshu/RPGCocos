import RoadNode from "./RoadNode";
import IRoadSeeker from "./IRoadSeeker";
import BinaryTreeNode from "./BinaryTreeNode";
import PathLog from "./PathLog";
import { PathOptimize } from "./PathOptimize";
import { PathQuadSeek } from "./PathQuadSeek";

/**
 * A*寻路算法 
 * @作者 落日故人 QQ 583051842
 * 
 */
export default class AStarRoadSeeker implements IRoadSeeker {

    /**
     * 横向移动一个格子的代价
     */		
    private COST_STRAIGHT:number = 10; 
    
    /**
     * 斜向移动一个格子的代价
     */		
    private COST_DIAGONAL:number = 14;
    
    /**
     *最大搜寻步骤数，超过这个值时表示找不到目标 
     */		
    private maxStep:number = 1000;
    
    /**
     * 开启列表
     */		
    private _openlist:Array<RoadNode>; 
    
    /**
     *关闭列表 
     */		
    private _closelist:Array<RoadNode>;

    /**
     * 二叉堆存储结构
     */
    private _binaryTreeNode:BinaryTreeNode = new BinaryTreeNode();
    
    /**
     *开始节点 
     */		
    private _startNode:RoadNode;
    
    /**
     *当前检索节点 
     */		
    private _currentNode:RoadNode;
    
    /**
     *目标节点 
     */		
    private _targetNode:RoadNode;
    
    /**
     *地图路点数据 
     */		
    private _roadNodes:{[key:number]:RoadNode};
    
    /**
     * 用于检索一个节点周围上下左右4个点的向量数组 
     */
    private _round1:number[][] = [[0,-1],[1,0],[0,1],[-1,0]]

    /**
     * 用于检索一个节点周围8个点的向量数组 
     */
    private _round2:number[][] = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]

    /**
     *用于检索一个节点周围n个点的向量数组，默认8方向
     */		
    private _round:number[][] = this._round2; 

    /**
     * 要检索的周围邻居格子方向向量，当要按角色占据的路点面积进行寻路时使用
     */
    private _neighbours:number[][] = null;

    /**
     * 存放检索周围邻居的方向向量的字典
     */
    private _neighboursDic:{[key:number]:number[][]} = {};
    
    private handle:number = -1;

    /**
     * 优化类型，默认使用最短路径的优化
     */
    private _pathOptimize:PathOptimize = PathOptimize.best;
    
    /**
     * 默认使用8方向寻路
     */
    private _pathQuadSeek:PathQuadSeek = PathQuadSeek.path_dire_8;

    /**
     * 定义一个路点是否能通过，如果是null，则用默认判断条件
     */
	private _isPassCallBack:Function = null;

    public constructor(roadNodes:{[key:string]:RoadNode})
    {
        this._roadNodes = roadNodes;
    }

    /**
     * 设置最大寻路步骤
     * @param maxStep 
     */
    public setMaxSeekStep(maxStep:number)
    {
        this.maxStep = maxStep;
    }

    /**
     * 设置路径优化等级
     * @param optimize 
     */
    public setPathOptimize(optimize:PathOptimize)
    {
        this._pathOptimize = optimize;
    }

    /**
     * 设置4方向路点的寻路类型
     * @param pathQuadSeek 
     */
    public setPathQuadSeek(pathQuadSeek:PathQuadSeek)
    {
        this._pathQuadSeek = pathQuadSeek;

        if(this._pathQuadSeek == PathQuadSeek.path_dire_4)
        {
            this._round = this._round1; //如果是4方向寻路，则只需初始化4方向的寻路向量数组
        }else
        {
            this._round = this._round2; //如果是8方向寻路，则只需初始化8方向的寻路向量数组
        }
    }

    /**
     * 定义一个路点是否能通过，如果参数是null，则用默认判断条件
     * @param callback 
     */
	public setRoadNodePassCondition(callback: Function) 
	{
		this._isPassCallBack = callback;
	}
    
    /**
     *寻路入口方法 
     * @param startNode
     * @param targetNode
     * @return 
     */		
    public seekPath(startNode:RoadNode, targetNode:RoadNode, radius:number):Array<RoadNode>
    {
        this._startNode = startNode;
        this._currentNode = startNode;
        this._targetNode = targetNode;

        this._neighbours = this.getNeighbours(radius);
        
        if(!this._startNode || !this._targetNode)
            return [];
        
        if(this._startNode == this._targetNode)
        {
            return [this._targetNode];
        }
        
        if(!this.isCanPass(this._targetNode))
        {
            PathLog.log("目标不可达到：");
            return [];
        }
        
        this._startNode.g = 0; //重置起始节点的g值
        this._startNode.resetTree(); //清除起始节点原有的二叉堆关联关系

        this._binaryTreeNode.refleshTag(); //刷新二叉堆tag，用于后面判断是不是属于当前次的寻路
        //this._binaryTreeNode.addTreeNode(this._startNode); //把起始节点设置为二叉堆结构的根节点
        
        var step:number = 0;
        
        while(true)
        {
            if(step > this.maxStep)
            {
                PathLog.log("没找到目标计算步骤为：",step);
                return [];
            }
            
            step++;
            
            this.searchRoundNodes(this._currentNode);
            
            if(this._binaryTreeNode.isTreeNull()) //二叉堆树里已经没有任何可搜寻的点了，则寻路结束，每找到目标
            {
                PathLog.log("没找到目标计算步骤为：",step);
                return [];
            }

            this._currentNode = this._binaryTreeNode.getMin_F_Node();

            if(this._currentNode == this._targetNode)
            {
                PathLog.log("找到目标计算步骤为：",step);
                return this.getPath();
            }else
            {
                this._binaryTreeNode.setRoadNodeInCloseList(this._currentNode);//打入关闭列表标记
            }
            
        }
        
        return [];
    }

    /**
     *寻路入口方法 如果没有寻到目标，则返回离目标最近的路径
    * @param startNode
    * @param targetNode
    * @return 
    * 
    */		
    public seekPath2(startNode:RoadNode, targetNode:RoadNode, radius:number = 0):Array<RoadNode>
    {
        this._startNode = startNode;
        this._currentNode = startNode;
        this._targetNode = targetNode;

        this._neighbours = this.getNeighbours(radius);
        
        if(!this._startNode || !this._targetNode)
            return [];
            
        if(this._startNode == this._targetNode)
        {
            return [this._targetNode];
        }

        var newMaxStep:number = this.maxStep;

        if(!this.isCanPass(this._targetNode))
        {
            //如果不能直达目标，最大寻路步骤 = 为两点间的预估距离的3倍
            newMaxStep = (Math.abs(this._targetNode.cx - this._startNode.cx) + Math.abs(this._targetNode.cy - this._startNode.cy)) * 3;
            if(newMaxStep > this.maxStep)
            {
                newMaxStep = this.maxStep;
            }
        }
        
        this._startNode.g = 0; //重置起始节点的g值
        this._startNode.resetTree(); //清除起始节点原有的二叉堆关联关系

        this._binaryTreeNode.refleshTag(); //刷新二叉堆tag，用于后面判断是不是属于当前次的寻路
        //this._binaryTreeNode.addTreeNode(this._startNode); //把起始节点设置为二叉堆结构的根节点
        
        var step:number = 0;
        
        var closestNode:RoadNode = null; //距离目标最近的路点

        while(true)
        {
            if(step > newMaxStep)
            {
                PathLog.log("没找到目标计算步骤为：",step);
                return this.seekPath(startNode,closestNode,radius);
            }
            
            step++;
            
            this.searchRoundNodes(this._currentNode);
            
            if(this._binaryTreeNode.isTreeNull()) //二叉堆树里已经没有任何可搜寻的点了，则寻路结束，没找到目标
            {
                PathLog.log("没找到目标计算步骤为：",step);
                return this.seekPath(startNode,closestNode,radius);
            }
            
            this._currentNode = this._binaryTreeNode.getMin_F_Node();


            if(closestNode == null)
            {
                closestNode = this._currentNode;
            }else
            {
                if(this._currentNode.h < closestNode.h)
                {
                    closestNode = this._currentNode;
                }
            }
            
            if(this._currentNode == this._targetNode)
            {
                PathLog.log("找到目标计算步骤为：",step);
                return this.getPath();
            }else
            {
                this._binaryTreeNode.setRoadNodeInCloseList(this._currentNode);//打入关闭列表标记
            }
            
        }
        
        return this.seekPath(startNode,closestNode,radius);
    }

    /**
     *获得最终寻路到的所有路点 
     * @return 
     */		
    private getPath():Array<RoadNode>
    {
        var nodeArr:Array<RoadNode> = [];
        
        var node:RoadNode = this._targetNode;
        
        while(node != this._startNode)
        {
            nodeArr.unshift(node);
            node = node.parent;
        }
        
        nodeArr.unshift(this._startNode);

        //如果不优化，则直接返回完整寻路路径
		if(this._pathOptimize == PathOptimize.none)
        {
            return nodeArr;
        }
        
        //第一阶段优化： 对横，竖，正斜进行优化
        //把多个节点连在一起的，横向或者斜向的一连串点，除两边的点保留
        for(var i:number = 1 ; i < nodeArr.length - 1 ; i++)
        {
            var preNode:RoadNode = nodeArr[i - 1] as RoadNode;
            var midNode:RoadNode = nodeArr[i] as RoadNode;
            var nextNode:RoadNode = nodeArr[i + 1] as RoadNode;
        
            var bool1:Boolean = midNode.cx == preNode.cx && midNode.cx == nextNode.cx;
            var bool2:Boolean = midNode.cy == preNode.cy && midNode.cy == nextNode.cy;
            var bool3:Boolean = false;

            if(this._pathQuadSeek == PathQuadSeek.path_dire_8) //寻路类型是8方向时才考虑正斜角路径优化
            {
                bool3 = ((midNode.cx - preNode.cx) / (midNode.cy - preNode.cy)) * ((nextNode.cx - midNode.cx) / (nextNode.cy - midNode.cy)) == 1
            }
            
            if(bool1 || bool2 || bool3)
            {
                nodeArr.splice(i,1)
                i--;
            }
        }

        //如果寻路类型是4方向寻路，则直接返回第一阶段的优化结果。
        //（因为4方向寻路是用不到第二阶段优化的，否则进入第二阶段优化的话，路径就不按上下左右相连了，这并不是4方寻路想要的结果）
        if(this._pathQuadSeek == PathQuadSeek.path_dire_4) 
        {
            return nodeArr;
        }
        
        //如果只需要优化到第一阶段，则直接返回第一阶段的优化结果
		if(this._pathOptimize == PathOptimize.better)
        {
            return nodeArr;
        }

        //第二阶段优化：对不在横，竖，正斜的格子进行优化
        for(var i:number = 0 ; i < nodeArr.length - 2 ; i++)
        {
            var startNode:RoadNode = nodeArr[i] as RoadNode;
            var optimizeNode:RoadNode = null;

            //优先从尾部对比，如果能直达就把中间多余的路点删掉
            for(var j:number = nodeArr.length - 1 ; j > i + 1 ; j--)
            {
                var targetNode:RoadNode = nodeArr[j] as RoadNode;

                //在第一阶段优已经优化过横，竖，正斜了，所以再出现是肯定不能优化的，可以忽略
                if(startNode.cx == targetNode.cx || startNode.cy == targetNode.cy || Math.abs(targetNode.cx - startNode.cx) == Math.abs(targetNode.cy - startNode.cy))
                {
                    continue;
                }

                if(this.isArriveBetweenTwoNodes(startNode,targetNode))
                {
                    optimizeNode = targetNode;
                    break;
                }

            }

            if(optimizeNode)
            {
                var optimizeLen:number = j - i - 1;
                nodeArr.splice(i + 1,optimizeLen);
            }
        
        }

        return nodeArr;
    }
    
    /**
     * 两点之间是否可到达
     */
    public isArriveBetweenTwoNodes(startNode:RoadNode, targetNode:RoadNode):boolean
    {
        if(startNode == targetNode)
        {
            return false;
        }

        var disX:number = Math.abs(targetNode.cx - startNode.cx);
        var disY:number = Math.abs(targetNode.cy - startNode.cy);

        var dirX = 0;

        if(targetNode.cx > startNode.cx)
        {
            dirX = 1;
        }else if(targetNode.cx < startNode.cx)
        {
            dirX = -1;
        }

        var dirY = 0;

        if(targetNode.cy > startNode.cy)
        {
            dirY = 1;
        }else if(targetNode.cy < startNode.cy)
        {
            dirY = -1;
        }

        var rx:number = 0;
        var ry:number = 0;
        var intNum:number = 0;
        var decimal:number = 0;

        if(disX > disY)
        {
            var rate:number = disY / disX;

            for(var i = 0 ; i < disX ; i++)
            {
                ry = startNode.cy + i * dirY * rate;
                intNum = Math.floor(ry);
                decimal = ry % 1;

                var cx1:number = startNode.cx + i * dirX;
                var cy1:number = decimal <= 0.5 ? intNum : intNum + 1;

                ry = startNode.cy + (i + 1) * dirY * rate;
                intNum = Math.floor(ry);
                decimal = ry % 1;

                var cx2:number = startNode.cx + (i + 1) * dirX;
                var cy2:number = decimal <= 0.5 ? intNum : intNum + 1;

                var node1:RoadNode = this.getRoadNode(cx1,cy1);
                var node2:RoadNode = this.getRoadNode(cx2,cy2);

                //cc.log(i + "  :: " + node1.cy," yy ",startNode.cy + i * rate,ry % 1);

                if(!this.isCrossAtAdjacentNodes(node1,node2))
                {
                    return false;
                }
            }

        }else
        {
            var rate:number = disX / disY;

            for(var i = 0 ; i < disY ; i++)
            {
                rx = i * dirX * rate;
                intNum = dirX > 0 ? Math.floor(startNode.cx + rx) : Math.ceil(startNode.cx + rx);
                decimal = Math.abs(rx % 1);

                var cx1:number = decimal <= 0.5 ? intNum : intNum + 1 * dirX;
                var cy1:number = startNode.cy + i * dirY;
                
                rx = (i + 1) * dirX * rate;
                intNum = dirX > 0 ? Math.floor(startNode.cx + rx) : Math.ceil(startNode.cx + rx);
                decimal = Math.abs(rx % 1);

                var cx2:number = decimal <= 0.5 ? intNum : intNum + 1 * dirX;
                var cy2:number = startNode.cy + (i + 1) * dirY;

                var node1:RoadNode = this.getRoadNode(cx1,cy1);
                var node2:RoadNode = this.getRoadNode(cx2,cy2);

                if(!this.isCrossAtAdjacentNodes(node1,node2))
                {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 判断两个相邻的点是否可通过
     * @param node1 
     * @param node2 
     */
    public isCrossAtAdjacentNodes(node1:RoadNode, node2:RoadNode):boolean
    {
        if(node1 == node2)
        {
            return false;
        }

        //两个点只要有一个点不能通过就不能通过
        if(!this.isPassNode(node1) || !this.isPassNode(node2))
        {
            return false;
        }

        //按寻路面积检测两个点只要有一个点不能通过就不能通过
        if(!this.isCanPass(node1) || !this.isCanPass(node2))
        {
            return false;
        }

        var dirX = node2.cx - node1.cx;
        var dirY = node2.cy - node1.cy

        //如果不是相邻的两个点 则不能通过
        if(Math.abs(dirX) > 1 || Math.abs(dirY) > 1)
        {
            return false;
        }

        //如果相邻的点是在同一行，或者同一列，则判定为可通过
        if((node1.cx == node2.cx) || (node1.cy == node2.cy))
        {
            return true;
        }

        //只剩对角情况了
        if(
            this.isPassNode(this.getRoadNode(node1.cx,node1.cy + dirY)) &&
            this.isPassNode(this.getRoadNode((node1.cx + dirX),node1.cy))
        )
        {
            return true;
        }

        return false;
    }

    /**
     * 是否是可通过的点 
     * @param node 
     */
    public isPassNode(node:RoadNode):boolean
    {
        if(this._isPassCallBack != null)
		{
            //如果设置有自定义条件，则使用自定义判断条件
			return this._isPassCallBack(node);
		}

        if(node == null || node.value == 1)
        {
            return false;
        }

        return true;
    }

    /**
     * 是否能通过这个节点
     * @param node 
     * @returns 
     */
    public isCanPass(node:RoadNode)
    {
        if(!this.isPassNode(node)) //如果当前路点不能通过就不是可通过的点
        {
            return false;
        }

        //------------------------以下逻辑是检测这个点周围的邻居路点是否可通过----------------------------------

        if(this._neighbours == null || this._neighbours.length == 0) //证明寻路的角色没占据其周围的路点，只有自身脚下的单个路点。直接可过
        {
            return true;
        }

        for(var i:number = 0 ; i < this._neighbours.length ; i++)
        {
            var cx:number = node.cx + this._neighbours[i][0];
            var cy:number = node.cy + this._neighbours[i][1];
            var node2:RoadNode = this.getRoadNode(cx,cy);

            if(!this.isPassNode(node2))
            {
                return false;
            }
        }

        return true;
    }

    /**
	 * 根据世界坐标获得路节点
	 * @param cx 
	 * @param cy 
	 * @returns 
	 */
	public getRoadNode(cx:number, cy:number):RoadNode
    {
        var key:string = cx + "_" + cy;
        return this._roadNodes[key];
    }

    /**
     * 根据半径获当前位置周围的所有邻居方向向量
     * @param radius 
     * @returns 
     */
    public getNeighbours(radius:number):number[][]
    {
        if(radius == 0)
        {
            return null;
        }

        var neighbours:number[][] = null;

        if(this._neighboursDic[radius] != null)
        {
            neighbours = this._neighboursDic[radius];

        }else
        {
            neighbours = [];

            for(var i = - radius; i <= radius ; i++)
            {
                for(var j = -radius; j <= radius ; j++)
                {
                    if(j == 0 && i == 0)
                    {
                        continue;
                    }

                    if( Math.abs(j) + Math.abs(i) > radius)
                    {
                        continue;
                    }

                    neighbours.push([j,i]);
                }
            }

            this._neighboursDic[radius] = neighbours;
        }

        return neighbours;
    }

    /**
     *测试寻路步骤 
     * @param startNode
     * @param targetNode
     * @return 
     */		
    public testSeekPathStep(startNode:RoadNode, targetNode:RoadNode, radius:number, callback:Function, target:any, time:number = 100):void
    {
        this._startNode = startNode;
        this._currentNode = startNode;
        this._targetNode = targetNode;

        this._neighbours = this.getNeighbours(radius);
        
        if(!this.isCanPass(this._targetNode))
            return;
        
        this._startNode.g = 0; //重置起始节点的g值
        this._startNode.resetTree(); //清除起始节点原有的二叉堆关联关系

        this._binaryTreeNode.refleshTag(); //刷新二叉堆tag，用于后面判断是不是属于当前次的寻路
        //this._binaryTreeNode.addTreeNode(this._startNode); //把起始节点设置为二叉堆结构的根节点
        
        this._closelist = [];

        var step:number = 0;
        
        clearInterval(this.handle);
        this.handle = setInterval(()=>
        {
            if(step > this.maxStep)
            {
                PathLog.log("没找到目标计算步骤为：",step);
                clearInterval(this.handle);
                return;
            }
            
            step++;
            
            this.searchRoundNodes(this._currentNode);

            if(this._binaryTreeNode.isTreeNull()) //二叉堆树里已经没有任何可搜寻的点了，则寻路结束，每找到目标
            {
                PathLog.log("没找到目标计算步骤为：",step);
                clearInterval(this.handle);
                return;
            }

            this._currentNode = this._binaryTreeNode.getMin_F_Node();
            
            if(this._currentNode == this._targetNode)
            {
                PathLog.log("找到目标计算步骤为：",step);
                clearInterval(this.handle);

                this._openlist = this._binaryTreeNode.getOpenList();
                callback.apply(target,[this._startNode,this._targetNode,this._currentNode,this._openlist,this._closelist,this.getPath()]);
            }else
            {
                this._binaryTreeNode.setRoadNodeInCloseList(this._currentNode);//打入关闭列表标记
                this._openlist = this._binaryTreeNode.getOpenList();
                this._closelist.push(this._currentNode);
                callback.apply(target,[this._startNode,this._targetNode,this._currentNode,this._openlist,this._closelist,null]);
            }

        },time);
        
    }
    
    /**
     *查找一个节点周围可通过的点 
     * @param node
     * @return 
     */		
    private searchRoundNodes(node:RoadNode):void
    {
        for(var i:number = 0 ; i < this._round.length ; i++)
        {
            var cx:number = node.cx + this._round[i][0];
            var cy:number = node.cy + this._round[i][1];
            var node2:RoadNode = this.getRoadNode(cx,cy);

            if(this.isPassNode(node2) && this.isCanPass(node2) && node2 != this._startNode && !this.isInCloseList(node2) && !this.inInCorner(node2))
            {
                this.setNodeF(node2);
            }
        }
    }
    
    /**
     *设置节点的F值 
     * @param node
     */		
    public setNodeF(node:RoadNode):void
    {	
        var g:number;
        
        if(node.cx == this._currentNode.cx || node.cy == this._currentNode.cy)
        {
            g = this._currentNode.g + this.COST_STRAIGHT;
        }else
        {
            g = this._currentNode.g + this.COST_DIAGONAL;
        }
        
        if(this.isInOpenList(node))
        {
            if(g < node.g)
            {
                node.g = g;

                node.parent = this._currentNode;
                node.h = (Math.abs(this._targetNode.cx - node.cx) + Math.abs(this._targetNode.cy - node.cy)) * this.COST_STRAIGHT;
                node.f = node.g + node.h;

                //节点的g值已经改变，把节点先从二堆叉树结构中删除，再重新添加进二堆叉树
                this._binaryTreeNode.removeTreeNode(node); 
                this._binaryTreeNode.addTreeNode(node);
            }
        }else
        {
            node.g = g;

            this._binaryTreeNode.setRoadNodeInOpenList(node);//给节点打入开放列表的标志
            node.resetTree();

            node.parent = this._currentNode;
            node.h = (Math.abs(this._targetNode.cx - node.cx) + Math.abs(this._targetNode.cy - node.cy)) * this.COST_STRAIGHT;
            node.f = node.g + node.h;

            this._binaryTreeNode.addTreeNode(node);
        }
    }
    
    /**
     *节点是否在开启列表 
     * @param node
     * @return 
     */		
    private isInOpenList(node:RoadNode):Boolean
    {
        return this._binaryTreeNode.isInOpenList(node);
    }
    
    /**
     * 节点是否在关闭列表 
     * @param node 
     * @returns 
     */		
    private  isInCloseList(node:RoadNode):Boolean
    {
        return this._binaryTreeNode.isInCloseList(node);
    }
    
    /**
     *节点是否在拐角处 
     * @return 
     */		
    private inInCorner(node:RoadNode):Boolean
    {
        if(this._pathQuadSeek == PathQuadSeek.path_dire_4)
        {
            //如果是4方向寻路类型，则不可能有拐角，所以直接返回false;
            return false;
        }

        if(node.cx == this._currentNode.cx || node.cy == this._currentNode.cy)
        {
            return false;
        }
        
        var node1:RoadNode = this.getRoadNode(this._currentNode.cx,node.cy);
        var node2:RoadNode = this.getRoadNode(node.cx,this._currentNode.cy);
        
        if(this.isPassNode(node1) && this.isPassNode(node2))
        {
            return false;
        }
        
        return true;
    }
    
    /**
	 * 释放资源
	 */
    public dispose():void
    {
        this._roadNodes = null;
        this._round = null;
    }
}
