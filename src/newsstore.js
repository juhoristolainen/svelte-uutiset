export const getAllNews = fetch(
  'https://api.il.fi/v1/columns/sidecolumns/uutiset'
)
  .then((response) => response.json())
  .then((data) => {
    return data.response[0].blocks[0].content.articles;
  });

export const getSportNews = fetch(
  'https://api.il.fi/v1/columns/sidecolumns/urheilu'
)
  .then((response) => response.json())
  .then((data) => {
    return data.response[0].blocks[0].content.articles;
  });

export const getEntNews = fetch(
  'https://api.il.fi/v1/columns/sidecolumns/viihde'
)
  .then((response) => response.json())
  .then((data) => {
    return data.response[0].blocks[0].content.articles;
  });
