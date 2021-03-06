// __tests__/index.test.js
import React from 'react';
import ReactDOM from 'react-dom';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import '@testing-library/jest-dom/extend-expect';
import Search from '../pages/component/Search';
import Main from '../pages/Main';
import { resq$ } from 'resq';
import * as Api from '../api/FlightDataApi';
import nock from 'nock';
import { readFileSync } from 'fs';

console.error = (msg) => {
  if (
    msg
      .toString()
      .includes(
        'Warning: An update to Main inside a test was not wrapped in act'
      )
  ) {
    return () => {};
  } else return console.error;
};

describe('๐ก Part 1: ํญ๊ณต๊ถ ๋ชฉ๋ก ํํฐ๋ง', () => {
  describe('๐งฉ Main ์ปดํฌ๋ํธ์์ ํญ๊ณตํธ์ ์กฐํํฉ๋๋ค', () => {
    afterEach(() => {
      cleanup();
    });

    test('Main ์ปดํฌ๋ํธ ๋ด `search` ํจ์๋ ๊ฒ์ ์กฐ๊ฑด์ ๋ด๊ณ  ์๋ ์ํ ๊ฐ์ฒด `condition`์ ์๋ฐ์ดํธํด์ผ ํฉ๋๋ค', () => {
      const { getByTestId, container } = render(<Main />);
      act(() => {
        global.search({ departure: 'ICN', destination: 'CJU' });
      });

      const element = getByTestId('condition');
      expect(element.textContent).toBe(
        '{"departure":"ICN","destination":"CJU"}'
      );
    });
  });

  describe('๐งฉ Search ์ปดํฌ๋ํธ๋ฅผ ํตํด ์ํ ๋์ด์ฌ๋ฆฌ๊ธฐ๋ฅผ ํ์ตํฉ๋๋ค', () => {
    const container = document.createElement('div');

    afterEach(() => {
      cleanup();
    });

    test('๊ฒ์ ํ๋ฉด์ด Search ์ปดํฌ๋ํธ๋ก ๋ถ๋ฆฌ๋์ด์ผ ํฉ๋๋ค', () => {
      const { container } = render(<Search />);
      expect(container.querySelector('#input-departure')).not.toBeNull();
      expect(container.querySelector('#input-destination')).not.toBeNull();
      expect(container.querySelector('#search-btn')).not.toBeNull();
    });

    test('Search ์ปดํฌ๋ํธ์๋ ์ํ ๋ณ๊ฒฝ ํจ์ `search`๊ฐ `onSearch` props๋ก ์ ๋ฌ๋์ด์ผ ํฉ๋๋ค', () => {
      const { container } = render(<Main />);
      const onSearch = resq$('Search', container).props.onSearch;

      expect(typeof onSearch).toBe('function');
      expect(onSearch.name).toBe('search');
    });

    test('์ํ ๋ณ๊ฒฝ ํจ์ `search`๋ Search ์ปดํฌ๋ํธ์ `๊ฒ์` ๋ฒํผ ํด๋ฆญ ์ ์คํ๋์ด์ผ ํฉ๋๋ค', () => {
      const searchFn = jest.fn();
      const { getByRole } = render(<Search onSearch={searchFn} />, {
        container,
      });
      const btn = getByRole('button', { name: '๊ฒ์' });
      fireEvent.click(btn);

      expect(searchFn).toHaveBeenCalled();
    });
  });
});

