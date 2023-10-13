import { Label } from "cc";
import { UnitState } from "../Components/UnitComponent";
import { NPCEntity } from "../Entities/NPCEntity";
import { EntityUtils } from "../EntityUtils";
import { BaseComponent } from "../Components/BaseComponent";
import { PatrolAIComponent } from "../Components/PatrolAIComponent";
import { InteractiveState, NPCInteractiveComponent } from "../Components/NPCInteractiveComponent";

export class NPCInteractiveProcessSystem {

    private static OnGotoNextState(npcInteractiveComponent: NPCInteractiveComponent, patrolAIComponent: PatrolAIComponent, baseComponent: BaseComponent): void {
        npcInteractiveComponent.stepIndex ++;


        if(npcInteractiveComponent.stepIndex >= npcInteractiveComponent.actionSeq.length) {
            npcInteractiveComponent.interactiveState = InteractiveState.closed;
            npcInteractiveComponent.stepIndex = -1;

            if(patrolAIComponent) {
                patrolAIComponent.isStopPatrol = true; // 下个定时器;
            }

            return;            
        }

        // 
        baseComponent.gameObject.getChildByName("TalkBoard").active = false;
        
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
            if(!talkStr || talkStr.length <= 0 || npcInteractiveComponent.charLen > talkStr.length) {
                npcInteractiveComponent.sayIndex ++; // 跳到下一句
                npcInteractiveComponent.timeIenterval = 0.25;
                if(npcInteractiveComponent.sayIndex >= npcInteractiveComponent.sayStatement.length) {
                    NPCInteractiveProcessSystem.OnGotoNextState(npcInteractiveComponent, patrolAIComponent, baseComponent);
                }
            }
            else { // 改变一下内容；
                npcInteractiveComponent.timeIenterval = 0.25;
                var str:string = talkStr.substring(0, npcInteractiveComponent.charLen);
                label.string = str;
            }

        }
    }
    // end

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

        // 默认处理
        NPCInteractiveProcessSystem.OnGotoNextState(npcEntity.npcInteractiveComponent, npcEntity.patrolAIComponent, npcEntity.baseComponent);
    }

}


