import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Shop} from './shop.entity';

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shop, (shop) => shop.sessions, {onDelete: 'CASCADE'})
    shop: Shop;

    @Column({name: 'shop_id'})
    shopId: number;

    @Column({unique: true, name: 'shopify_cart_id'})
    shopifyCartId: string;

    @Column({type: 'json', name: 'cart_data'})
    cartData: Record<string, any>;

    @Column({type: 'decimal', nullable: true})
    value: string | null; // numeric in PG is returned as string

    @Column({type: 'decimal', nullable: true, name: 'value_usd'})
    valueUSD: string | null;

    @Column({type: 'int', nullable: true, name: 'item_count'})
    itemCount: number | null;

    @Column({type: 'datetime', nullable: true, name: 'cart_updated_at'})
    cartUpdatedAt: Date | null;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;
}