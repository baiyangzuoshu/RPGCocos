
export class TrackAttackComponent {
    public trackTarget: any = null; // entity;
    public attackId: number = 90001; // 追上以后, 发起攻击方式Id;

    public trackTime: number = 0.5 // 每隔0.5，发现如果目标不在了，我们追一下;
}


