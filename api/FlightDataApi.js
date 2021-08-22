import flightList from '../resource/flightList';
import fetch from 'node-fetch';

if (typeof window !== 'undefined') {
  localStorage.setItem('flight', JSON.stringify(flightList));
}

export function getFlight(filterBy = {}) {
  // HINT: 가장 마지막 테스트를 통과하기 위해, fetch를 이용합니다. 아래 구현은 완전히 삭제되어도 상관없습니다.
  // TODO: 아래 구현을 REST API 호출로 대체하세요.
  let query = '';
  if (filterBy.departure) query = query + `departure=${filterBy.departure}&`;

  if (filterBy.destination)
    query = query + `destination=${filterBy.destination}`;

  let url = `http://ec2-13-124-90-231.ap-northeast-2.compute.amazonaws.com:81/flight?${query}`;

  return fetch(url).then((response) => response.json());
}
