import React from 'react';
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { Timestamp } from "firebase/firestore";

interface PostContentProps {
  post: {
    title: string;
    content: string;
    slug: string;
    username: string;
    heartCount: number;
    published: true;
    createdAt: number | Timestamp;
    updatedAt: number | Timestamp;
  }
}

export default function PostContent({ post }: PostContentProps) 
{
  const createdAt = typeof post.createdAt === "number" ? new Date( post.createdAt ) : post.createdAt.toDate();  

  return (
    <div className="card">
      <h1>{ post.title }</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={ `/${ post.username }/` }>
          <a className="text-info">@{ post.username }</a>
        </Link>{" "}
        on { createdAt.toDateString() }
      </span>

      <ReactMarkdown>{ post.content }</ReactMarkdown>
    </div>
  )
}
