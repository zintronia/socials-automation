export abstract class BaseModel {
    id!: number;
    created_at!: Date;
    updated_at!: Date;

    constructor(data: Partial<BaseModel>) {
        Object.assign(this, data);
    }

    static serialize<T extends BaseModel>(instance: T): Record<string, any> {
        const serialized = { ...instance };
        return {
            ...serialized,
            created_at: instance.created_at instanceof Date ? instance.created_at.toISOString() : instance.created_at,
            updated_at: instance.updated_at instanceof Date ? instance.updated_at.toISOString() : instance.updated_at
        };
    }
} 