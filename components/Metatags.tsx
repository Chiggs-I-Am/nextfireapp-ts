import Head from "next/head";
import React from 'react';

type MetatagsProps = {
  title: string;
  description: string;
  image?: string;
};

export default function Metatags({ title, description, image, }: MetatagsProps)
{
  return (
    <Head>
      <title>{ title }</title>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@chiigs_i_am" />
      <meta name="twitter:title" content={ title } />
      <meta name="twitter:description" content={ description } />
      <meta name="twitter:image" content={ image } />

      <meta property="og:title" content={ title } />
      <meta property="og:description" content={ description } />
      <meta property="og:image" content={ image } />
    </Head>
  )
}
