import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Buffer } from "buffer";
import { b64EncodeUnicode } from '@/commons/functional';

const Login: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      {
        // セッションがある場合、ログアウトを表示
        session && (
          <div>
            <h1>ようこそ, {session.user && session.user.name}さん</h1>
            <h2>ID: {b64EncodeUnicode(session.user.email)}</h2>
            <button onClick={() => signOut()}>ログアウト</button>
          </div>
        )
      }
      {
        // セッションがない場合、ログインを表示
        // ログインボタンを押すと、ログインページに遷移する
        !session && (
          <div>
            <p>ログインしていません</p>
            <button onClick={() => signIn()}>ログイン</button>
          </div>
        )
      }
      <div style={{ paddingTop: "15px" }}>
        <Link href={"/"}>
          <span>エディタページへ</span>
        </Link>
      </div>
    </>
  );
};

export default Login;