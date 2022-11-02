export const handleProxy = async request => {
  const { pathname } = new URL(decodeURIComponent(request.query.i));
  const [, fileType] = pathname.split('.');
  return fetch(request.query.i);
};
