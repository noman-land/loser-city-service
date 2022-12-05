export const getLoser = async (threadTsOrPhoneNumber, env) => {
  const {
    results: [result = {}],
  } = await env.D1.prepare(
    'SELECT * FROM losers WHERE threadTs = ? OR phoneNumber = ?'
  )
    .bind(threadTsOrPhoneNumber, threadTsOrPhoneNumber)
    .all();

  return result;
};

export const saveThread = async ({ phoneNumber, threadTs }, env) => {
  const { results } = await env.D1.prepare(
    'INSERT INTO losers (phoneNumber, threadTs) VALUES (?, ?)'
  )
    .bind(phoneNumber, threadTs)
    .all();

  return results;
};

export const setName = async ({ name, phoneNumber }, env) => {
  const { results } = await env.D1.prepare(
    'UPDATE losers SET name = ? WHERE phoneNumber = ?'
  )
    .bind(name, phoneNumber)
    .all();

  return results;
};

export const setPhoneNumber = async ({ phoneNumber, threadTs }, env) => {
  const { results } = await env.D1.prepare(
    'UPDATE losers SET phoneNumber = ? WHERE threadTs = ?'
  )
    .bind(phoneNumber, threadTs)
    .all();

  return results;
};

export const setThreadTs = async ({ phoneNumber, threadTs }, env) => {
  const { results } = await env.D1.prepare(
    'UPDATE losers SET threadTs = ? WHERE phoneNumber = ?'
  )
    .bind(threadTs, phoneNumber)
    .all();

  return results;
};

export const setBlocked = async (phoneNumber, env) => {
  const { results } = await env.D1.prepare(
    'UPDATE losers SET blocked = true WHERE phoneNumber = ?'
  )
    .bind(phoneNumber)
    .all();

  return results;
};

export const deleteThread = async (phoneNumber, env) => {
  const { results } = await env.D1.prepare(
    'DELETE FROM losers WHERE phoneNumber = ?'
  )
    .bind(phoneNumber)
    .all();

  return results;
};
