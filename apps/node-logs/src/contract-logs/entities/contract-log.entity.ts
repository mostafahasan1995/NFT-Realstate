import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ContractLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventName: string;

  @Column()
  eventSignature: string;

  @Column({type: 'jsonb'})
  eventData: object;

  @Column()
  txHash: string;

  @Column()
  contractAddress: string;

  @Column()
  txTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
