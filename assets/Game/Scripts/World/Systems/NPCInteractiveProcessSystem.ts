import { Label } from "cc";
import { InteractiveState, NPCInteractiveComponent } from "../Components/NPCInteractiveComponent";
import { UnitState } from "../Components/UnitComponent";
import { NPCEntity } from "../Entities/NPCEntity";
import { EntityUtils } from "../EntityUtils";
import { BaseComponent } from "../Components/BaseComponent";
import { PatrolAIComponent } from "../Components/PatrolAIComponent";
import { UIGameEvent } from "../../Constants";
import { EventManager } from "../../../../Framework/Scripts/Managers/EventManager";

export class NPCInteractiveProcessSystem {

    private static OnGotoNextState(npcInteractiveComponent: NPCInteractiveComponent, patrolAIComponent: PatrolAIComponent, baseComponent: BaseComponent): void {
        npcInteractiveComponent.stepIndex ++;

        baseComponent.gameObject.getChildByName("TalkBoard").active = false;
        
        if(npcInteractiveComponent.stepIndex >= npcInteractiveComponent.actionSeq.length) {
            npcInteractiveComponent.interactiveState = InteractiveState.closed;
            npcInteractiveComponent.stepIndex = -1;

            if(patrolAIComponent) {
                patrolAIComponent.isStopPatrol = true; // 下个定时器;
            }

            return;            
        }

       
        
        var curState = npcInteractiveComponent.actionSeq[npcInteractiveComponent.stepIndex];
        var curId = npcInteractiveComponent.actionId[npcInteractiveComponent.stepIndex];
        npcInteractiveComponent.interactiveState = curState;
        npcInteractiveComponent.curId = curId;

        npcInteractiveComponent.sayIndex = 0;
        npcInteractiveComponent.charLen = 0;
        npcInteractiveComponent.timeIenterval = 0;
        // end
    }

    private static ProcessOpendState(npcEntity: NPCEntity): void {
        // open 初始时候的处理
        if(npcEntity.patrolAIComponent) {
            npcEntity.patrolAIComponent.isStopPatrol = true;
            EntityUtils.SetEntityState(UnitState.idle, npcEntity.unitComponent, npcEntity.baseComponent);
        } 

        
        NPCInteractiveProcessSystem.OnGotoNextState(npcEntity.npcInteractiveComponent, npcEntity.patrolAIComponent, npcEntity.baseComponent);

        return;
        // end
    }

    // 对话打字
    private static ProcessTalkingState(dt: number, baseComponent: BaseComponent, 
                                       npcInteractiveComponent: NPCInteractiveComponent,
                                       patrolAIComponent: PatrolAIComponent): void {

        var label = baseComponent.gameObject.getChildByPath("TalkBoard/Board/Label").getComponent(Label);
        baseComponent.gameObject.getChildByName("TalkBoard").active = true;

        npcInteractiveComponent.timeIenterval -= dt;
        if(npcInteractiveComponent.timeIenterval <= 0) {
            npcInteractiveComponent.charLen ++;
            var talkStr = npcInteractiveComponent.sayStatement[npcInteractiveComponent.sayIndex];
            if(!talkStr || talkStr.length <= 0) {
                npcInteractiveComponent.sayIndex ++; // 跳到下一句
                npcInteractiveComponent.timeIenterval = 0;
                if(npcInteractiveComponent.sayIndex >= npcInteractiveComponent.sayStatement.length) {
                    NPCInteractiveProcessSystem.OnGotoNextState(npcInteractiveComponent, patrolAIComponent, baseComponent);
                }
            }
            else if (npcInteractiveComponent.charLen > talkStr.length) {
                if(npcInteractiveComponent.charLen === talkStr.length + 1) {
                    npcInteractiveComponent.timeIenterval = 1.5;
                    return;
                }
                else  {
                    npcInteractiveComponent.sayIndex ++; // 跳到下一句
                    npcInteractiveComponent.timeIenterval = 0;
                    npcInteractiveComponent.charLen = 0;

                    if(npcInteractiveComponent.sayIndex >= npcInteractiveComponent.sayStatement.length) {
                        NPCInteractiveProcessSystem.OnGotoNextState(npcInteractiveComponent, patrolAIComponent, baseComponent);
                    }
                }
            }
            else { // 改变一下内容；
                npcInteractiveComponent.timeIenterval = 0.065;
                var str:string = talkStr.substring(0, npcInteractiveComponent.charLen);
                label.string = str;
            }

        }
    }
    // end

    private static ProcessFuncState(dt: number, baseComponent: BaseComponent, 
                                    npcInteractiveComponent: NPCInteractiveComponent,
                                    patrolAIComponent: PatrolAIComponent): void {
        
        switch(npcInteractiveComponent.curId) {
            case 1: // 购买装备,开启装备商店;
                console.log(npcInteractiveComponent.curId);
                EventManager.Instance.Emit(UIGameEvent.UIOpenEquipShop, null);
            break;
        }

        NPCInteractiveProcessSystem.OnGotoNextState(npcInteractiveComponent, patrolAIComponent, baseComponent);

    }

    public static Update(dt: number, npcEntity: NPCEntity): void {
        // open 初始时候的处理
        if(npcEntity.npcInteractiveComponent.interactiveState === InteractiveState.opened) {
           this.ProcessOpendState(npcEntity);
           return;
        }
        // end

        if(npcEntity.npcInteractiveComponent.interactiveState === InteractiveState.Talking) {
            this.ProcessTalkingState(dt, npcEntity.baseComponent, npcEntity.npcInteractiveComponent, npcEntity.patrolAIComponent);
            return;
        }

        if(npcEntity.npcInteractiveComponent.interactiveState === InteractiveState.ProcessingFunc) {
            console.log("InteractiveState.ProcessingFunc", typeof(npcEntity.npcInteractiveComponent.curId));
            this.ProcessFuncState(dt, npcEntity.baseComponent, npcEntity.npcInteractiveComponent, npcEntity.patrolAIComponent);
            return;
        }
        // 默认处理
        NPCInteractiveProcessSystem.OnGotoNextState(npcEntity.npcInteractiveComponent, npcEntity.patrolAIComponent, npcEntity.baseComponent);
    }

}


