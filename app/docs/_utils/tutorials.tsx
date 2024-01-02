import { CgCommunity } from 'react-icons/cg';
import { FaGamepad } from 'react-icons/fa';
import { FaBookOpen } from 'react-icons/fa';

export const cardItems = [
  {
    title: 'スタートガイド',
    description: 'NinjaGLの基本的な使い方を学ぶためのチュートリアルです',
    img: '/docs/starter.png',
    time: '30分',
    href: '/docs/tutorial/starter',
    icon: <FaBookOpen className='p-1 text-cyber' fill='currentColor' size={30} />,
  },
  {
    title: 'メタバースの作成',
    description: '簡単なカスタムメタバースの作成を行うチュートリアルです',
    img: '/docs/ninjaverse.png',
    time: '15分',
    href: '/docs/tutorial/metaverse',
    icon: <CgCommunity className='text-warning' fill='currentColor' size={30} />,
  },
  {
    title: 'バトルロワイアルゲームの作成',
    description: 'マルチプライヤーで遊べるバトロワ系ゲームを作成を行うチュートリアルです',
    img: '/docs/turborumblerunners.png',
    time: '30分',
    href: '/docs/tutorial/multi-game',
    icon: <FaGamepad className='text-success' fill='currentColor' size={30} />,
  },
];
