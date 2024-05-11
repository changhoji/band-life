'use client';

import { ReactNode } from 'react';
// https://medium.com/@kuwon15/nextjs-13-prettier-eslint-recoil-%EC%B4%88%EA%B8%B0-%EC%84%B8%ED%8C%85-%ED%95%98%EA%B8%B0-abc07bdbeb7f

import { RecoilRoot } from 'recoil';

export default function RecoilRootBox({ children }: { children: ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
