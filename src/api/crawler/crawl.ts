'use server';

//https://velog.io/@segyeom_dev/Crawling-puppeteer

import type { NextApiRequest, NextApiResponse } from 'next';
import { Element, load } from 'cheerio';
import { ReserveTime } from '@/recoil/reserve-time';
import puppeteer, { Browser } from 'puppeteer';
import dayjs from 'dayjs';
import { Place, Room, PlaceInfo } from './type';
import { Milonga } from 'next/font/google';

export const getPlaceUrl = async (id: string) => {
  return `http://map.naver.com/p/entry/place/${id}?c=15.00,0,0,0,dh`;
};

export const getBookingUrl = async (id: string) => {
  return `http://pcmap.place.naver.com/place/${id}/ticket`;
};

export const findEmptyRooms = async ({
  reserveTime,
  urls,
}: {
  reserveTime: ReserveTime;
  urls: string[];
}) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

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
      return null;
    }

    let place: Place = {
      name: $('#_title > div >:first-child').text()!,
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
        roomUrl + `&startDate=${dayjs(reserveTime.date!).format('YYYY-MM-DD')}`
      );
      await page.waitForSelector('ul.time_list');

      const content = await page.content();
      const $ = load(content);
      page.close();

      if ($ === undefined) {
        return null;
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
      for (let i = reserveTime.from!; i < reserveTime.to!; i++) {
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
  return places;
};

export const searchPlaceInNaverMap = async (word: string) => {
  const browser = await puppeteer.launch({
    args: ['--disabled-features=site-per-process'],
    headless: true,
  });

  const searchUrl = `https://map.naver.com/p/search/${word}`;

  const page = await browser.newPage();
  await page.goto(searchUrl);

  let frame;

  try {
    frame = await page.waitForFrame(
      async (frame) => frame.name() === 'searchIframe'
    );
  } catch (error) {
    console.log(error);
  }

  if (frame === undefined) {
    alert('검색 결과가 없습니다');
    return;
  }

  // const places = await frame.$$('#_pcmap_list_scroll_container > ul > li');
  const places = await frame.$$eval(
    '.place_bluelink > span:first-child',
    (elements) => Array.from(elements.map((element) => element.innerText))
  );

  return places;
};

export const getPlaceInfo = async (name: string): Promise<PlaceInfo | null> => {
  let browser = await puppeteer.launch({
    headless: true,
  });

  let page = await browser.newPage();
  const searchUrl = `https://map.naver.com/p/search/${name}`;
  await page.goto(searchUrl);

  let pageUrl = page.url();
  let placeNumber: string;

  await page.waitForSelector('#searchIframe');

  if (pageUrl.search('place/') === -1) {
    let frame = await page.waitForFrame(
      async (frame) => frame.name() === 'searchIframe'
    );

    if (frame === undefined) {
      alert('error');
      return null;
    }

    await frame.click(
      '#_pcmap_list_scroll_container > ul > li:first-child .place_bluelink'
    );
    let detailFrame = await page.waitForFrame(
      async (frame) => frame.name() === 'entryIframe'
    );

    if (detailFrame === undefined) {
      alert('error');
      return null;
    }

    const $ = load(await detailFrame.content());

    if ($ === undefined) return null;

    pageUrl = $('.place_section > div:nth-child(4) a').attr('href')!;
    placeNumber = pageUrl.split('place/')[1].split('/booking')[0];
    console.log(pageUrl);
  } else {
    placeNumber = pageUrl.split('place/')[1].split('?')[0];
  }

  return {
    name: name,
    id: placeNumber,
    photoUrl: 'temp',
  };
};

export const findEmptyRooms2 = async (
  placeUrls: string[],
  reserveTime: ReserveTime
) => {
  const browser = await puppeteer.launch();

  const places = await Promise.all(
    Array.from(
      placeUrls.map((placeUrl) => getPlaceData(browser, placeUrl, reserveTime))
    )
  );

  return places.filter((place): place is NonNullable<Place> => place !== null);
};

export const getPlaceData = async (
  browser: Browser,
  placeUrl: string,
  reserveTime: ReserveTime
) => {
  const page = await browser.newPage();
  await page.goto(placeUrl);

  // await page.$eval('#_title > div >:first_child', (e) =>
  //   e.getAttribute('href')
  // );

  const content = await page.content();
  const $ = load(content);
  page.close();

  if ($ === undefined) return null;

  let place: Place = {
    name: $('#_title > div >:first-child').text()!,
    url: placeUrl,
    photoUrl: 'temp',
    rooms: [],
  };

  let roomUrls: string[] = [];
  $('div.place_section_content ul li').map((index, element) => {
    roomUrls[index] = $(element).find('li > div > a').attr('href')!;
  });

  const roomDatas = await Promise.all(
    Array.from(
      roomUrls.map((roomUrl) => getRoomData(browser, roomUrl, reserveTime))
    )
  );

  const rooms = roomDatas.filter(
    (roomData): roomData is NonNullable<Room> => roomData !== null
  );

  place.rooms = rooms;

  return place;
};

export const getRoomData = async (
  browser: Browser,
  roomUrl: string,
  reserveTime: ReserveTime
) => {
  const page = await browser.newPage();
  page.goto(
    roomUrl + `&startDate=${dayjs(reserveTime.date!).format('YYYY-MM-DD')}`
  );
  await page.waitForSelector('ul.time_list');

  const content = await page.content();
  const $ = load(content);
  page.close();

  if ($ === undefined) {
    return null;
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

  for (let i = reserveTime.from!; i < reserveTime.to!; i++) {
    if (timeClasses[i].search('disabled') != -1) {
      return null;
    }
  }

  return room;
};