import flightList from '../resource/flightList';
import fetch from 'node-fetch';

if (typeof window !== 'undefined') {
  localStorage.setItem('flight', JSON.stringify(flightList));
}

export function getFlight(filterBy = {}) {
  // HINT: 가장 마지막 테스트를 통과하기 위해, fetch를 이용합니다. 아래 구현은 완전히 삭제되어도 상관없습니다.
  // TODO: 아래 구현을 REST API 호출로 대체하세요.
  let query = '';
  let dep =
    filterBy.departure === '' || filterBy.departure === undefined
      ? ''
      : `departure=${filterBy.departure}`;
  let des =
    filterBy.destination === '' || filterBy.destination === undefined
      ? ''
      : `destination=${filterBy.destination}`;

  if (dep !== '' && des !== '') {
    dep += '&';
    query = '?' + dep + des;
  } else if (dep !== '') {
    query = '?' + dep;
  } else if (des !== '') {
    query = '?' + des;
  }

  let url = `http://ec2-13-124-90-231.ap-northeast-2.compute.amazonaws.com:81/flight${query}`;

  console.log(url);

  return fetch(url).then((resp) => resp.json());
}
