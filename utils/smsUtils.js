const objectify = (str) =>
  str
    .split('&')
    .flatMap((n) => n.split('='))
    .reduce((accum, curr, i, list) => {
      if (i % 2) {
        accum[list[i - 1]] = curr;
      }
      return accum;
    }, {});

export const parseSms = (str) => {
  const { Body, From, NumMedia, ...rest } = objectify(str);

  const media = Array.from(new Array(parseInt(NumMedia, 10))).map((_, i) => ({
    mediaType: decodeURIComponent(rest[`MediaContentType${i}`]),
    url: decodeURIComponent(rest[`MediaUrl${i}`]),
  }));

  return {
    media,
    phoneNumber: decodeURIComponent(From),
    text: decodeURIComponent(Body).split('+').join(' '),
  };
};