describe('๐ก Part 2: AJAX ์์ฒญ', () => {
  describe('๐งฉ Side Effect๋ useEffect์์ ๋ค๋ค์ผ ํฉ๋๋ค', () => {
    afterEach(() => {
      cleanup();
    });

    test('๊ฒ์ ์กฐ๊ฑด์ด ๋ฐ๋ ๋๋ง๋ค, FlightDataApi์ getFlight๋ฅผ ๊ฒ์ ์กฐ๊ฑด๊ณผ ํจ๊ป ์์ฒญํด์ผ ํฉ๋๋ค', (done) => {
      const getFlightSpy = jest.spyOn(Api, 'getFlight');

      const { getByRole, container } = render(<Main />);
      const btn = getByRole('button', { name: '๊ฒ์' });
      const input = container.querySelector('#input-destination');

      fireEvent.change(input, { target: { value: 'CJU' } });
      fireEvent.click(btn);

      waitFor(() => {
        expect(getFlightSpy).toHaveBeenCalled();
        done();
      });
    });

    test('getFlight์ ๊ฒฐ๊ณผ๋ฅผ ๋ฐ์, flightList ์ํ๋ฅผ ์๋ฐ์ดํธํด์ผ ํฉ๋๋ค', async () => {
      const { getByRole, queryAllByText, container } = render(<Main />);
      const btn = getByRole('button', { name: '๊ฒ์' });
      const input = container.querySelector('#input-destination');

      fireEvent.change(input, { target: { value: 'CJU' } });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(queryAllByText('๐ฌ CJU').length).toBe(5); // ๋์ฐฉ์ง๊ฐ CJU์ด๋ฉด, ๊ฒฐ๊ณผ๊ฐ ๋ค์ฏ๊ฐ์๋๋ค

        // ๋ค๋ฅธ ๋์ฐฉ์ง๋ ํ๋ฉด์ ํ์๋์ง ์์ต๋๋ค
        expect(queryAllByText('๐ฌ BKK').length).toBe(0);
        expect(queryAllByText('๐ฌ PUS').length).toBe(0);
      });
    });

    test('๋์ด์, ์ปดํฌ๋ํธ ๋ด ํํฐ ํจ์ `filterByCondition`๋ฅผ ์ฌ์ฉํ์ง ์์ต๋๋ค', () => {
      // HINT: ์ฃผ์ ์ฒ๋ฆฌํ์ง ๋ง๊ณ , ํด๋น ๋ด์ฉ์ ์ง์์ผ ํ์คํธ์ ํต๊ณผํฉ๋๋ค
      expect(Main.toString().includes('filterByCondition')).toBe(false);
    });

    test('๋์ด์, ํ๋์ฝ๋ฉ๋ flightList JSON์ ์ฌ์ฉํ์ง ์์ต๋๋ค (์ด๊ธฐ๊ฐ์ ๋น ๋ฐฐ์ด๋ก ๋ก๋๋ค)', () => {
      // HINT: ์ฃผ์ ์ฒ๋ฆฌํ์ง ๋ง๊ณ , ํด๋น ๋ด์ฉ์ ์ง์์ผ ํ์คํธ์ ํต๊ณผํฉ๋๋ค
      const file = readFileSync(__dirname + '/../pages/index.js').toString();
      expect(file.includes("import json from '../resource/flightList'")).toBe(
        false
      );
    });

    test('getFlight ์์ฒญ์ด ๋ค์ ๋๋ฆฌ๋ฏ๋ก, ๋ก๋ฉ ์ํ์ ๋ฐ๋ผ LoadingIndicator ์ปดํฌ๋ํธ๋ฅผ ํ์ํด์ผ ํฉ๋๋ค', async () => {
      const { getByRole, getByAltText, container } = render(<Main />);
      const btn = getByRole('button', { name: '๊ฒ์' });
      const input = container.querySelector('#input-destination');

      fireEvent.change(input, { target: { value: 'CJU' } });
      fireEvent.click(btn);

      expect(getByAltText('now loading...')).not.toBeNull();
      await waitForElementToBeRemoved(() => getByAltText('now loading...'));
    });
  });

  describe('๐งฉ FlightDataApi์์ ๊ธฐ์กด ๊ตฌํ ๋์ , REST API๋ฅผ ํธ์ถํ๋๋ก ๋ฐ๊ฟ๋๋ค', () => {
    test('๊ฒ์ ์กฐ๊ฑด๊ณผ ํจ๊ป StatesAirline ์๋ฒ์์ ํญ๊ณตํธ ์ ๋ณด๋ฅผ ์์ฒญ(fetch)ํฉ๋๋ค', (done) => {
      const result = [
        {
          uuid: 'af6fa55c-da65-47dd-af23-578fdba40bod',
          departure: 'ICN',
          destination: 'CJU',
          departure_times: '2021-12-02T12:00:00',
          arrival_times: '2021-12-03T12:00:00',
        },
      ];

      const scope = nock(
        'http://ec2-13-124-90-231.ap-northeast-2.compute.amazonaws.com:81'
      )
        .persist()
        .get('/flight?departure=ICN&destination=CJU')
        .reply(200, result);

      Api.getFlight({ departure: 'ICN', destination: 'CJU' }).then((json) => {
        expect(json).toEqual(result);
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount).toEqual(1); // ajax call์ด 1ํ ๋ฐ์
        expect(scope.interceptors[0].statusCode).toEqual(200);
        done();
      });
    });
  });
});
