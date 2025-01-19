import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Favorite } from './index';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  socialImage: string;

  @Column({ nullable: true })
  tags: string;

  @Column()
  slug: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  canonicalUrl: string;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  positiveReactionsCount: number;

  @Column({ nullable: true })
  collectionId: string | null;

  @Column({ nullable: true })
  readingTimeMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Favorite, (favorite) => favorite.article)
  favorites: Favorite[];
}
