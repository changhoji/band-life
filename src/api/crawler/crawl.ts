'use server';

//https://velog.io/@segyeom_dev/Crawling-puppeteer

import type { NextApiRequest, NextApiResponse } from 'next';
import { Element, load } from 'cheerio';
import { ReserveTime } from '@/recoil/reserve-time';
import puppeteer, { Browser } from 'puppeteer';
import dayjs from 'dayjs';
import { Place, Room, SearchedPlace } from './type';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    dummy: 'hello',
  });
}

export const findEmptyRooms = async ({
  reserveTime,
  urls,
}: {
  reserveTime: ReserveTime;
  urls: string[];
}) => {
  const browser = await puppeteer.launch({});

  let places: Place[] = [];

  /**
   * @todo Promise 여러개를 처리하고 끝나길 기다리는 코드로 바꾸기
   * (지금처럼 하면 하나하나 순서대로 기다리기 때문에 너무 오래걸림)
   */
  for (const placeUrl of urls) {
    const page = await browser.newPage();
    await page.goto(placeUrl);

    const content = await page.content();
    const $ = load(content);
    page.close();

    if ($ === undefined) {
      return;
    }

    let place: Place = {
      name: $('#_title > div:first-child').text()!,
      url: placeUrl,
      photoUrl: 'temp',
      rooms: [],
    };

    let roomUrls: string[] = [];
    const rooms = $('div.place_section_content ul li');
    rooms.map((index, element) => {
      roomUrls[index] = $(element).find('li > div > a').attr('href')!;
    });

    // work with each room
    for (const roomUrl of roomUrls) {
      // detect whether this rooms is available
      const page = await browser.newPage();

      await page.goto(
        roomUrl + `&startDate=${dayjs(reserveTime.date).format('YYYY-MM-DD')}`
      );
      await page.waitForSelector('ul.time_list');

      const content = await page.content();
      const $ = load(content);
      page.close();

      if ($ === undefined) {
        return;
      }

      let room: Room = {
        name: $('h3.info_title').text(),
        url: roomUrl,
        photoUrl: 'temp',
        price: Number(
          $('.compo_book_price > span > strong').text()!.replace(',', '')
        ),
      };

      let timeClasses: string[] = [];
      const times = $('ul.time_list > li');
      times.map((index, element) => {
        timeClasses[index] = $(element).attr('class')!;
      });

      let flag: boolean = true;
      for (let i = reserveTime.from; i < reserveTime.to; i++) {
        if (timeClasses[i].search('disabled') != -1) {
          flag = false;
          break;
        }
      }

      if (flag) {
        place.rooms.push(room);
      }
    }

    //   if (place.rooms.length > 0) {
    //     places.push(place);
    //   }
    // }
  }
  return places;
};

export const searchPlaceInNaverMap = async (word: string) => {
  const browser = await puppeteer.launch({
    args: ['--disabled-features=site-per-process'],
    headless: true,
  });

  let places: SearchedPlace[] = [];
  const searchUrl = `https://map.naver.com/p/search/${word}`;

  const page = await browser.newPage();
  await page.goto(searchUrl);
  await page.waitForNetworkIdle({ idleTime: 250 });

  let frame;

  try {
    frame = await page.waitForFrame(async frame => {
      return frame.name() === 'searchIframe'
    })
  } catch (error) {
    console.log(error);
  }

  if (frame === undefined) {
    alert('검색 결과가 없습니다');
    return;
  }

  const placeCount = (await frame.$$('#_pcmap_list_scroll_container > ul > li')).length;

  let searchedPlace: SearchedPlace[] = [];
  for(let i = 1; i < placeCount; i++) {
    await frame.click(`#_pcmap_list_scroll_container > ul > li:nth-child(${i}) .place_bluelink`);
    let detailFrame = await page.waitForFrame(async frame => frame.name() === 'entryIframe');

    if (detailFrame === undefined) continue;

    const $ = load(await detailFrame.content());

    if ($ ===  undefined) continue;

    const info: SearchedPlace = {
      name: $('#_title > div > span:first-child').text()!,
      url: page.url(),
      bookingUrl: `http://pcmap.${$('.place_section > div:nth-child(4) a').attr('href')}`,
      photoUrl: 'temp',
    }

    searchedPlace.push(info);
  }


  return searchedPlace;
};
