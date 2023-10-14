
export class LifeAttrComponent {
    public hp: number = 100; // 当前的hp, 100 根据等级等，从配置表里面计算出来的;
    public baseAttack: number = 10; // 根据等级从配置表里面计算的；基础+招数*加权
    public defense: number = 3; // 防御力, 从我们等级 + 装备--》计算出来;

    public mp: number = 100; // 魔法值;
    
}


