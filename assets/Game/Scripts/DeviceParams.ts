import { Size, view } from "cc";

export class DeviceParams  {
    private static _winSize: Size;
    /**游戏窗口大小 */
    public static get winSize(): Size {

        if(this._winSize == null)
        {
            this._winSize = view.getVisibleSize();
        }

        return this._winSize;
    }
}


