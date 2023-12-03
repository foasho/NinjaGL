import { NextResponse } from 'next/server';
import openGraphScraper from 'open-graph-scraper';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (typeof url === 'string') {
    const options = {
      url,
      onlyGetOpenGraphInfo: false,
      customMetaTags: [
        {
          fieldName: 'twitterCard',
          multiple: false,
          property: 'twitter:card'
        },
        {
          fieldName: 'twitterCard',
          multiple: false,
          property: 'twitter:site'
        },
        {
          fieldName: 'twitterCard',
          multiple: false,
          property: 'twitter:title'
        },
        {
          fieldName: 'twitterCard',
          multiple: false,
          property: 'twitter:description'
        },
        {
          fieldName: 'twitterCard',
          multiple: false,
          property: 'twitter:image'
        },
      ]
    };
    const data = await openGraphScraper(options)
      .then((data) => {
        // OGP によるデータ取得が失敗した場合
        if (!data.result.success) {
          return null;
        }
        // OGP によるデータ取得が成功した場合
        return data.result;
      })
      .catch((error) => {
        return null;
      });
    if (data) {
      // ogTitleがなく,twitterTitleがある場合はtwitterTitleをogTitleにする
      if (!data.ogTitle && data.twitterTitle) {
        data.ogTitle = data.twitterTitle;
      }
      // ogImageがなく,twitterImageがある場合はtwitterImageをogImageにする
      if (!data.ogImage && data.twitterImage) {
        data.ogImage = data.twitterImage;
      }
      // ogDescriptionがなく,twitterDescriptionがある場合はtwitterDescriptionをogDescriptionにする
      if (!data.ogDescription && data.twitterDescription) {
        data.ogDescription = data.twitterDescription;
      }
      // ogUrlがなく,requestUrlがある場合はrequestUrlをogUrlにする
      if (!data.ogUrl && data.requestUrl) {
        data.ogUrl = data.requestUrl;
      }
      // ogImageもなく、twitterImageもなく、faviconがある場合はfaviconをogImageにする
      if (!data.ogImage && !data.twitterImage && data.favicon) {
        data.ogImage = [
          {
            url: data.favicon,
          }
        ];
      }
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
}