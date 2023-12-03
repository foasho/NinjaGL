'use client';
import React, { useMemo } from 'react';

import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { FiBox } from 'react-icons/fi';

import { SNSLinkPreview } from './SNSLinkPreview';

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
});

/**
 * Color
 */
const COLOR = {
  primary: '#BA68C8',
  secondary: '#23C9F9',
  third: '#FFA500',
  strong: '#222121',
};

/**
 * プレビュー
 */
export const Preview = ({ markdown }: { markdown: string }) => {
  // markdownの中身ヘッダーおよびサブヘッダーのツリー構造を作成する
  const createHeaderTree = useMemo(() => {
    const headerTree: any[] = [];
    const lines = markdown.split('\n');
    // Codeの記述は無視する ```で囲まれた部分は無視する
    let isCode = false;
    const withoutLines = lines.filter((line) => {
      if (line.startsWith('```')) {
        isCode = !isCode;
      }
      return !isCode;
    });

    let currentHeader: any;
    if (markdown) {
      withoutLines.forEach((line) => {
        // #の数でヘッダーのレベルを判定し、##までchildrenに格納する
        const headerLevel = line.match(/^#+/);
        if (headerLevel) {
          const header = line.replace(/^#+/, '').trim();
          if (headerLevel[0].length === 1) {
            currentHeader = {
              header,
              children: [],
            };
            headerTree.push(currentHeader);
          } else if (headerLevel[0].length === 2) {
            currentHeader.children.push({
              header,
            });
          }
        }
      });
    }
    return headerTree;
  }, [markdown]);

  return (
    <div className='container mx-auto pt-12'>
      <div className='w-full md:inline-block md:w-3/4'>
        <MarkdownPreview
          wrapperElement={{
            'data-color-mode': 'light',
          }}
          source={markdown}
          components={{
            p: ({ children }) => (
              <>
                {children && Array.isArray(children) ? (
                  <>
                    {children.map((p, i) => {
                      if (typeof p === 'string') {
                        const splitP = p.split('\n');
                        return splitP.map((p, j) => (
                          <p key={`${p}${i}_${j}`} className={'pl-3'}>
                            {p}
                          </p>
                        ));
                      }
                      return (
                        <p key={`${p}${i}`} className={'pl-3'}>
                          {p}
                        </p>
                      );
                    })}
                  </>
                ) : (
                  <>{children}</>
                )}
              </>
            ),
            a: ({ children, href, node: { properties } }: { children: any; href: string; node: any }) => {
              // リンク付きの場合は、OGPを表示する
              if (href && href.startsWith('http')) {
                return (
                  <>
                    <SNSLinkPreview text={href} />
                  </>
                );
              }
              return <a {...properties}></a>;
            },
            br: ({ children }) => {
              return (
                <>
                  {children}
                  <br />
                </>
              );
            },
            h1: ({ children }) => {
              const textContent = React.Children.toArray(children).find((child) => typeof child === 'string');
              return (
                <div
                  id={`${textContent}`}
                  className='!border-none py-7 text-2xl font-bold md:text-3xl'
                  style={{
                    color: COLOR.primary,
                  }}
                >
                  <div className='mr-2 inline-block animate-slowspin'>
                    <FiBox size={16} />
                  </div>
                  <div className='inline-block'>{children}</div>
                </div>
              );
            },
            h2: ({ children }) => {
              const textContent = React.Children.toArray(children).find((child) => typeof child === 'string');
              return (
                <div
                  id={`${textContent}`}
                  className={`!border-none py-3 pl-2 text-xl font-bold md:text-2xl`}
                  style={{
                    color: COLOR.secondary,
                  }}
                >
                  {children}
                </div>
              );
            },
            h3: ({ children }) => {
              return (
                <div
                  className={`!border-none py-2 pl-3 text-lg font-bold md:text-xl`}
                  style={{
                    color: COLOR.third,
                  }}
                >
                  {children}
                </div>
              );
            },
            h4: ({ children }) => {
              return (
                <div
                  className={`!border-none py-2 pl-3 text-lg font-bold md:text-xl`}
                  style={{
                    color: COLOR.third,
                  }}
                >
                  {children}
                </div>
              );
            },
            strong: ({ children }) => {
              return (
                <strong
                  style={{
                    color: COLOR.strong,
                    fontWeight: 'bold',
                  }}
                >
                  {children}
                </strong>
              );
            },
          }}
        />
      </div>
      <div className='fixed bottom-2 right-2 z-10 hidden md:inline-block md:w-1/4'>
        <div className='px-2 py-4'>
          {/** ツリー構造のナビゲーション */}
          <div className='mb-4 text-xl font-bold' style={{ color: COLOR.third }}>
            目次
          </div>
          <div className='text-sm'>
            {createHeaderTree.map((header, idx) => {
              return (
                <div key={`header-${idx}`}>
                  <div className='mb-2'>
                    <a
                      href={'#' + header.header}
                      style={{
                        color: COLOR.primary,
                      }}
                      className='font-bold hover:underline'
                    >
                      {header.header}
                    </a>
                  </div>
                  {header.children.map((child, idx) => {
                    return (
                      <div key={`child-${idx}`} className='mb-2 ml-4'>
                        <a
                          href={'#' + child.header}
                          style={{
                            color: COLOR.secondary,
                          }}
                          className='font-bold hover:underline'
                        >
                          {child.header}
                        </a>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
