import { DocumentData } from "firebase/firestore";
import Link from "next/link";
import React from 'react'

type PostFeedProps = {
  posts: IPostItem[];
  admin?: boolean;
};

export default function PostFeed({ posts, admin }: PostFeedProps) 
{
  return (
    <>
      { posts ? posts.map( ( post ) => <PostItem post={ post } key={ post?.slug } admin={ admin }/> ) : null }
    </>
    )
}

type PostItemProps = {
  admin: boolean | undefined;
  post: IPostItem;
}

interface IPostItem extends DocumentData
{
  slug: string;
  title: string;
  username: string;
  content: string;
  heartCount: number;
}

function PostItem({ post, admin = false }: PostItemProps ) 
{
  // Native method to calc word count and read time
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = ( wordCount / 100 + 1 ).toFixed(0);

  // TODO: Add a delete & edit button to admin page

  return (
    <div className="card">
      <Link href={`/${post?.username}`}>
        <a>
          <strong>By @{ post?.username }</strong>
        </a>
      </Link>
      
      <Link href={`/${post?.username}/${post?.slug}`}>
        <h2>
          <a>{ post?.title }</a>
        </h2>
      </Link>

      <footer>
        <span>
          { wordCount } words. { minutesToRead } min read.
        </span>
        <span>💖 { post?.heartCount } Hearts</span>
      </footer>

    </div>
  )
}