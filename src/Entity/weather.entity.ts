import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Weather {
@PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column()
  date!: Date;

  @Column()
  location!:string

  @Column('float')
  tempMin!: number;

  @Column('float')
  tempMax!: number;

  @Column()
  condition!: string;

}
