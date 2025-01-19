import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Favorite } from './favorite.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  surname: string;

  @Column()
  patronimic: string;

  @Column()
  password: string;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
