import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Session} from './session.entity';

@Entity()
export class Shop {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    domain: string;

    @Column()
    currency: string;

    @OneToMany(() => Session, (session) => session.shop)
    sessions: Session[];

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;
}
