import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userid' })
  user: User;

  @ManyToOne(() => Article, (article) => article.favorites)
  @JoinColumn({ name: 'articleId' })
  article: Article;
}
