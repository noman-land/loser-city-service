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

export const insertThread = async ({ phoneNumber, threadTs }, env) => {
  const {
    results: [result],
  } = await env.D1.prepare(
    'INSERT INTO losers (phoneNumber, threadTs) VALUES (?, ?) RETURNING *'
  )
    .bind(phoneNumber, threadTs)
    .all();

  return result;
};

export const setName = async ({ name, phoneNumber }, env) => {
  const {
    results: [result],
  } = await env.D1.prepare(
    'UPDATE losers SET name = ? WHERE phoneNumber = ? RETURNING *'
  )
    .bind(name, phoneNumber)
    .all();

  return result;
};

export const setThreadTs = async ({ phoneNumber, threadTs }, env) => {
  const {
    results: [result],
  } = await env.D1.prepare(
    'UPDATE losers SET threadTs = ? WHERE phoneNumber = ? RETURNING *'
  )
    .bind(threadTs, phoneNumber)
    .all();

  return result;
};

export const setBlocked = async (phoneNumber, env) => {
  const {
    results: [result],
  } = await env.D1.prepare(
    'UPDATE losers SET blocked = true WHERE phoneNumber = ? RETURNING *'
  )
    .bind(phoneNumber)
    .all();

  return result;
};

export const setUnblocked = async (phoneNumber, env) => {
  const {
    results: [result],
  } = await env.D1.prepare(
    'UPDATE losers SET blocked = false WHERE phoneNumber = ? RETURNING *'
  )
    .bind(phoneNumber)
    .all();

  return result;
};

export const deleteThread = async (phoneNumber, env) => {
  const { results } = await env.D1.prepare(
    'UPDATE losers SET threadTs = NULL WHERE phoneNumber = ?'
  )
    .bind(phoneNumber)
    .all();

  return results;
};
