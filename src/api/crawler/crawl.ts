'use server';

import type { NextApiRequest, NextApiResponse } from 'next';
import { Element, load } from 'cheerio';
import { ReserveTime } from '@/recoil/reserve-time';
import puppeteer, { Browser } from 'puppeteer';
import dayjs from 'dayjs';
import { Place, Room } from './type';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    dummy: 'hello',
  });
}

const getHtml = async (browser: Browser, url: string) => {
  try {
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.content();
    return load(content);
  } catch (error) {
    console.log(error);
  }
};

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

    if ($ == undefined) {
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

      if ($ == undefined) {
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

    if (place.rooms.length > 0) {
      places.push(place);
    }
  }

  console.log(places);

  return places;
};
