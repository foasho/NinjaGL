import Head from 'next/head';
import { Inter } from '@next/font/google';
import styles from '../App.module.scss';
import { NaniwaJS } from '@/engine/NaniwaJS';
import { NextPageContext } from 'next';
import { useRouter } from "next/router";

const inter = Inter({ subsets: ['latin'] })

function Home() {
    const router = useRouter();
    const { json } = router.query;

    return (
        <>
            <Head>
                <title></title>
                <meta name="ReactGameEngine" content="NaniwaJS" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <NaniwaJS jsonPath={json? json.toString(): null} />
            </main>
        </>
    )
}




export default Home;