import Head from 'next/head'
import TestSlate from './TestSlate'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TestSlate />
    </div>
  )
}
